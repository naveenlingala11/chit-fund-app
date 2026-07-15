import fs from 'fs';
import path from 'path';
import { query } from './index';

export const initializeDatabase = async () => {
  try {
    console.log('Initializing database tables...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Split SQL commands and execute them
    await query(schemaSql);
    console.log('Database tables initialized successfully!');

    // Check if we need to seed initial users
    const userCheck = await query('SELECT count(*) FROM users');
    if (parseInt(userCheck.rows[0].count) === 0) {
      console.log('No users found. Seeding initial test data...');
      await seedInitialData();
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

const seedInitialData = async () => {
  try {
    // 1. Insert Owner/Foreman
    const ownerRes = await query(`
      INSERT INTO users (name, phone, email, role) 
      VALUES ('Venkata Rao (Owner)', '9876543210', 'owner@chitsangham.com', 'foreman') 
      RETURNING id
    `);
    const ownerId = ownerRes.rows[0].id;

    // 2. Insert 20 Members
    const memberIds: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const name = i === 1 ? 'Ramesh Kumar (Me)' : `Member Name ${i}`;
      const phone = `90000000${i.toString().padStart(2, '0')}`;
      const res = await query(
        `INSERT INTO users (name, phone, role) VALUES ($1, $2, 'member') RETURNING id`,
        [name, phone]
      );
      memberIds.push(res.rows[0].id);
    }

    // 3. Create an active 10 Lakh Chit
    const chitRes = await query(`
      INSERT INTO chits (foreman_id, name, chit_value, members_count, duration_months, monthly_subscription, start_date, status, first_month_rule, auction_day_of_month, auction_time)
      VALUES ($1, 'Vijayawada Gold Chit Group A', 1000000.00, 20, 20, 50000.00, CURRENT_DATE - INTERVAL '3 months', 'active', 'foreman_takes', 5, '18:00:00')
      RETURNING id
    `, [ownerId]);
    const chitId = chitRes.rows[0].id;

    // 4. Enroll the 20 members into this chit
    for (let i = 0; i < 20; i++) {
      await query(
        `INSERT INTO chit_members (chit_id, user_id, member_number) VALUES ($1, $2, $3)`,
        [chitId, memberIds[i], i + 1]
      );
    }

    // 5. Create past auctions history (Month 1, Month 2, Month 3)
    // Month 1: Foreman takes without bidding (as per traditional first_month_rule)
    const m1Auction = await query(`
      INSERT INTO auctions (chit_id, month_number, auction_date, winning_member_id, winning_bid_discount, foreman_commission, dividend_pool, dividend_per_member, net_subscription_due, status, surety_status, prize_disbursed)
      VALUES ($1, 1, CURRENT_DATE - INTERVAL '3 months', $2, 50000.00, 50000.00, 0.00, 0.00, 50000.00, 'completed', 'not_required', true)
      RETURNING id
    `, [chitId, ownerId]);

    // Add payments for Month 1 (all paid)
    for (let i = 0; i < 20; i++) {
      await query(`
        INSERT INTO payments (chit_id, auction_id, user_id, amount_paid, payment_mode, payment_status, verified_at)
        VALUES ($1, $2, $3, 50000.00, 'upi', 'verified', CURRENT_TIMESTAMP)
      `, [chitId, m1Auction.rows[0].id, memberIds[i]]);
    }

    // Month 2: Ramesh Kumar wins with a discount bid of 2,50,000
    const m2Auction = await query(`
      INSERT INTO auctions (chit_id, month_number, auction_date, winning_member_id, winning_bid_discount, foreman_commission, dividend_pool, dividend_per_member, net_subscription_due, status, surety_status, prize_disbursed)
      VALUES ($1, 2, CURRENT_DATE - INTERVAL '2 months', $2, 250000.00, 50000.00, 200000.00, 10000.00, 40000.00, 'completed', 'approved', true)
      RETURNING id
    `, [chitId, memberIds[0]]);

    // Add payments for Month 2 (all paid)
    for (let i = 0; i < 20; i++) {
      await query(`
        INSERT INTO payments (chit_id, auction_id, user_id, amount_paid, payment_mode, payment_status, verified_at)
        VALUES ($1, $2, $3, 40000.00, 'upi', 'verified', CURRENT_TIMESTAMP)
      `, [chitId, m2Auction.rows[0].id, memberIds[i]]);
    }

    // Month 3: Member 5 wins with a bid of 2,10,000 (commission 50,000, dividend pool 1,60,000 -> 8,000 per member. net subscription due = 42,000)
    const m3Auction = await query(`
      INSERT INTO auctions (chit_id, month_number, auction_date, winning_member_id, winning_bid_discount, foreman_commission, dividend_pool, dividend_per_member, net_subscription_due, status, surety_status, prize_disbursed)
      VALUES ($1, 3, CURRENT_DATE - INTERVAL '1 month', $2, 210000.00, 50000.00, 160000.00, 8000.00, 42000.00, 'completed', 'submitted', false)
      RETURNING id
    `, [chitId, memberIds[4]]);

    // Add payments for Month 3 (some verified, some pending, some unpaid)
    for (let i = 0; i < 20; i++) {
      let status = 'verified';
      let mode = 'upi';
      if (i === 8 || i === 12) {
        status = 'pending_approval';
      } else if (i === 15 || i === 18) {
        continue; // Unpaid
      }

      await query(`
        INSERT INTO payments (chit_id, auction_id, user_id, amount_paid, payment_mode, payment_status, verified_at)
        VALUES ($1, $2, $3, 42000.00, $4, $5, ${status === 'verified' ? 'CURRENT_TIMESTAMP' : 'NULL'})
      `, [chitId, m3Auction.rows[0].id, memberIds[i], mode, status]);
    }

    // Create a mock surety submission for the Month 3 winner
    await query(`
      INSERT INTO sureties (auction_id, guarantor_name, guarantor_phone, guarantor_relation, document_type, document_url, status)
      VALUES ($1, 'Kalyan Chakravarthy', '9111222333', 'Uncle/Government Employee', 'government_id', 'https://example.com/id.jpg', 'pending')
    `, [m3Auction.rows[0].id]);
    await query(`
      INSERT INTO sureties (auction_id, guarantor_name, guarantor_phone, guarantor_relation, document_type, document_url, status)
      VALUES ($1, 'Kalyan Chakravarthy', '9111222333', 'Uncle/Government Employee', 'payslip', 'https://example.com/payslip.jpg', 'pending')
    `, [m3Auction.rows[0].id]);

    // Month 4: Upcoming auction (not yet started)
    await query(`
      INSERT INTO auctions (chit_id, month_number, auction_date, status, net_subscription_due)
      VALUES ($1, 4, CURRENT_DATE + INTERVAL '5 days', 'upcoming', 50000.00)
    `, [chitId]);

    // 6. Create a newly recruiting 5 Lakh Chit
    const chit2Res = await query(`
      INSERT INTO chits (foreman_id, name, chit_value, members_count, duration_months, monthly_subscription, status, first_month_rule, auction_day_of_month, auction_time)
      VALUES ($1, 'Vizag Lakhs Chit Group B', 500000.00, 10, 10, 50000.00, 'recruiting', 'normal_auction', 10, '20:00:00')
      RETURNING id
    `, [ownerId]);
    const chit2Id = chit2Res.rows[0].id;

    // Enroll owner and 4 members into the recruiting chit
    await query(`INSERT INTO chit_members (chit_id, user_id, member_number) VALUES ($1, $2, 1)`, [chit2Id, ownerId]);
    for (let i = 0; i < 4; i++) {
      await query(`INSERT INTO chit_members (chit_id, user_id, member_number) VALUES ($1, $2, $3)`, [chit2Id, memberIds[i], i + 2]);
    }

    console.log('Test database seeded successfully!');
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
};
