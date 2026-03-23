import { Router } from 'express';
import crypto from 'crypto';
import { legislators } from '../dio/legislator-search.js';
import * as potc from '../services/potc.js';
import * as potcHelpers from '../helpers/potc.js';
import { makeResponse, makeError } from '../helpers/response.js';
import { config } from '../config.js';
import type { Message } from '../types.js';

const router = Router();

router.get('/legislators/findByDistrict', async (req, res) => {
  const { state, district } = req.query;

  if (!state || !district || !legislators.validDistrict(state as string, district as string)) {
    return res.status(400).json(makeError({ message: 'Bad value for state/district parameter' }));
  }

  const found = legislators.findLegislators(state as string, district as string);
  const bioguideIds = found.map((l) => l.bioguideId);

  if (bioguideIds.length === 0) {
    return res.status(400).json(makeError({ message: 'No legislators found for the given state and district.' }));
  }

  try {
    const formElementsRes = await potc.getFormElementsForRepIdsFromPOTC(bioguideIds);
    const formElementsData = formElementsRes.data;

    const augmented = found.map((legislator, index) => {
      const id = bioguideIds[index];
      const hasPOTCData = formElementsData.hasOwnProperty(id);

      if (hasPOTCData) {
        return {
          ...legislator,
          defunct: formElementsData[id].defunct ?? false,
          contact_url: formElementsData[id].contact_url,
          comingSoon: false,
        };
      } else {
        return { ...legislator, defunct: false, contact_url: undefined, comingSoon: true };
      }
    });

    res.json(makeResponse(augmented));
  } catch (err) {
    // If POTC is down, still return legislators without POTC data
    res.json(makeResponse(found.map((l) => ({ ...l, defunct: false, comingSoon: true }))));
  }
});

router.post('/legislators/message', async (req, res) => {
  const messages: Message[] = Array.isArray(req.body) ? req.body : [req.body];

  const potcMessages = messages.map((message) => {
    const tag = config.campaignTag + '-' + crypto.randomBytes(16).toString('hex');
    return potcHelpers.makePOTCMessage(message, tag);
  });

  try {
    const responses = await Promise.all(potcMessages.map((m) => potc.sendMessage(m)));
    const modelData = responses.map((r) => r.data);
    res.json(makeResponse(modelData));
  } catch (err) {
    res.status(400).json(makeError(err));
  }
});

export default router;
