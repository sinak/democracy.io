import { Router } from 'express';
import * as smartyStreets from '../services/smarty-streets.js';
import * as ssHelpers from '../helpers/smarty-streets.js';
import { makeResponse, makeError } from '../helpers/response.js';

const router = Router();

router.get('/location/verify', async (req, res) => {
  try {
    const result = await smartyStreets.verifyAddress(req.query.address as string);
    const canonicalAddresses = await Promise.all(
      result.data.map(ssHelpers.makeCanonicalAddressFromSSResponse)
    );
    res.json(makeResponse(canonicalAddresses));
  } catch (err) {
    res.status(400).json(makeError(err));
  }
});

export default router;
