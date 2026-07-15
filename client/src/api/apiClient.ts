export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'foreman' | 'member';
  profile_pic_url?: string;
}

export interface Chit {
  id: string;
  foreman_id: string;
  name: string;
  chit_value: string | number;
  members_count: number;
  duration_months: number;
  monthly_subscription: string | number;
  foreman_commission_pct: string | number;
  max_bid_discount_pct: string | number;
  first_month_rule: string;
  auction_day_of_month: number;
  auction_time: string;
  status: 'draft' | 'recruiting' | 'active' | 'completed';
  start_date: string;
  member_number?: number;
}

export interface Member {
  user_id: string;
  name: string;
  phone: string;
  member_number: number;
}

export interface Auction {
  id: string;
  chit_id: string;
  month_number: number;
  auction_date: string;
  winning_member_id: string | null;
  winning_bid_discount: string | number;
  foreman_commission: string | number;
  dividend_pool: string | number;
  dividend_per_member: string | number;
  net_subscription_due: string | number;
  surety_status: 'not_required' | 'pending' | 'submitted' | 'approved';
  prize_disbursed: boolean;
  status: 'upcoming' | 'live' | 'completed';
  winner_name?: string;
}

export interface Payment {
  id: string;
  chit_id: string;
  auction_id: string;
  user_id: string;
  amount_paid: string | number;
  penalty_amount: string | number;
  payment_mode: 'cash' | 'upi' | 'bank_transfer';
  payment_status: 'pending_approval' | 'verified' | 'rejected';
  receipt_image_url?: string;
  member_number?: number;
  name?: string;
}

export interface Surety {
  id: string;
  auction_id: string;
  guarantor_name: string;
  guarantor_phone: string;
  guarantor_relation: string;
  document_type: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  chit_name?: string;
  month_number?: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async fetchUsers(): Promise<User[]> {
    const res = await fetch(`${this.baseUrl}/api/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  }

  async registerUser(name: string, phone: string, role: string): Promise<User> {
    const res = await fetch(`${this.baseUrl}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register');
    }
    return res.json();
  }

  async fetchUserMetrics(userId: string, role: string): Promise<{ duesOrCollectable: number; profit: number }> {
    const res = await fetch(`${this.baseUrl}/api/users/${userId}/metrics?role=${role}`);
    if (!res.ok) throw new Error('Failed to fetch user metrics');
    return res.json();
  }

  async fetchUserDetails(userId: string): Promise<{ profile: User; chits: any[]; payments: Payment[]; sureties: Surety[] }> {
    const res = await fetch(`${this.baseUrl}/api/users/${userId}/details`);
    if (!res.ok) throw new Error('Failed to fetch user details');
    return res.json();
  }

  async fetchChits(userId?: string, role?: string): Promise<Chit[]> {
    const url = userId ? `${this.baseUrl}/api/chits?userId=${userId}&role=${role}` : `${this.baseUrl}/api/chits`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch chits');
    return res.json();
  }

  async fetchChitById(id: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/chits/${id}`);
    if (!res.ok) throw new Error('Failed to fetch chit details');
    return res.json();
  }

  async createChit(foremanId: string, form: any, members: any[]): Promise<Chit> {
    const res = await fetch(`${this.baseUrl}/api/chits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        foremanId,
        name: form.name,
        chitValue: parseFloat(form.chitValue),
        membersCount: parseInt(form.membersCount),
        durationMonths: parseInt(form.durationMonths),
        monthlySubscription: parseFloat(form.chitValue) / parseInt(form.membersCount),
        foremanCommissionPct: parseFloat(form.foremanCommissionPct),
        maxBidDiscountPct: parseFloat(form.maxBidDiscountPct),
        firstMonthRule: form.firstMonthRule,
        auctionDayOfMonth: parseInt(form.auctionDayOfMonth),
        auctionTime: form.auctionTime,
        startDate: form.startDate,
        members
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create chit group');
    }
    return res.json();
  }

  async addChitMember(chitId: string, name: string, phone: string, memberNumber?: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/chits/${chitId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, memberNumber })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add member');
    }
    return res.json();
  }

  async editChitMember(chitId: string, userId: string, name: string, phone: string, memberNumber: number): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/chits/${chitId}/members/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, memberNumber })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to edit member');
    }
    return res.json();
  }

  async removeChitMember(chitId: string, userId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/chits/${chitId}/members/${userId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to remove member');
    }
    return res.json();
  }

  async fetchPayments(chitId: string): Promise<Payment[]> {
    const res = await fetch(`${this.baseUrl}/api/payments?chitId=${chitId}`);
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  }

  async submitPaymentReceipt(data: {
    chitId: string;
    auctionId: string;
    userId: string;
    amountPaid: number;
    paymentMode: string;
    receiptImageUrl: string;
  }): Promise<Payment> {
    const res = await fetch(`${this.baseUrl}/api/payments/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit payment');
    return res.json();
  }

  async verifyPayment(paymentId: string, status: string): Promise<Payment> {
    const res = await fetch(`${this.baseUrl}/api/payments/${paymentId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to verify payment');
    return res.json();
  }

  async submitSureties(auctionId: string, sureties: any[]): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/auctions/${auctionId}/sureties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sureties })
    });
    if (!res.ok) throw new Error('Failed to submit sureties');
    return res.json();
  }

  async fetchSuretiesForChit(chitId: string): Promise<Surety[]> {
    const res = await fetch(`${this.baseUrl}/api/auctions/chit/${chitId}/sureties`);
    if (!res.ok) throw new Error('Failed to fetch sureties');
    return res.json();
  }

  async verifySurety(suretyId: string, status: string): Promise<Surety> {
    const res = await fetch(`${this.baseUrl}/api/auctions/sureties/${suretyId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to verify surety');
    return res.json();
  }

  async disbursePrizeMoney(auctionId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/auctions/${auctionId}/disburse`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to disburse prize money');
    return res.json();
  }

  // ─── Reports & Analytics ───────────────────────────────────────

  async fetchReportsOverview(userId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/reports/overview?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch reports overview');
    return res.json();
  }

  async fetchChitGroupStats(userId: string): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/api/reports/chit-stats?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch chit group stats');
    return res.json();
  }

  async fetchMonthlyCollection(chitId: string): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/api/reports/monthly-collection?chitId=${chitId}`);
    if (!res.ok) throw new Error('Failed to fetch monthly collection');
    return res.json();
  }

  async fetchDefaulters(userId: string): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/api/reports/defaulters?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch defaulters');
    return res.json();
  }

  async fetchPaymentMatrix(chitId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/reports/payment-matrix?chitId=${chitId}`);
    if (!res.ok) throw new Error('Failed to fetch payment matrix');
    return res.json();
  }

  // ─── Notifications / Activity Feed ─────────────────────────────

  async fetchNotifications(userId: string, role: string): Promise<{ notifications: any[]; actionableCount: number }> {
    const res = await fetch(`${this.baseUrl}/api/notifications?userId=${userId}&role=${role}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  }

  // ─── Chit Operations ──────────────────────────────────────────

  async updateChit(id: string, data: any): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/chits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update chit group');
    return res.json();
  }

  async deleteChit(id: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/chits/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete chit group');
    return res.json();
  }

  async duplicateChit(id: string, newName?: string): Promise<Chit> {
    const res = await fetch(`${this.baseUrl}/api/chits/${id}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    });
    if (!res.ok) throw new Error('Failed to duplicate chit group');
    return res.json();
  }

  async fetchFinancialProjections(userId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/reports/projections?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch projections');
    return res.json();
  }

  async fetchAuditTrail(userId: string): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/api/reports/audit-trail?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch audit trail');
    return res.json();
  }
}

