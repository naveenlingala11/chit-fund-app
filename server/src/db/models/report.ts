import { query } from '../index';

export class ReportModel {
  // Get aggregate overview metrics for foreman
  static async getOverview(foremanId: string) {
    // Total collected (verified payments across all foreman's chits)
    const collectedRes = await query(`
      SELECT COALESCE(SUM(p.amount_paid), 0) as total_collected
      FROM payments p
      JOIN chits c ON p.chit_id = c.id
      WHERE c.foreman_id = $1 AND p.payment_status = 'verified'
    `, [foremanId]);

    // Total pending (pending_approval payments)
    const pendingRes = await query(`
      SELECT COALESCE(SUM(p.amount_paid), 0) as total_pending,
             COUNT(*) as pending_count
      FROM payments p
      JOIN chits c ON p.chit_id = c.id
      WHERE c.foreman_id = $1 AND p.payment_status = 'pending_approval'
    `, [foremanId]);

    // Total commission earned
    const commissionRes = await query(`
      SELECT COALESCE(SUM(a.foreman_commission), 0) as total_commission
      FROM auctions a
      JOIN chits c ON a.chit_id = c.id
      WHERE c.foreman_id = $1 AND a.status = 'completed'
    `, [foremanId]);

    // Total chit groups + active count
    const chitsRes = await query(`
      SELECT 
        COUNT(*) as total_chits,
        COUNT(*) FILTER (WHERE status = 'active') as active_chits,
        COUNT(*) FILTER (WHERE status = 'recruiting') as recruiting_chits,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_chits,
        COALESCE(SUM(chit_value), 0) as total_portfolio
      FROM chits WHERE foreman_id = $1
    `, [foremanId]);

    // Total members across all chits
    const membersRes = await query(`
      SELECT COUNT(DISTINCT cm.user_id) as total_members
      FROM chit_members cm
      JOIN chits c ON cm.chit_id = c.id
      WHERE c.foreman_id = $1
    `, [foremanId]);

    // Auctions completed
    const auctionsRes = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE a.status = 'completed') as completed_auctions,
        COUNT(*) FILTER (WHERE a.status = 'upcoming') as upcoming_auctions
      FROM auctions a
      JOIN chits c ON a.chit_id = c.id
      WHERE c.foreman_id = $1
    `, [foremanId]);

    return {
      totalCollected: parseFloat(collectedRes.rows[0]?.total_collected || '0'),
      totalPending: parseFloat(pendingRes.rows[0]?.total_pending || '0'),
      pendingPaymentsCount: parseInt(pendingRes.rows[0]?.pending_count || '0'),
      totalCommission: parseFloat(commissionRes.rows[0]?.total_commission || '0'),
      totalChits: parseInt(chitsRes.rows[0]?.total_chits || '0'),
      activeChits: parseInt(chitsRes.rows[0]?.active_chits || '0'),
      recruitingChits: parseInt(chitsRes.rows[0]?.recruiting_chits || '0'),
      completedChits: parseInt(chitsRes.rows[0]?.completed_chits || '0'),
      totalPortfolio: parseFloat(chitsRes.rows[0]?.total_portfolio || '0'),
      totalMembers: parseInt(membersRes.rows[0]?.total_members || '0'),
      completedAuctions: parseInt(auctionsRes.rows[0]?.completed_auctions || '0'),
      upcomingAuctions: parseInt(auctionsRes.rows[0]?.upcoming_auctions || '0'),
    };
  }

  // Get per-chit-group collection stats
  static async getChitGroupStats(foremanId: string) {
    const res = await query(`
      SELECT 
        c.id, c.name, c.chit_value, c.members_count, c.status, c.start_date,
        c.monthly_subscription, c.foreman_commission_pct,
        (SELECT COUNT(*) FROM auctions a WHERE a.chit_id = c.id AND a.status = 'completed') as completed_months,
        (SELECT COALESCE(SUM(p.amount_paid), 0) FROM payments p WHERE p.chit_id = c.id AND p.payment_status = 'verified') as total_collected,
        (SELECT COALESCE(SUM(p.amount_paid), 0) FROM payments p WHERE p.chit_id = c.id AND p.payment_status = 'pending_approval') as pending_amount,
        (SELECT COALESCE(SUM(a.foreman_commission), 0) FROM auctions a WHERE a.chit_id = c.id AND a.status = 'completed') as commission_earned,
        (SELECT COUNT(DISTINCT cm2.user_id) FROM chit_members cm2 WHERE cm2.chit_id = c.id) as enrolled_members
      FROM chits c
      WHERE c.foreman_id = $1
      ORDER BY c.created_at DESC
    `, [foremanId]);

    return res.rows;
  }

  // Get monthly collection data for a specific chit
  static async getMonthlyCollection(chitId: string) {
    const res = await query(`
      SELECT 
        a.month_number,
        a.auction_date,
        a.net_subscription_due,
        a.status as auction_status,
        a.foreman_commission,
        a.winning_bid_discount,
        COALESCE(SUM(CASE WHEN p.payment_status = 'verified' THEN p.amount_paid ELSE 0 END), 0) as collected,
        COALESCE(SUM(CASE WHEN p.payment_status = 'pending_approval' THEN p.amount_paid ELSE 0 END), 0) as pending,
        COUNT(CASE WHEN p.payment_status = 'verified' THEN 1 END) as paid_members,
        COUNT(CASE WHEN p.payment_status = 'pending_approval' THEN 1 END) as pending_members
      FROM auctions a
      LEFT JOIN payments p ON p.auction_id = a.id
      WHERE a.chit_id = $1
      GROUP BY a.id, a.month_number, a.auction_date, a.net_subscription_due, a.status, a.foreman_commission, a.winning_bid_discount
      ORDER BY a.month_number
    `, [chitId]);

    return res.rows;
  }

  // Get defaulters - members who haven't paid for completed auctions
  static async getDefaulters(foremanId: string) {
    const res = await query(`
      SELECT 
        u.id as user_id, u.name, u.phone,
        c.id as chit_id, c.name as chit_name,
        a.month_number, a.net_subscription_due,
        a.auction_date
      FROM auctions a
      JOIN chits c ON a.chit_id = c.id
      JOIN chit_members cm ON cm.chit_id = c.id
      JOIN users u ON cm.user_id = u.id
      LEFT JOIN payments p ON p.auction_id = a.id AND p.user_id = u.id AND p.payment_status IN ('verified', 'pending_approval')
      WHERE c.foreman_id = $1 
        AND a.status = 'completed'
        AND p.id IS NULL
      ORDER BY a.auction_date DESC, u.name
    `, [foremanId]);

    return res.rows;
  }

  // Get member payment matrix for a chit group
  static async getMemberPaymentMatrix(chitId: string) {
    // Get all members
    const membersRes = await query(`
      SELECT cm.user_id, cm.member_number, u.name, u.phone
      FROM chit_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.chit_id = $1
      ORDER BY cm.member_number
    `, [chitId]);

    // Get all completed auctions
    const auctionsRes = await query(`
      SELECT id, month_number FROM auctions 
      WHERE chit_id = $1 AND status = 'completed'
      ORDER BY month_number
    `, [chitId]);

    // Get all payments
    const paymentsRes = await query(`
      SELECT p.user_id, p.auction_id, p.payment_status, a.month_number
      FROM payments p
      JOIN auctions a ON p.auction_id = a.id
      WHERE p.chit_id = $1
    `, [chitId]);

    return {
      members: membersRes.rows,
      auctions: auctionsRes.rows,
      payments: paymentsRes.rows,
    };
  }

  // Get Financial Projections
  static async getProjections(foremanId: string) {
    const chitsRes = await query(`
      SELECT 
        id, name, chit_value, members_count, duration_months,
        monthly_subscription, foreman_commission_pct, status, start_date
      FROM chits 
      WHERE foreman_id = $1 AND status IN ('active', 'recruiting')
    `, [foremanId]);

    let totalProjectedRevenue = 0;
    let totalProjectedCommission = 0;
    const chitForecasts = chitsRes.rows.map((c: any) => {
      const chitValue = parseFloat(c.chit_value);
      const commissionPct = parseFloat(c.foreman_commission_pct || '5');
      const duration = parseInt(c.duration_months);
      const totalCommission = (chitValue * (commissionPct / 100)) * duration;
      totalProjectedRevenue += chitValue;
      totalProjectedCommission += totalCommission;

      return {
        id: c.id,
        name: c.name,
        chitValue,
        duration,
        monthlySubscription: parseFloat(c.monthly_subscription),
        totalCommission,
        status: c.status
      };
    });

    return {
      totalProjectedRevenue,
      totalProjectedCommission,
      chitForecasts
    };
  }

  // Get Audit Trail Log
  static async getAuditTrail(foremanId: string) {
    const res = await query(`
      SELECT 
        'payment_verified' as action_type,
        p.id, p.amount_paid as amount, p.payment_status as status,
        p.verified_at as timestamp,
        u.name as actor_name, c.name as chit_name,
        'Verified payment receipt of ₹' || p.amount_paid || ' from ' || u.name as description
      FROM payments p
      JOIN chits c ON p.chit_id = c.id
      JOIN users u ON p.user_id = u.id
      WHERE c.foreman_id = $1 AND p.payment_status = 'verified'

      UNION ALL

      SELECT 
        'auction_completed' as action_type,
        a.id, a.winning_bid_discount as amount, a.status,
        a.auction_date as timestamp,
        COALESCE(u.name, 'Owner') as actor_name, c.name as chit_name,
        'Auction Month-' || a.month_number || ' completed. Winner: ' || COALESCE(u.name, 'Owner') as description
      FROM auctions a
      JOIN chits c ON a.chit_id = c.id
      LEFT JOIN users u ON a.winning_member_id = u.id
      WHERE c.foreman_id = $1 AND a.status = 'completed'

      UNION ALL

      SELECT 
        'surety_verified' as action_type,
        s.id, 0 as amount, s.status,
        s.created_at as timestamp,
        s.guarantor_name as actor_name, c.name as chit_name,
        'Surety doc (' || s.document_type || ') status updated to ' || s.status as description
      FROM sureties s
      JOIN auctions a ON s.auction_id = a.id
      JOIN chits c ON a.chit_id = c.id
      WHERE c.foreman_id = $1

      ORDER BY timestamp DESC
      LIMIT 50
    `, [foremanId]);

    return res.rows;
  }
}

