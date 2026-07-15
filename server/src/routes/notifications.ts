import { Router } from 'express';
import { query } from '../db/index';

const router = Router();

// Get activity feed / notifications (dynamically generated from existing data)
router.get('/', async (req: any, res: any) => {
  const { userId, role } = req.query;
  try {
    let notifications: any[] = [];

    if (role === 'foreman') {
      // Foreman sees: payment submissions, auction completions, surety uploads, new member joins
      
      // Recent payment submissions across foreman's chits
      const paymentsRes = await query(`
        SELECT 
          p.id, p.payment_status, p.amount_paid, p.payment_mode, p.created_at,
          p.verified_at,
          u.name as member_name, u.phone as member_phone,
          c.name as chit_name, c.id as chit_id,
          a.month_number,
          'payment' as type
        FROM payments p
        JOIN chits c ON p.chit_id = c.id
        JOIN users u ON p.user_id = u.id
        LEFT JOIN auctions a ON p.auction_id = a.id
        WHERE c.foreman_id = $1
        ORDER BY p.created_at DESC
        LIMIT 30
      `, [userId]);

      // Recent auction completions
      const auctionsRes = await query(`
        SELECT 
          a.id, a.month_number, a.winning_bid_discount, a.foreman_commission,
          a.status, a.auction_date,
          u.name as winner_name,
          c.name as chit_name, c.id as chit_id,
          'auction' as type
        FROM auctions a
        JOIN chits c ON a.chit_id = c.id
        LEFT JOIN users u ON a.winning_member_id = u.id
        WHERE c.foreman_id = $1 AND a.status = 'completed'
        ORDER BY a.auction_date DESC
        LIMIT 20
      `, [userId]);

      // Recent surety submissions
      const suretiesRes = await query(`
        SELECT 
          s.id, s.guarantor_name, s.document_type, s.status as surety_status,
          s.created_at,
          a.month_number,
          u.name as member_name,
          c.name as chit_name, c.id as chit_id,
          'surety' as type
        FROM sureties s
        JOIN auctions a ON s.auction_id = a.id
        JOIN chits c ON a.chit_id = c.id
        LEFT JOIN users u ON a.winning_member_id = u.id
        WHERE c.foreman_id = $1
        ORDER BY s.created_at DESC
        LIMIT 20
      `, [userId]);

      // Recent member joins
      const membersRes = await query(`
        SELECT 
          cm.joined_at as created_at, cm.member_number,
          u.name as member_name, u.phone as member_phone,
          c.name as chit_name, c.id as chit_id,
          'member_join' as type
        FROM chit_members cm
        JOIN chits c ON cm.chit_id = c.id
        JOIN users u ON cm.user_id = u.id
        WHERE c.foreman_id = $1
        ORDER BY cm.joined_at DESC
        LIMIT 20
      `, [userId]);

      // Merge all into a single feed
      const paymentNotifs = paymentsRes.rows.map((p: any) => ({
        id: p.id,
        type: 'payment',
        title: p.payment_status === 'pending_approval' 
          ? `💳 Payment Receipt Submitted`
          : p.payment_status === 'verified'
          ? `✅ Payment Verified`
          : `❌ Payment Rejected`,
        description: `${p.member_name} — ₹${parseFloat(p.amount_paid).toLocaleString('en-IN')} via ${p.payment_mode.toUpperCase()} for Month-${p.month_number || '?'}`,
        subtitle: p.chit_name,
        status: p.payment_status,
        timestamp: p.created_at,
        chitId: p.chit_id,
        actionable: p.payment_status === 'pending_approval',
      }));

      const auctionNotifs = auctionsRes.rows.map((a: any) => ({
        id: a.id,
        type: 'auction',
        title: `🔨 Auction Month-${a.month_number} Completed`,
        description: `Winner: ${a.winner_name || 'Foreman'} — Bid Discount: ₹${parseFloat(a.winning_bid_discount).toLocaleString('en-IN')}`,
        subtitle: a.chit_name,
        status: 'completed',
        timestamp: a.auction_date,
        chitId: a.chit_id,
        actionable: false,
      }));

      const suretyNotifs = suretiesRes.rows.map((s: any) => ({
        id: s.id,
        type: 'surety',
        title: s.surety_status === 'pending'
          ? `📋 Surety Document Uploaded`
          : s.surety_status === 'approved'
          ? `✅ Surety Approved`
          : `❌ Surety Rejected`,
        description: `${s.member_name || 'Member'} — Guarantor: ${s.guarantor_name} (${s.document_type.replace('_', ' ')})`,
        subtitle: `${s.chit_name} — Month-${s.month_number}`,
        status: s.surety_status,
        timestamp: s.created_at,
        chitId: s.chit_id,
        actionable: s.surety_status === 'pending',
      }));

      const memberNotifs = membersRes.rows.map((m: any) => ({
        id: `member-${m.member_name}-${m.created_at}`,
        type: 'member_join',
        title: `👤 New Member Enrolled`,
        description: `${m.member_name} (${m.member_phone}) joined as Member #${m.member_number || '?'}`,
        subtitle: m.chit_name,
        status: 'joined',
        timestamp: m.created_at,
        chitId: m.chit_id,
        actionable: false,
      }));

      notifications = [...paymentNotifs, ...auctionNotifs, ...suretyNotifs, ...memberNotifs];
    } else {
      // Member sees: their own payment verifications, auction results, chit updates
      const paymentsRes = await query(`
        SELECT 
          p.id, p.payment_status, p.amount_paid, p.payment_mode, p.created_at,
          c.name as chit_name, c.id as chit_id,
          a.month_number,
          'payment' as type
        FROM payments p
        JOIN chits c ON p.chit_id = c.id
        LEFT JOIN auctions a ON p.auction_id = a.id
        WHERE p.user_id = $1
        ORDER BY p.created_at DESC
        LIMIT 30
      `, [userId]);

      const auctionsRes = await query(`
        SELECT 
          a.id, a.month_number, a.winning_bid_discount, a.dividend_per_member,
          a.status, a.auction_date,
          u.name as winner_name,
          c.name as chit_name, c.id as chit_id,
          CASE WHEN a.winning_member_id = $1 THEN true ELSE false END as is_winner,
          'auction' as type
        FROM auctions a
        JOIN chits c ON a.chit_id = c.id
        JOIN chit_members cm ON cm.chit_id = c.id AND cm.user_id = $1
        LEFT JOIN users u ON a.winning_member_id = u.id
        WHERE a.status = 'completed'
        ORDER BY a.auction_date DESC
        LIMIT 20
      `, [userId]);

      const paymentNotifs = paymentsRes.rows.map((p: any) => ({
        id: p.id,
        type: 'payment',
        title: p.payment_status === 'pending_approval'
          ? `⏳ Payment Under Review`
          : p.payment_status === 'verified'
          ? `✅ Payment Approved!`
          : `❌ Payment Rejected`,
        description: `₹${parseFloat(p.amount_paid).toLocaleString('en-IN')} via ${p.payment_mode.toUpperCase()} for Month-${p.month_number || '?'}`,
        subtitle: p.chit_name,
        status: p.payment_status,
        timestamp: p.created_at,
        chitId: p.chit_id,
        actionable: false,
      }));

      const auctionNotifs = auctionsRes.rows.map((a: any) => ({
        id: a.id,
        type: 'auction',
        title: a.is_winner
          ? `🏆 You Won Auction Month-${a.month_number}!`
          : `🔨 Auction Month-${a.month_number} Result`,
        description: a.is_winner
          ? `Congratulations! Bid Discount: ₹${parseFloat(a.winning_bid_discount).toLocaleString('en-IN')}`
          : `Winner: ${a.winner_name || 'Foreman'} — Your dividend: ₹${parseFloat(a.dividend_per_member || 0).toLocaleString('en-IN')}`,
        subtitle: a.chit_name,
        status: 'completed',
        timestamp: a.auction_date,
        chitId: a.chit_id,
        actionable: false,
      }));

      notifications = [...paymentNotifs, ...auctionNotifs];
    }

    // Sort all by timestamp descending
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Count actionable (unread-like)
    const actionableCount = notifications.filter(n => n.actionable).length;

    res.json({ notifications, actionableCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
