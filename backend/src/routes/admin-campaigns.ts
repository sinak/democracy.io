import type { RequestHandler } from 'express';
import { Router } from 'express';
import { makeError, makeResponse } from '../helpers/response.js';
import {
  type CampaignService,
  getCampaignErrorStatusCode,
} from '../services/campaigns.js';
import type { CampaignDetailResponse, CampaignListResponse } from '../types.js';

interface AdminCampaignRoutesOptions {
  campaignService: CampaignService;
  requireAuthenticatedUser: RequestHandler;
  requireAdminUser: RequestHandler;
}

export function createAdminCampaignRoutes({
  campaignService,
  requireAuthenticatedUser,
  requireAdminUser,
}: AdminCampaignRoutesOptions) {
  const router = Router();

  router.get('/admin/campaigns', requireAuthenticatedUser, requireAdminUser, async (_req, res) => {
    try {
      const campaigns = await campaignService.listAdminCampaigns();
      const payload: CampaignListResponse = { campaigns };
      res.json(makeResponse(payload));
    } catch (err) {
      res.status(getCampaignErrorStatusCode(err)).json(makeError(err, getCampaignErrorStatusCode(err)));
    }
  });

  router.post('/admin/campaigns/:id/disable', requireAuthenticatedUser, requireAdminUser, async (req, res) => {
    try {
      const campaign = await campaignService.disableCampaign(String(req.params.id));
      const payload: CampaignDetailResponse = { campaign };
      res.json(makeResponse(payload));
    } catch (err) {
      res.status(getCampaignErrorStatusCode(err)).json(makeError(err, getCampaignErrorStatusCode(err)));
    }
  });

  router.post('/admin/campaigns/:id/restore', requireAuthenticatedUser, requireAdminUser, async (req, res) => {
    try {
      const campaign = await campaignService.restoreCampaign(String(req.params.id));
      const payload: CampaignDetailResponse = { campaign };
      res.json(makeResponse(payload));
    } catch (err) {
      res.status(getCampaignErrorStatusCode(err)).json(makeError(err, getCampaignErrorStatusCode(err)));
    }
  });

  return router;
}
