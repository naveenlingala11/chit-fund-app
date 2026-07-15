import { Router } from 'express';
import { AuctionModel } from '../db/models/auction';

const router = Router();

// Get list of auctions for a specific chit group
router.get('/', async (req: any, res: any) => {
  const { chitId } = req.query;
  try {
    const auctions = await AuctionModel.findByChitId(chitId as string);
    res.json(auctions);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Submit surety documents for a won auction
router.post('/:id/sureties', async (req: any, res: any) => {
  const { id } = req.params; // Auction ID
  const { sureties } = req.body;
  try {
    await AuctionModel.submitSureties(id, sureties);
    res.status(201).json({ success: true, message: 'Sureties submitted successfully' });
  } catch (error: any) {
    console.error('Error submitting sureties:', error);
    res.status(400).json({ error: error.message || 'Failed to submit sureties' });
  }
});

// Fetch all sureties for a chit group
router.get('/chit/:chitId/sureties', async (req: any, res: any) => {
  const { chitId } = req.params;
  try {
    const sureties = await AuctionModel.getSuretiesForChit(chitId);
    res.json(sureties);
  } catch (error) {
    console.error('Error fetching sureties for chit:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch sureties for an auction (used by Foreman review panel)
router.get('/:id/sureties', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const sureties = await AuctionModel.getSureties(id);
    res.json(sureties);
  } catch (error) {
    console.error('Error fetching sureties:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Foreman approves or rejects a specific surety document
router.post('/sureties/:suretyId/verify', async (req: any, res: any) => {
  const { suretyId } = req.params;
  const { status } = req.body;
  try {
    const surety = await AuctionModel.verifySuretyDoc(suretyId, status);
    res.json(surety);
  } catch (error: any) {
    console.error('Error verifying surety:', error);
    res.status(400).json({ error: error.message || 'Verification action failed' });
  }
});

// Foreman release prize money disburse
router.post('/:id/disburse', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    await AuctionModel.releasePayout(id);
    res.json({ success: true, message: 'Prize money marked as disbursed successfully' });
  } catch (error: any) {
    console.error('Error releasing payout:', error);
    res.status(400).json({ error: error.message || 'Failed to disburse prize money' });
  }
});

export default router;
