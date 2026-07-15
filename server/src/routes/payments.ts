import { Router } from 'express';
import { PaymentModel } from '../db/models/payment';

const router = Router();

// Fetch payments list for a specific chit group and month (used by Foreman grid)
router.get('/', async (req: any, res: any) => {
  const { chitId, auctionId } = req.query;
  try {
    const payments = await PaymentModel.findByChitId(chitId as string, auctionId as string);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Member submits a payment receipt (simulated upload)
router.post('/submit', async (req: any, res: any) => {
  try {
    const payment = await PaymentModel.submit(req.body);
    res.status(201).json(payment);
  } catch (error: any) {
    console.error('Error submitting payment:', error);
    res.status(400).json({ error: error.message || 'Failed to submit payment' });
  }
});

// Foreman logs a manual cash payment
router.post('/log-cash', async (req: any, res: any) => {
  try {
    const payment = await PaymentModel.logCash(req.body);
    res.status(201).json(payment);
  } catch (error: any) {
    console.error('Error logging cash payment:', error);
    res.status(400).json({ error: error.message || 'Failed to log cash payment' });
  }
});

// Foreman approves or rejects a pending payment receipt
router.post('/:id/verify', async (req: any, res: any) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const payment = await PaymentModel.verify(id, status);
    res.json(payment);
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(400).json({ error: error.message || 'Verification action failed' });
  }
});

export default router;
