import { Router } from 'express';
import * as potc from '../services/potc.js';
import { makeResponse, makeError } from '../helpers/response.js';

const router = Router();

router.post('/captchaSolution', async (req, res) => {
  try {
    const result = await potc.solveCaptcha(req.body);
    res.json(makeResponse(result.data));
  } catch (err) {
    res.status(400).json(makeError(err));
  }
});

export default router;
