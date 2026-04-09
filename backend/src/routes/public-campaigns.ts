import { Router } from 'express';
import { makeError, makeResponse } from '../helpers/response.js';
import {
  type CampaignService,
  getCampaignErrorStatusCode,
} from '../services/campaigns.js';
import type {
  CampaignEventResponse,
  CreateCampaignEventRequest,
  PublicCampaignResponse,
} from '../types.js';

interface PublicCampaignRoutesOptions {
  campaignService: CampaignService;
}

function isObjectBody(value: unknown) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function createPublicCampaignRoutes({ campaignService }: PublicCampaignRoutesOptions) {
  const router = Router();

  router.get('/public/campaigns/:slug', async (req, res) => {
    try {
      const campaign = await campaignService.getPublicCampaignBySlug(req.params.slug);
      const payload: PublicCampaignResponse = { campaign };
      res.json(makeResponse(payload));
    } catch (err) {
      res.status(getCampaignErrorStatusCode(err)).json(makeError(err, getCampaignErrorStatusCode(err)));
    }
  });

  router.post('/public/campaigns/:slug/events', async (req, res) => {
    if (!isObjectBody(req.body)) {
      return res.status(400).json(makeError({ message: 'Campaign event request body must be an object.' }, 400));
    }

    try {
      const event = await campaignService.recordPublicCampaignEvent(
        req.params.slug,
        req.body as CreateCampaignEventRequest,
        {
          requestIp: req.ip,
          userAgent: req.get('user-agent') || undefined,
          referrer: req.get('referer') || undefined,
        }
      );

      const payload: CampaignEventResponse = { event };
      res.status(201).json(makeResponse(payload));
    } catch (err) {
      res.status(getCampaignErrorStatusCode(err)).json(makeError(err, getCampaignErrorStatusCode(err)));
    }
  });

  return router;
}
