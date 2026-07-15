import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { initializeDatabase } from './db/init';
import { UserModel } from './db/models/user';
import { AuctionModel } from './db/models/auction';
import { ChitModel } from './db/models/chit';
import { PaymentModel } from './db/models/payment';
import chitRoutes from './routes/chits';
import paymentRoutes from './routes/payments';
import auctionRoutes from './routes/auctions';
import reportRoutes from './routes/reports';
import notificationRoutes from './routes/notifications';
import { initAuctionSocket } from './sockets/auctionSocket';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Configure API Routes
app.get('/api/users', async (req: any, res: any) => {
  try {
    const users = await UserModel.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/users/register', async (req: any, res: any) => {
  const { name, phone, role } = req.body;
  if (!name || !phone || !role) {
    return res.status(400).json({ error: 'Name, phone, and role are required' });
  }
  try {
    const existing = await UserModel.findByPhone(phone);
    if (existing) {
      return res.status(400).json({ error: 'Mobile number already registered' });
    }
    const user = await UserModel.register(name, phone, role);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/users/:userId/metrics', async (req: any, res: any) => {
  const { userId } = req.params;
  const { role } = req.query;
  
  try {
    const metrics = await UserModel.getDashboardMetrics(userId, role as 'foreman' | 'member');
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching user dashboard metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/users/:userId/details', async (req: any, res: any) => {
  const { userId } = req.params;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const chits = await ChitModel.findAll(userId, 'member'); // Fetch all enrolled
    const payments = await PaymentModel.findByChitId(userId); // Wait, fetch all payments by this user across chits.
    // In our model we wrote PaymentModel.findByChitId(chitId) which filters by chitId.
    // Wait, let's look at the query we wrote in `/api/users/:userId/details` earlier:
    // It queries payments where user_id = $1, and sureties where winning_member_id = $1.
    // Let's implement these queries directly or use raw query in details since details is user-specific.
    // Wait, let's keep details query clean. We can query them using database query or model.
    // Since we want index.ts to be clean, let's write a details method in UserModel or query them directly:
    const { query: dbQuery } = require('./db');
    
    // Fetch all chits user is involved in
    const chitsRes = await dbQuery(`
      SELECT c.id, c.name, c.status, cm.member_number,
             CASE WHEN c.foreman_id = $1 THEN 'foreman' ELSE 'member' END as role_in_chit
      FROM chit_members cm
      JOIN chits c ON cm.chit_id = c.id
      WHERE cm.user_id = $1
      ORDER BY c.created_at DESC
    `, [userId]);

    const paymentsRes = await dbQuery(`
      SELECT p.*, c.name as chit_name, a.month_number
      FROM payments p
      JOIN chits c ON p.chit_id = c.id
      LEFT JOIN auctions a ON p.auction_id = a.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
    `, [userId]);

    const suretiesRes = await dbQuery(`
      SELECT s.*, c.name as chit_name, a.month_number
      FROM sureties s
      JOIN auctions a ON s.auction_id = a.id
      JOIN chits c ON a.chit_id = c.id
      WHERE a.winning_member_id = $1
      ORDER BY s.created_at DESC
    `, [userId]);

    res.json({
      profile: user,
      chits: chitsRes.rows,
      payments: paymentsRes.rows,
      sureties: suretiesRes.rows
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use('/api/chits', chitRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/health', (req: any, res: any) => {
  res.json({ status: 'ok', time: new Date() });
});

// Configure Socket.io for Real-time Bidding
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Initialize socket handlers
initAuctionSocket(io);

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  try {
    await initializeDatabase();
  } catch (err) {
    console.error('Database initialization warning during startup:', err);
  }
});
