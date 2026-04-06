import { Router } from 'express';
import * as effCivicCrm from '../services/eff-civic-crm.js';
import { makeResponse, makeError } from '../helpers/response.js';

const router = Router();

router.post('/subscription', async (req, res) => {
  const { sender, canonicalAddress } = req.body;

  const params = {
    contact_params: {
      email: sender.email,
      first_name: sender.firstName,
      last_name: sender.lastName,
      source: 'democracy.io',
      subscribe: true,
    },
    address_params: {
      street: '',
      city: canonicalAddress.components.cityName,
      state: canonicalAddress.components.stateName,
      zip: canonicalAddress.components.zipcode,
      country: 'USA',
    },
  };

  try {
    const result = await effCivicCrm.subscribeToEFFMailingList(params);
    if (result.status >= 200 && result.status < 300) {
      res.json(makeResponse({}));
    } else {
      res.status(result.status).json(makeError(result.data, result.status));
    }
  } catch (err) {
    res.status(400).json(makeError(err));
  }
});

export default router;
