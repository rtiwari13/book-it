import { Router } from 'express';
import { getExperienceWithSlots } from '../services/experience.service';

const router = Router();

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const experience = await getExperienceWithSlots(id);
    res.json(experience);
  } catch (error) {
    res.status(404).json({ error: 'Experience not found' });
  }
});

export default router;