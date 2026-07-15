import { query } from '../index';

export interface Auction {
  id: string;
  chit_id: string;
  month_number: number;
  auction_date: Date;
  winning_member_id?: string;
  winning_bid_discount?: number;
  foreman_commission?: number;
  dividend_pool?: number;
  dividend_per_member?: number;
  net_subscription_due: number;
  surety_status: 'not_required' | 'pending' | 'submitted' | 'approved';
  prize_disbursed: boolean;
  status: 'upcoming' | 'live' | 'completed';
}

export class AuctionModel {
  static async findByChitId(chitId: string): Promise<Auction[]> {
    const result = await query(`
      SELECT a.*, u.name as winner_name
      FROM auctions a
      LEFT JOIN users u ON a.winning_member_id = u.id
      WHERE a.chit_id = $1
      ORDER BY a.month_number ASC
    `, [chitId]);
    return result.rows;
  }

  static async findById(id: string): Promise<Auction | null> {
    const result = await query('SELECT * FROM auctions WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async saveResult(room: {
    auctionId: string;
    chitId: string;
    monthNumber: number;
    highestBidderId: string | null;
    highestBidderName: string | null;
    highestBidDiscount: number;
  }): Promise<any> {
    const { auctionId, chitId, monthNumber, highestBidderId, highestBidDiscount } = room;

    const winningMemberId = highestBidderId;
    const finalDiscount = highestBidDiscount || 0;

    const chitRes = await query('SELECT chit_value, foreman_commission_pct, members_count FROM chits WHERE id = $1', [chitId]);
    const chit = chitRes.rows[0];

    const foremanCommission = (parseFloat(chit.chit_value) * parseFloat(chit.foreman_commission_pct)) / 100;
    const dividendPool = Math.max(0, finalDiscount - foremanCommission);
    const dividendPerMember = dividendPool / parseInt(chit.members_count);
    const netSubscriptionDue = (parseFloat(chit.chit_value) / parseInt(chit.members_count)) - dividendPerMember;

    await query(`
      UPDATE auctions 
      SET winning_member_id = $1, 
          winning_bid_discount = $2, 
          foreman_commission = $3, 
          dividend_pool = $4, 
          dividend_per_member = $5, 
          net_subscription_due = $6,
          status = 'completed',
          surety_status = 'pending'
      WHERE id = $7
    `, [winningMemberId, finalDiscount, foremanCommission, dividendPool, dividendPerMember, netSubscriptionDue, auctionId]);

    if (monthNumber < parseInt(chit.members_count)) {
      await query(`
        INSERT INTO auctions (chit_id, month_number, auction_date, net_subscription_due, status)
        VALUES ($1, $2, CURRENT_DATE + INTERVAL '1 month', $3, 'upcoming')
      `, [chitId, monthNumber + 1, parseFloat(chit.chit_value) / parseInt(chit.members_count)]);
    }

    return {
      winnerId: winningMemberId,
      winnerName: room.highestBidderName || 'None',
      winningDiscount: finalDiscount,
      dividendPerMember,
      netSubscriptionDue,
    };
  }

  static async submitSureties(auctionId: string, sureties: any[]): Promise<void> {
    const auctionCheck = await query('SELECT id FROM auctions WHERE id = $1', [auctionId]);
    if (auctionCheck.rows.length === 0) {
      throw new Error('Auction not found');
    }

    for (const surety of sureties) {
      await query(`
        INSERT INTO sureties (
          auction_id, guarantor_name, guarantor_phone, guarantor_relation, 
          document_type, document_url, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      `, [
        auctionId, surety.guarantorName, surety.guarantorPhone, surety.guarantorRelation,
        surety.documentType, surety.documentUrl
      ]);
    }

    await query("UPDATE auctions SET surety_status = 'submitted' WHERE id = $1", [auctionId]);
  }

  static async getSureties(auctionId: string): Promise<any[]> {
    const result = await query('SELECT * FROM sureties WHERE auction_id = $1', [auctionId]);
    return result.rows;
  }

  static async getSuretiesForChit(chitId: string): Promise<any[]> {
    const result = await query(`
      SELECT s.*, a.month_number, u.name as winner_name
      FROM sureties s
      JOIN auctions a ON s.auction_id = a.id
      LEFT JOIN users u ON a.winning_member_id = u.id
      WHERE a.chit_id = $1
      ORDER BY s.created_at DESC
    `, [chitId]);
    return result.rows;
  }

  static async verifySuretyDoc(suretyId: string, status: 'approved' | 'rejected'): Promise<any> {
    const result = await query(`
      UPDATE sureties 
      SET status = $1 
      WHERE id = $2 
      RETURNING *
    `, [status, suretyId]);

    if (result.rows.length === 0) {
      throw new Error('Surety record not found');
    }

    const surety = result.rows[0];

    if (status === 'approved') {
      const allSureties = await query('SELECT status FROM sureties WHERE auction_id = $1', [surety.auction_id]);
      const allApproved = allSureties.rows.every((s: any) => s.status === 'approved');
      if (allApproved) {
        await query("UPDATE auctions SET surety_status = 'approved' WHERE id = $1", [surety.auction_id]);
      }
    } else {
      await query("UPDATE auctions SET surety_status = 'pending' WHERE id = $1", [surety.auction_id]);
    }

    return surety;
  }

  static async releasePayout(auctionId: string): Promise<void> {
    const auctionRes = await query('SELECT status, surety_status FROM auctions WHERE id = $1', [auctionId]);
    if (auctionRes.rows.length === 0) {
      throw new Error('Auction not found');
    }

    const auction = auctionRes.rows[0];
    if (auction.surety_status !== 'approved' && auction.surety_status !== 'not_required') {
      throw new Error('Cannot disburse prize money without approved sureties');
    }

    await query("UPDATE auctions SET prize_disbursed = true, surety_status = 'approved' WHERE id = $1", [auctionId]);
  }
}
