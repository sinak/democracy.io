import { Router } from 'express';
import * as potc from '../services/potc.js';
import * as potcHelpers from '../helpers/potc.js';
import { makeResponse, makeError } from '../helpers/response.js';

const router = Router();

router.get('/formElements/findByLegislatorBioguideIds', async (req, res) => {
  const bioguideIds = req.query.bioguideIds;
  if (!bioguideIds) {
    return res.sendStatus(400);
  }

  // Frontend sends comma-separated string like "id1,id2", Express may also parse repeated params as array
  const ids = Array.isArray(bioguideIds)
    ? (bioguideIds as string[])
    : (bioguideIds as string).split(',');

  try {
    const formElementsRes = await potc.getFormElementsForRepIdsFromPOTC(ids);
    const modelData = Object.keys(formElementsRes.data).map((id) =>
      potcHelpers.makeLegislatorFormElements(formElementsRes.data[id], id)
    );
    res.json(makeResponse(modelData));
  } catch (err) {
    res.status(400).json(makeError(err));
  }
});

export default router;
