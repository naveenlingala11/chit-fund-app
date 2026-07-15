import { Router } from 'express';
import { ChitModel } from '../db/models/chit';

const router = Router();

// Get all chits
router.get('/', async (req: any, res: any) => {
  const { userId, role } = req.query;
  try {
    const chits = await ChitModel.findAll(userId as string, role as string);
    res.json(chits);
  } catch (error) {
    console.error('Error fetching chits:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new chit group
router.post('/', async (req: any, res: any) => {
  try {
    const newChit = await ChitModel.create(req.body);
    res.status(201).json(newChit);
  } catch (error) {
    console.error('Error creating chit:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch detailed view of a single chit group including member list
router.get('/:id', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const chitDetails = await ChitModel.findById(id);
    if (!chitDetails) {
      res.status(404).json({ error: 'Chit not found' });
      return;
    }
    res.json(chitDetails);
  } catch (error) {
    console.error('Error fetching chit details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add member by name, phone, and optional member number (registers if doesn't exist)
router.post('/:id/members', async (req: any, res: any) => {
  const { id } = req.params;
  const { name, phone, memberNumber } = req.body;
  try {
    const result = await ChitModel.addMember(id, name, phone, memberNumber);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error adding member to chit:', error);
    res.status(400).json({ error: error.message || 'Failed to add member' });
  }
});

// Remove member from recruiting chit group
router.delete('/:id/members/:userId', async (req: any, res: any) => {
  const { id, userId } = req.params;
  try {
    const removed = await ChitModel.removeMember(id, userId);
    if (!removed) {
      res.status(404).json({ error: 'Member not enrolled in this chit group' });
      return;
    }
    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error: any) {
    console.error('Error removing member:', error);
    res.status(400).json({ error: error.message || 'Failed to remove member' });
  }
});

// Edit member details (name, phone, member number)
router.put('/:id/members/:userId', async (req: any, res: any) => {
  const { id, userId } = req.params;
  const { name, phone, memberNumber } = req.body;
  try {
    const updated = await ChitModel.editMember(id, userId, name, phone, memberNumber);
    res.json({ success: updated, message: 'Member details updated successfully' });
  } catch (error: any) {
    console.error('Error editing member:', error);
    res.status(400).json({ error: error.message || 'Failed to edit member' });
  }
});

// Update chit group settings
router.put('/:id', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const updated = await ChitModel.update(id, req.body);
    res.json({ success: updated, message: 'Chit group updated successfully' });
  } catch (error: any) {
    console.error('Error updating chit:', error);
    res.status(400).json({ error: error.message || 'Failed to update chit' });
  }
});

// Delete / Archive chit group
router.delete('/:id', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const deleted = await ChitModel.delete(id);
    res.json({ success: deleted, message: 'Chit group deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting chit:', error);
    res.status(400).json({ error: error.message || 'Failed to delete chit' });
  }
});

// Duplicate chit group
router.post('/:id/duplicate', async (req: any, res: any) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const newChit = await ChitModel.duplicate(id, name);
    res.status(201).json(newChit);
  } catch (error: any) {
    console.error('Error duplicating chit:', error);
    res.status(400).json({ error: error.message || 'Failed to duplicate chit' });
  }
});

export default router;
