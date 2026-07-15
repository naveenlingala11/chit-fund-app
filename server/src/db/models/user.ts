import { query } from '../index';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'foreman' | 'member' | 'both';
  profile_pic_url?: string;
  created_at?: Date;
}

export class UserModel {
  static async findAll(): Promise<User[]> {
    const result = await query('SELECT id, name, phone, role, profile_pic_url FROM users ORDER BY role DESC, name ASC');
    return result.rows;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query('SELECT id, name, phone, role, profile_pic_url FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByPhone(phone: string): Promise<User | null> {
    const result = await query('SELECT id, name, phone, role, profile_pic_url FROM users WHERE phone = $1', [phone]);
    return result.rows[0] || null;
  }

  static async register(name: string, phone: string, role: string): Promise<User> {
    const result = await query(
      'INSERT INTO users (name, phone, role) VALUES ($1, $2, $3) RETURNING id, name, phone, role, profile_pic_url',
      [name, phone, role]
    );
    return result.rows[0];
  }

  static async getDashboardMetrics(userId: string, role: 'foreman' | 'member') {
    if (role === 'foreman') {
      const expectedRes = await query(`
        SELECT COALESCE(SUM(a.net_subscription_due * c.members_count), 0) as expected
        FROM auctions a
        JOIN chits c ON a.chit_id = c.id
        WHERE c.foreman_id = $1 AND a.status = 'completed'
      `, [userId]);
      
      const receivedRes = await query(`
        SELECT COALESCE(SUM(p.amount_paid), 0) as received
        FROM payments p
        JOIN chits c ON p.chit_id = c.id
        WHERE c.foreman_id = $1 AND p.payment_status = 'verified'
      `, [userId]);
      
      const collectable = parseFloat(expectedRes.rows[0].expected) - parseFloat(receivedRes.rows[0].received);
      
      const profitRes = await query(`
        SELECT COALESCE(SUM(a.foreman_commission), 0) as profit
        FROM auctions a
        JOIN chits c ON a.chit_id = c.id
        WHERE c.foreman_id = $1 AND a.status = 'completed'
      `, [userId]);
      
      return {
        duesOrCollectable: Math.max(0, collectable),
        profit: parseFloat(profitRes.rows[0].profit)
      };
    } else {
      const expectedRes = await query(`
        SELECT COALESCE(SUM(a.net_subscription_due), 0) as expected
        FROM auctions a
        JOIN chit_members cm ON a.chit_id = cm.chit_id
        WHERE cm.user_id = $1 AND a.status = 'completed'
      `, [userId]);
      
      const paidRes = await query(`
        SELECT COALESCE(SUM(p.amount_paid), 0) as paid
        FROM payments p
        WHERE p.user_id = $1 AND p.payment_status = 'verified'
      `, [userId]);
      
      const dues = parseFloat(expectedRes.rows[0].expected) - parseFloat(paidRes.rows[0].paid);
      
      const profitRes = await query(`
        SELECT COALESCE(SUM(a.dividend_per_member), 0) as profit
        FROM auctions a
        JOIN chit_members cm ON a.chit_id = cm.chit_id
        WHERE cm.user_id = $1 AND a.status = 'completed'
      `, [userId]);
      
      return {
        duesOrCollectable: Math.max(0, dues),
        profit: parseFloat(profitRes.rows[0].profit)
      };
    }
  }
}
