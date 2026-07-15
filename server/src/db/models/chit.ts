import { query } from '../index';

export interface Chit {
  id: string;
  foreman_id: string;
  name: string;
  chit_value: number;
  members_count: number;
  duration_months: number;
  monthly_subscription: number;
  foreman_commission_pct: number;
  max_bid_discount_pct: number;
  first_month_rule: 'foreman_takes' | 'normal_auction';
  auction_day_of_month: number;
  auction_time: string;
  status: 'draft' | 'recruiting' | 'active' | 'completed';
  start_date?: string;
  created_at?: Date;
  member_number?: number;
}

export class ChitModel {
  static async findAll(userId?: string, role?: string): Promise<Chit[]> {
    if (userId) {
      if (role === 'foreman') {
        const res = await query('SELECT * FROM chits WHERE foreman_id = $1 ORDER BY created_at DESC', [userId]);
        return res.rows;
      } else {
        const res = await query(`
          SELECT c.*, cm.member_number 
          FROM chits c
          JOIN chit_members cm ON c.id = cm.chit_id
          WHERE cm.user_id = $1
          ORDER BY c.created_at DESC
        `, [userId]);
        return res.rows;
      }
    } else {
      const res = await query('SELECT * FROM chits ORDER BY created_at DESC');
      return res.rows;
    }
  }

  static async findById(id: string): Promise<any | null> {
    const chitResult = await query('SELECT * FROM chits WHERE id = $1', [id]);
    if (chitResult.rows.length === 0) {
      return null;
    }

    const membersResult = await query(`
      SELECT cm.member_number, u.id as user_id, u.name, u.phone, u.profile_pic_url 
      FROM chit_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.chit_id = $1
      ORDER BY cm.member_number ASC
    `, [id]);

    const auctionsResult = await query(`
      SELECT a.*, u.name as winner_name 
      FROM auctions a
      LEFT JOIN users u ON a.winning_member_id = u.id
      WHERE a.chit_id = $1
      ORDER BY a.month_number ASC
    `, [id]);

    return {
      ...chitResult.rows[0],
      members: membersResult.rows,
      auctions: auctionsResult.rows
    };
  }

  static async create(data: {
    foremanId: string;
    name: string;
    chitValue: number;
    membersCount: number;
    durationMonths: number;
    monthlySubscription: number;
    foremanCommissionPct?: number;
    maxBidDiscountPct?: number;
    firstMonthRule?: string;
    auctionDayOfMonth: number;
    auctionTime: string;
    startDate?: string;
    members?: { name: string; phone: string }[];
  }): Promise<Chit> {
    const {
      foremanId, name, chitValue, membersCount, durationMonths,
      monthlySubscription, foremanCommissionPct, maxBidDiscountPct,
      firstMonthRule, auctionDayOfMonth, auctionTime, startDate, members
    } = data;

    const result = await query(`
      INSERT INTO chits (
        foreman_id, name, chit_value, members_count, duration_months, 
        monthly_subscription, foreman_commission_pct, max_bid_discount_pct, 
        first_month_rule, auction_day_of_month, auction_time, start_date, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'recruiting')
      RETURNING *
    `, [
      foremanId, name, chitValue, membersCount, durationMonths,
      monthlySubscription, foremanCommissionPct || 5.00, maxBidDiscountPct || 30.00,
      firstMonthRule || 'foreman_takes', auctionDayOfMonth, auctionTime, startDate
    ]);

    const newChit = result.rows[0];

    // Auto-enroll foreman as Member #1
    await query(`
      INSERT INTO chit_members (chit_id, user_id, member_number)
      VALUES ($1, $2, 1)
    `, [newChit.id, foremanId]);

    // Enroll other members
    if (members && Array.isArray(members)) {
      let memberNum = 2;
      for (const m of members) {
        if (!m.name || !m.phone) continue;
        
        let userRes = await query('SELECT id FROM users WHERE phone = $1', [m.phone]);
        let memberUserId;
        
        if (userRes.rows.length > 0) {
          memberUserId = userRes.rows[0].id;
        } else {
          const newUserRes = await query(
            "INSERT INTO users (name, phone, role) VALUES ($1, $2, 'member') RETURNING id",
            [m.name, m.phone]
          );
          memberUserId = newUserRes.rows[0].id;
        }
        
        await query(
          "INSERT INTO chit_members (chit_id, user_id, member_number) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
          [newChit.id, memberUserId, memberNum]
        );
        memberNum++;
      }
      
      if (memberNum - 1 >= membersCount) {
        await query("UPDATE chits SET status = 'active' WHERE id = $1", [newChit.id]);
      }
    }

    // Create Month 1 auction record
    await query(`
      INSERT INTO auctions (chit_id, month_number, auction_date, net_subscription_due, status)
      VALUES ($1, 1, $2, $3, 'upcoming')
    `, [newChit.id, startDate, monthlySubscription]);

    return newChit;
  }

  static async addMember(chitId: string, name: string, phone: string, memberNumber?: string): Promise<any> {
    const chitCheck = await query('SELECT status, members_count FROM chits WHERE id = $1', [chitId]);
    if (chitCheck.rows.length === 0) {
      throw new Error('Chit not found');
    }
    if (chitCheck.rows[0].status !== 'recruiting') {
      throw new Error('This chit group is already active or completed');
    }
    
    let userRes = await query('SELECT id FROM users WHERE phone = $1', [phone]);
    let memberUserId;
    if (userRes.rows.length > 0) {
      memberUserId = userRes.rows[0].id;
    } else {
      const newUserRes = await query(
        "INSERT INTO users (name, phone, role) VALUES ($1, $2, 'member') RETURNING id",
        [name, phone]
      );
      memberUserId = newUserRes.rows[0].id;
    }
    
    const enrollCheck = await query('SELECT id FROM chit_members WHERE chit_id = $1 AND user_id = $2', [chitId, memberUserId]);
    if (enrollCheck.rows.length > 0) {
      throw new Error('User is already enrolled in this chit group');
    }
    
    const currentMembers = await query('SELECT count(*) FROM chit_members WHERE chit_id = $1', [chitId]);
    const enrolledCount = parseInt(currentMembers.rows[0].count);
    const limit = parseInt(chitCheck.rows[0].members_count);
    
    if (enrolledCount >= limit) {
      throw new Error('Chit group is already full');
    }
    
    let assignedNumber = memberNumber ? parseInt(memberNumber) : null;
    if (!assignedNumber) {
      assignedNumber = enrolledCount + 1;
    }
    
    const numCheck = await query(
      'SELECT id FROM chit_members WHERE chit_id = $1 AND member_number = $2',
      [chitId, assignedNumber]
    );
    if (numCheck.rows.length > 0) {
      throw new Error(`Member number #${assignedNumber} is already taken in this chit group`);
    }
    
    await query(`
      INSERT INTO chit_members (chit_id, user_id, member_number)
      VALUES ($1, $2, $3)
    `, [chitId, memberUserId, assignedNumber]);
    
    if (enrolledCount + 1 === limit) {
      await query("UPDATE chits SET status = 'active' WHERE id = $1", [chitId]);
    }
    
    return { memberUserId, memberNumber: assignedNumber };
  }

  static async removeMember(chitId: string, userId: string): Promise<boolean> {
    const chitCheck = await query('SELECT status FROM chits WHERE id = $1', [chitId]);
    if (chitCheck.rows.length === 0) {
      throw new Error('Chit not found');
    }
    if (chitCheck.rows[0].status !== 'recruiting') {
      throw new Error('Cannot remove members from an active or completed chit group');
    }
    
    const result = await query('DELETE FROM chit_members WHERE chit_id = $1 AND user_id = $2 RETURNING *', [chitId, userId]);
    return result.rows.length > 0;
  }

  static async editMember(chitId: string, userId: string, name?: string, phone?: string, memberNumber?: number): Promise<boolean> {
    await query('BEGIN');
    try {
      if (name || phone) {
        if (phone) {
          const phoneCheck = await query('SELECT id FROM users WHERE phone = $1 AND id != $2', [phone, userId]);
          if (phoneCheck.rows.length > 0) {
            throw new Error('Mobile number already registered by another user');
          }
        }
        
        await query(
          'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone) WHERE id = $3',
          [name, phone, userId]
        );
      }
      
      if (memberNumber !== undefined) {
        const numCheck = await query(
          'SELECT id FROM chit_members WHERE chit_id = $1 AND member_number = $2 AND user_id != $3',
          [chitId, memberNumber, userId]
        );
        if (numCheck.rows.length > 0) {
          throw new Error(`Member number #${memberNumber} is already taken in this chit group`);
        }
        
        await query(
          'UPDATE chit_members SET member_number = $1 WHERE chit_id = $2 AND user_id = $3',
          [memberNumber, chitId, userId]
        );
      }
      
      await query('COMMIT');
      return true;
    } catch (e) {
      await query('ROLLBACK');
      throw e;
    }
  }

  static async update(id: string, data: {
    name?: string;
    foreman_commission_pct?: number;
    max_bid_discount_pct?: number;
    auction_day_of_month?: number;
    auction_time?: string;
    status?: 'draft' | 'recruiting' | 'active' | 'completed';
  }): Promise<boolean> {
    const { name, foreman_commission_pct, max_bid_discount_pct, auction_day_of_month, auction_time, status } = data;
    const res = await query(`
      UPDATE chits
      SET 
        name = COALESCE($1, name),
        foreman_commission_pct = COALESCE($2, foreman_commission_pct),
        max_bid_discount_pct = COALESCE($3, max_bid_discount_pct),
        auction_day_of_month = COALESCE($4, auction_day_of_month),
        auction_time = COALESCE($5, auction_time),
        status = COALESCE($6, status)
      WHERE id = $7
      RETURNING *
    `, [name, foreman_commission_pct, max_bid_discount_pct, auction_day_of_month, auction_time, status, id]);

    return res.rows.length > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const res = await query('DELETE FROM chits WHERE id = $1 RETURNING *', [id]);
    return res.rows.length > 0;
  }

  static async duplicate(id: string, newName?: string): Promise<Chit> {
    const original = await query('SELECT * FROM chits WHERE id = $1', [id]);
    if (original.rows.length === 0) {
      throw new Error('Original chit group not found');
    }
    const o = original.rows[0];
    const nameToUse = newName || `${o.name} (Copy)`;

    return this.create({
      foremanId: o.foreman_id,
      name: nameToUse,
      chitValue: parseFloat(o.chit_value),
      membersCount: parseInt(o.members_count),
      durationMonths: parseInt(o.duration_months),
      monthlySubscription: parseFloat(o.monthly_subscription),
      foremanCommissionPct: parseFloat(o.foreman_commission_pct),
      maxBidDiscountPct: parseFloat(o.max_bid_discount_pct),
      firstMonthRule: o.first_month_rule,
      auctionDayOfMonth: parseInt(o.auction_day_of_month),
      auctionTime: o.auction_time,
      startDate: new Date().toISOString().split('T')[0]
    });
  }
}

