import { Router } from 'express';
import { legislators } from '../dio/legislator-search.js';
import * as potc from '../services/potc.js';
import * as potcHelpers from '../helpers/potc.js';
import { makeResponse, makeError } from '../helpers/response.js';
import { config } from '../config.js';
import type { Message } from '../types.js';

const router = Router();

router.get('/legislator/:bioguideId', (req, res) => {
  const legislator = legislators.getLegislatorByID(req.params.bioguideId);

  if (!legislator) {
    return res.status(400).json(makeError({ message: 'No legislator matches this bioguide id' }));
  }

  res.json(makeResponse(legislator));
});

router.get('/legislator/:bioguideId/formElements', async (req, res) => {
  const { bioguideId } = req.params;

  try {
    const formElementsRes = await potc.getFormElementsForRepIdsFromPOTC([bioguideId]);
    const modelData = potcHelpers.makeLegislatorFormElements(formElementsRes.data[bioguideId], bioguideId);
    res.json(makeResponse(modelData));
  } catch (err) {
    res.status(400).json(makeError(err));
  }
});

router.post('/legislator/:bioguideId/message', async (req, res) => {
  const message: Message = req.body;
  const potcMessage = potcHelpers.makePOTCMessage(message, config.campaignTag);

  if (message.bioguideId !== req.params.bioguideId) {
    return res.status(400).json(makeError({ message: 'legislator bioguideId does not match message bioguideId' }));
  }

  try {
    const sendRes = await potc.sendMessage(potcMessage);
    res.json(makeResponse({ ...sendRes.data, bioguideId: message.bioguideId }));
  } catch (err) {
    res.status(400).json(makeError(err));
  }
});

export default router;
