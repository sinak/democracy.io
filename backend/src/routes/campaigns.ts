import type { RequestHandler } from 'express';
import { Router } from 'express';
import { makeError, makeResponse } from '../helpers/response.js';
import {
  type CampaignService,
  getCampaignErrorStatusCode,
} from '../services/campaigns.js';
import type {
  CampaignDetailResponse,
  CampaignListResponse,
  CreateCampaignRequest,
  UpdateCampaignRequest,
} from '../types.js';

interface CampaignRoutesOptions {
  campaignService: CampaignService;
  requireAuthenticatedUser: RequestHandler;
}

function isObjectBody(value: unknown) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function createCampaignRoutes({ campaignService, requireAuthenticatedUser }: CampaignRoutesOptions) {
  const router = Router();

  router.get('/campaigns', requireAuthenticatedUser, async (req, res) => {
    try {
      const campaigns = await campaignService.listOrganizerCampaigns({
        userId: req.auth!.userId,
        email: req.auth!.email,
      });

      const payload: CampaignListResponse = { campaigns };
      res.json(makeResponse(payload));
    } catch (err) {
      res.status(getCampaignErrorStatusCode(err)).json(makeError(err, getCampaignErrorStatusCode(err)));
    }
  });

  router.post('/campaigns', requireAuthenticatedUser, async (req, res) => {
    if (!isObjectBody(req.body)) {
      return res.status(400).json(makeError({ message: 'Campaign request body must be an object.' }, 400));
    }

    try {
      const campaign = await campaignService.createCampaign(
        {
          userId: req.auth!.userId,
          email: req.auth!.email,
        },
        req.body as CreateCampaignRequest
      );

      const payload: CampaignDetailResponse = { campaign };
      res.status(201).json(makeResponse(payload));
    } catch (err) {
      res.status(getCampaignErrorStatusCode(err)).json(makeError(err, getCampaignErrorStatusCode(err)));
    }
  });

  router.get('/campaigns/:id', requireAuthenticatedUser, async (req, res) => {
    try {
      const campaignId = String(req.params.id);
      const campaign = await campaignService.getOrganizerCampaign(
        {
          userId: req.auth!.userId,
          email: req.auth!.email,
        },
        campaignId
      );

      const payload: CampaignDetailResponse = { campaign };
      res.json(makeResponse(payload));
    } catch (err) {
      res.status(getCampaignErrorStatusCode(err)).json(makeError(err, getCampaignErrorStatusCode(err)));
    }
  });

  router.patch('/campaigns/:id', requireAuthenticatedUser, async (req, res) => {
    if (!isObjectBody(req.body)) {
      return res.status(400).json(makeError({ message: 'Campaign request body must be an object.' }, 400));
    }

    try {
      const campaignId = String(req.params.id);
      const campaign = await campaignService.updateCampaign(
        {
          userId: req.auth!.userId,
          email: req.auth!.email,
        },
        campaignId,
        req.body as UpdateCampaignRequest
      );

      const payload: CampaignDetailResponse = { campaign };
      res.json(makeResponse(payload));
    } catch (err) {
      res.status(getCampaignErrorStatusCode(err)).json(makeError(err, getCampaignErrorStatusCode(err)));
    }
  });

  router.post('/campaigns/:id/publish', requireAuthenticatedUser, async (req, res) => {
    try {
      const campaignId = String(req.params.id);
      const campaign = await campaignService.publishCampaign(
        {
          userId: req.auth!.userId,
          email: req.auth!.email,
        },
        campaignId
      );

      const payload: CampaignDetailResponse = { campaign };
      res.json(makeResponse(payload));
    } catch (err) {
      res.status(getCampaignErrorStatusCode(err)).json(makeError(err, getCampaignErrorStatusCode(err)));
    }
  });

  router.post('/campaigns/:id/archive', requireAuthenticatedUser, async (req, res) => {
    try {
      const campaignId = String(req.params.id);
      const campaign = await campaignService.archiveCampaign(
        {
          userId: req.auth!.userId,
          email: req.auth!.email,
        },
        campaignId
      );

      const payload: CampaignDetailResponse = { campaign };
      res.json(makeResponse(payload));
    } catch (err) {
      res.status(getCampaignErrorStatusCode(err)).json(makeError(err, getCampaignErrorStatusCode(err)));
    }
  });

  router.delete('/campaigns/:id', requireAuthenticatedUser, async (req, res) => {
    try {
      const campaignId = String(req.params.id);
      await campaignService.deleteCampaign(
        {
          userId: req.auth!.userId,
          email: req.auth!.email,
        },
        campaignId
      );

      res.status(204).send();
    } catch (err) {
      res.status(getCampaignErrorStatusCode(err)).json(makeError(err, getCampaignErrorStatusCode(err)));
    }
  });

  return router;
}
