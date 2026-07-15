import { query } from '../index';

export interface Payment {
  id: string;
  chit_id: string;
  auction_id: string;
  user_id: string;
  amount_paid: number;
  penalty_amount: number;
  payment_mode: 'cash' | 'upi' | 'bank_transfer';
  payment_status: 'pending_approval' | 'verified' | 'rejected';
  receipt_image_url?: string;
  verified_at?: Date;
  created_at?: Date;
}

export class PaymentModel {
  static async findByChitId(chitId: string, auctionId?: string): Promise<any[]> {
    if (chitId && auctionId) {
      const result = await query(`
        SELECT p.*, u.name, u.phone, cm.member_number
        FROM payments p
        JOIN users u ON p.user_id = u.id
        JOIN chit_members cm ON cm.user_id = u.id AND cm.chit_id = $1
        WHERE p.chit_id = $1 AND p.auction_id = $2
      `, [chitId, auctionId]);
      return result.rows;
    } else {
      const result = await query(`
        SELECT p.*, u.name, cm.member_number
        FROM payments p
        JOIN users u ON p.user_id = u.id
        JOIN chit_members cm ON cm.user_id = u.id AND cm.chit_id = $1
        WHERE p.chit_id = $1
      `, [chitId]);
      return result.rows;
    }
  }

  static async submit(data: {
    chitId: string;
    auctionId: string;
    userId: string;
    amountPaid: number;
    paymentMode: string;
    receiptImageUrl?: string;
  }): Promise<Payment> {
    const { chitId, auctionId, userId, amountPaid, paymentMode, receiptImageUrl } = data;
    const result = await query(`
      INSERT INTO payments (
        chit_id, auction_id, user_id, amount_paid, payment_mode, 
        payment_status, receipt_image_url, created_at
      )
      VALUES ($1, $2, $3, $4, $5, 'pending_approval', $6, CURRENT_TIMESTAMP)
      RETURNING *
    `, [chitId, auctionId, userId, amountPaid, paymentMode, receiptImageUrl]);
    return result.rows[0];
  }

  static async logCash(data: {
    chitId: string;
    auctionId: string;
    userId: string;
    amountPaid: number;
  }): Promise<Payment> {
    const { chitId, auctionId, userId, amountPaid } = data;
    const result = await query(`
      INSERT INTO payments (
        chit_id, auction_id, user_id, amount_paid, payment_mode, 
        payment_status, verified_at, created_at
      )
      VALUES ($1, $2, $3, $4, 'cash', 'verified', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [chitId, auctionId, userId, amountPaid]);
    return result.rows[0];
  }

  static async verify(paymentId: string, status: 'verified' | 'rejected'): Promise<Payment> {
    const result = await query(`
      UPDATE payments 
      SET payment_status = $1, verified_at = ${status === 'verified' ? 'CURRENT_TIMESTAMP' : 'NULL'}
      WHERE id = $2
      RETURNING *
    `, [status, paymentId]);

    if (result.rows.length === 0) {
      throw new Error('Payment record not found');
    }

    return result.rows[0];
  }
}
