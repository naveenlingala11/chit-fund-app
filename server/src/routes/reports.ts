import { Router } from 'express';
import { ReportModel } from '../db/models/report';

const router = Router();

// Get aggregate overview for foreman's dashboard
router.get('/overview', async (req: any, res: any) => {
  const { userId } = req.query;
  try {
    const overview = await ReportModel.getOverview(userId as string);
    res.json(overview);
  } catch (error) {
    console.error('Error fetching report overview:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get per-chit-group stats
router.get('/chit-stats', async (req: any, res: any) => {
  const { userId } = req.query;
  try {
    const stats = await ReportModel.getChitGroupStats(userId as string);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching chit group stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get monthly collection data for a specific chit
router.get('/monthly-collection', async (req: any, res: any) => {
  const { chitId } = req.query;
  try {
    const data = await ReportModel.getMonthlyCollection(chitId as string);
    res.json(data);
  } catch (error) {
    console.error('Error fetching monthly collection:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get defaulters list
router.get('/defaulters', async (req: any, res: any) => {
  const { userId } = req.query;
  try {
    const defaulters = await ReportModel.getDefaulters(userId as string);
    res.json(defaulters);
  } catch (error) {
    console.error('Error fetching defaulters:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get member payment matrix for a chit group
router.get('/payment-matrix', async (req: any, res: any) => {
  const { chitId } = req.query;
  try {
    const matrix = await ReportModel.getMemberPaymentMatrix(chitId as string);
    res.json(matrix);
  } catch (error) {
    console.error('Error fetching payment matrix:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get financial projections
router.get('/projections', async (req: any, res: any) => {
  const { userId } = req.query;
  try {
    const projections = await ReportModel.getProjections(userId as string);
    res.json(projections);
  } catch (error) {
    console.error('Error fetching projections:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get audit trail log
router.get('/audit-trail', async (req: any, res: any) => {
  const { userId } = req.query;
  try {
    const trail = await ReportModel.getAuditTrail(userId as string);
    res.json(trail);
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
