-- Users Table (Foremen & Members)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    role VARCHAR(10) CHECK (role IN ('foreman', 'member', 'both')) DEFAULT 'member',
    profile_pic_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chit Schemes Table
CREATE TABLE IF NOT EXISTS chits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    foreman_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    chit_value NUMERIC(12, 2) NOT NULL,            -- e.g., 1000000.00
    members_count INT NOT NULL,                     -- e.g., 20
    duration_months INT NOT NULL,                   -- e.g., 20
    monthly_subscription NUMERIC(12, 2) NOT NULL,   -- e.g., 50000.00 (Chit Value / Members)
    foreman_commission_pct NUMERIC(4, 2) DEFAULT 5.00, -- e.g., 5% (50,000)
    max_bid_discount_pct NUMERIC(4, 2) DEFAULT 30.00,  -- e.g., 30% (3,00,000)
    first_month_rule VARCHAR(15) CHECK (first_month_rule IN ('foreman_takes', 'normal_auction')) DEFAULT 'foreman_takes',
    auction_day_of_month INT NOT NULL CHECK (auction_day_of_month BETWEEN 1 AND 31),
    auction_time TIME NOT NULL,
    status VARCHAR(15) CHECK (status IN ('draft', 'recruiting', 'active', 'completed')) DEFAULT 'recruiting',
    start_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chit Members (Enrollment Table)
CREATE TABLE IF NOT EXISTS chit_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chit_id UUID REFERENCES chits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    member_number INT,                              -- 1 to 20 assigned by foreman
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chit_id, user_id),
    UNIQUE(chit_id, member_number)
);

-- Monthly Auctions Table
CREATE TABLE IF NOT EXISTS auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chit_id UUID REFERENCES chits(id) ON DELETE CASCADE,
    month_number INT NOT NULL,                      -- e.g., 1 to 20
    auction_date TIMESTAMP NOT NULL,
    winning_member_id UUID REFERENCES users(id),    -- Winner of this month's bid
    winning_bid_discount NUMERIC(12, 2) DEFAULT 0,  -- e.g., 250000.00
    foreman_commission NUMERIC(12, 2) DEFAULT 0,    -- e.g., 50000.00
    dividend_pool NUMERIC(12, 2) DEFAULT 0,         -- Discount - Commission (e.g., 200000.00)
    dividend_per_member NUMERIC(12, 2) DEFAULT 0,   -- Dividend Pool / Members (e.g., 10000.00)
    net_subscription_due NUMERIC(12, 2) NOT NULL,   -- e.g., 50000 - 10000 = 40000.00
    surety_status VARCHAR(15) CHECK (surety_status IN ('not_required', 'pending', 'submitted', 'approved')) DEFAULT 'pending',
    prize_disbursed BOOLEAN DEFAULT FALSE,
    status VARCHAR(15) CHECK (status IN ('upcoming', 'live', 'completed')) DEFAULT 'upcoming',
    UNIQUE(chit_id, month_number)
);

-- Bids Log (For Live Auction Auditing)
CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    discount_amount NUMERIC(12, 2) NOT NULL,        -- Bid value (e.g., 150000.00)
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments Ledger
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chit_id UUID REFERENCES chits(id) ON DELETE CASCADE,
    auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE, -- Belongs to which month
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount_paid NUMERIC(12, 2) NOT NULL,
    penalty_amount NUMERIC(12, 2) DEFAULT 0,
    payment_mode VARCHAR(15) CHECK (payment_mode IN ('cash', 'upi', 'bank_transfer')) NOT NULL,
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending_approval', 'verified', 'rejected')) DEFAULT 'pending_approval',
    receipt_image_url TEXT,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Surety / Guarantor Documents Table
CREATE TABLE IF NOT EXISTS sureties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
    guarantor_name VARCHAR(100) NOT NULL,
    guarantor_phone VARCHAR(15) NOT NULL,
    guarantor_relation VARCHAR(50) NOT NULL,
    document_type VARCHAR(30) CHECK (document_type IN ('government_id', 'payslip', 'property_doc', 'promissory_note')) NOT NULL,
    document_url TEXT NOT NULL,
    status VARCHAR(15) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
