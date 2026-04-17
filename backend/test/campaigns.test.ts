import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { deriveSupabaseAuthUrls } from '../src/auth.js';
import { createApp } from '../src/app.js';
import { createCampaignService } from '../src/services/campaigns.js';
import { createTestAuthHarness } from './support/auth.js';
import {
  buildPublishedCampaignSeed,
  createInMemoryCampaignRepository,
} from './support/in-memory-campaign-repository.js';

async function createTestContext() {
  const auth = await createTestAuthHarness();
  const repository = createInMemoryCampaignRepository();
  const campaignService = createCampaignService(repository);
  const app = createApp({
    includeFrontend: false,
    authVerifier: auth.verifier,
    campaignService,
  });

  return {
    app,
    auth,
    repository,
  };
}

function bearer(token: string) {
  return `Bearer ${token}`;
}

describe('campaign backend', () => {
  it('derives the Supabase issuer and JWKS URL from the project URL', () => {
    expect(deriveSupabaseAuthUrls('https://demo.supabase.co/')).toEqual({
      issuer: 'https://demo.supabase.co/auth/v1',
      jwksUrl: 'https://demo.supabase.co/auth/v1/.well-known/jwks.json',
    });
  });

  it('requires valid bearer auth and enforces the admin allowlist', async () => {
    const { app, auth } = await createTestContext();

    const missingTokenResponse = await request(app).get('/api/1/campaigns');
    expect(missingTokenResponse.status).toBe(401);

    const invalidTokenResponse = await request(app)
      .get('/api/1/campaigns')
      .set('Authorization', bearer('not-a-real-token'));
    expect(invalidTokenResponse.status).toBe(401);

    const userToken = await auth.createToken({ email: 'user@example.com' });
    const adminToken = await auth.createToken({ email: 'admin@example.com' });

    const nonAdminResponse = await request(app)
      .get('/api/1/admin/campaigns')
      .set('Authorization', bearer(userToken));
    expect(nonAdminResponse.status).toBe(403);

    const adminResponse = await request(app)
      .get('/api/1/admin/campaigns')
      .set('Authorization', bearer(adminToken));
    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.data.campaigns).toEqual([]);
  });

  it('generates random draft slugs on create and refuses organizer edits after creation', async () => {
    const { app, auth } = await createTestContext();
    const token = await auth.createToken();

    const createResponse = await request(app)
      .post('/api/1/campaigns')
      .set('Authorization', bearer(token))
      .send({
        title: 'My Great Campaign',
        summary: 'A test campaign',
      });

    expect(createResponse.status).toBe(201);
    expect(/^[a-z0-9]{12}$/.test(createResponse.body.data.campaign.slug as string)).toBe(true);
    expect(createResponse.body.data.campaign.slug === 'my-great-campaign').toBe(false);

    const secondCreateResponse = await request(app)
      .post('/api/1/campaigns')
      .set('Authorization', bearer(token))
      .send({
        title: 'My Great Campaign',
      });

    expect(secondCreateResponse.status).toBe(201);
    expect(/^[a-z0-9]{12}$/.test(secondCreateResponse.body.data.campaign.slug as string)).toBe(
      true
    );
    expect(
      secondCreateResponse.body.data.campaign.slug === createResponse.body.data.campaign.slug
    ).toBe(false);

    const campaignId = createResponse.body.data.campaign.id as string;

    const patchDraftResponse = await request(app)
      .patch(`/api/1/campaigns/${campaignId}`)
      .set('Authorization', bearer(token))
      .send({ slug: 'Updated Draft Slug' });

    expect(patchDraftResponse.status).toBe(409);
    expect(patchDraftResponse.body.message).toBe('Campaigns cannot be edited after creation.');
  });

  it('rejects reserved root-level slugs on create', async () => {
    const { app, auth } = await createTestContext();
    const token = await auth.createToken();

    const response = await request(app)
      .post('/api/1/campaigns')
      .set('Authorization', bearer(token))
      .send({
        title: 'Reserved slug campaign',
        slug: 'thanks',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('slug is reserved by a top-level route.');
  });

  it('applies enable, auto-disable, admin disable, and restore transitions', async () => {
    const { app, auth } = await createTestContext();
    const organizerToken = await auth.createToken({ email: 'organizer@example.com' });
    const adminToken = await auth.createToken({ email: 'admin@example.com' });

    const createResponse = await request(app)
      .post('/api/1/campaigns')
      .set('Authorization', bearer(organizerToken))
      .send({ title: 'Transition Campaign', slug: 'transition-campaign' });

    const campaignId = createResponse.body.data.campaign.id as string;

    const publishResponse = await request(app)
      .post(`/api/1/campaigns/${campaignId}/publish`)
      .set('Authorization', bearer(organizerToken));

    expect(publishResponse.status).toBe(200);
    expect(publishResponse.body.data.campaign.status).toBe('published');
    expect(publishResponse.body.data.campaign.firstPublishedAt).toBeTruthy();

    const createSecondResponse = await request(app)
      .post('/api/1/campaigns')
      .set('Authorization', bearer(organizerToken))
      .send({ title: 'Second Campaign', slug: 'second-campaign' });

    const secondCampaignId = createSecondResponse.body.data.campaign.id as string;

    const secondPublishResponse = await request(app)
      .post(`/api/1/campaigns/${secondCampaignId}/publish`)
      .set('Authorization', bearer(organizerToken));

    expect(secondPublishResponse.status).toBe(200);
    expect(secondPublishResponse.body.data.campaign.status).toBe('published');

    const organizerCampaignsResponse = await request(app)
      .get('/api/1/campaigns')
      .set('Authorization', bearer(organizerToken));

    expect(organizerCampaignsResponse.status).toBe(200);
    expect(
      organizerCampaignsResponse.body.data.campaigns.filter(
        (campaign: { status: string }) => campaign.status === 'published'
      ).length
    ).toBe(1);
    expect(
      organizerCampaignsResponse.body.data.campaigns.find(
        (campaign: { id: string }) => campaign.id === campaignId
      )?.status
    ).toBe('archived');

    const archiveResponse = await request(app)
      .post(`/api/1/campaigns/${secondCampaignId}/archive`)
      .set('Authorization', bearer(organizerToken));

    expect(archiveResponse.status).toBe(200);
    expect(archiveResponse.body.data.campaign.status).toBe('archived');
    expect(archiveResponse.body.data.campaign.archivedAt).toBeTruthy();

    const disableResponse = await request(app)
      .post(`/api/1/admin/campaigns/${campaignId}/disable`)
      .set('Authorization', bearer(adminToken));

    expect(disableResponse.status).toBe(200);
    expect(disableResponse.body.data.campaign.status).toBe('disabled');
    expect(disableResponse.body.data.campaign.disabledAt).toBeTruthy();

    const restoreResponse = await request(app)
      .post(`/api/1/admin/campaigns/${campaignId}/restore`)
      .set('Authorization', bearer(adminToken));

    expect(restoreResponse.status).toBe(200);
    expect(restoreResponse.body.data.campaign.status).toBe('archived');
    expect(restoreResponse.body.data.campaign.disabledAt).toBeNull();
  });

  it('shows unavailable archived and disabled campaigns on the public routes while keeping drafts hidden', async () => {
    const { app, repository } = await createTestContext();

    const publishedCampaign = repository.seedCampaign(
      buildPublishedCampaignSeed({
        title: 'Published campaign',
        slug: 'published-campaign',
      })
    );

    repository.seedCampaign({
      title: 'Draft campaign',
      slug: 'draft-campaign',
      status: 'draft',
    });

    repository.seedCampaign({
      ...buildPublishedCampaignSeed({
        title: 'Archived campaign',
        slug: 'archived-campaign',
        status: 'archived',
        statusBeforeDisabled: 'archived',
        archivedAt: new Date().toISOString(),
      }),
    });

    repository.seedCampaign({
      ...buildPublishedCampaignSeed({
        title: 'Disabled campaign',
        slug: 'disabled-campaign',
        status: 'disabled',
        statusBeforeDisabled: 'published',
        disabledAt: new Date().toISOString(),
      }),
    });

    const publishedResponse = await request(app).get('/api/1/public/campaigns/published-campaign');
    expect(publishedResponse.status).toBe(200);
    expect(publishedResponse.body.data.campaign.slug).toBe(publishedCampaign.slug);
    expect(publishedResponse.body.data.campaign.status).toBe('published');

    const draftResponse = await request(app).get('/api/1/public/campaigns/draft-campaign');
    expect(draftResponse.status).toBe(404);

    const archivedResponse = await request(app).get('/api/1/public/campaigns/archived-campaign');
    expect(archivedResponse.status).toBe(200);
    expect(archivedResponse.body.data.campaign.status).toBe('archived');

    const disabledResponse = await request(app).get('/api/1/public/campaigns/disabled-campaign');
    expect(disabledResponse.status).toBe(200);
    expect(disabledResponse.body.data.campaign.status).toBe('disabled');

    const eventResponse = await request(app)
      .post('/api/1/public/campaigns/published-campaign/events')
      .send({ type: 'page_view' });

    expect(eventResponse.status).toBe(201);
    expect(eventResponse.body.data.event.type).toBe('page_view');

    const flowStartResponse = await request(app)
      .post('/api/1/public/campaigns/published-campaign/events')
      .send({
        type: 'flow_start',
        metadata: {
          campaignSessionId: 'session-123',
        },
      });

    expect(flowStartResponse.status).toBe(201);
    expect(flowStartResponse.body.data.event.type).toBe('flow_start');
    expect(flowStartResponse.body.data.event.metadata).toEqual({
      campaignSessionId: 'session-123',
    });

    const hiddenEventResponse = await request(app)
      .post('/api/1/public/campaigns/archived-campaign/events')
      .send({ type: 'page_view' });

    expect(hiddenEventResponse.status).toBe(404);

    const disabledEventResponse = await request(app)
      .post('/api/1/public/campaigns/disabled-campaign/events')
      .send({ type: 'page_view' });

    expect(disabledEventResponse.status).toBe(404);
  });

  it('aggregates public stats from campaign events and successful message submissions', async () => {
    const { app, repository } = await createTestContext();

    const campaign = repository.seedCampaign(
      buildPublishedCampaignSeed({
        title: 'Stats campaign',
        slug: 'stats-campaign',
      })
    );

    repository.seedEvent({ campaignId: campaign.id, type: 'page_view' });
    repository.seedEvent({ campaignId: campaign.id, type: 'page_view' });
    repository.seedEvent({ campaignId: campaign.id, type: 'flow_start' });

    repository.seedSubmission({
      batchId: 'batch-a',
      campaignUuid: campaign.id,
      campaignTag: null,
      deliveryStatus: 'submitted',
      deliveryError: null,
    });

    repository.seedSubmission({
      batchId: 'batch-a',
      campaignUuid: null,
      campaignTag: campaign.slug,
      deliveryStatus: 'submitted',
      deliveryError: null,
    });

    repository.seedSubmission({
      batchId: 'batch-b',
      campaignUuid: campaign.id,
      campaignTag: null,
      deliveryStatus: 'error',
      deliveryError: 'delivery failed',
    });

    repository.seedSubmission({
      batchId: 'batch-c',
      campaignUuid: null,
      campaignTag: campaign.slug,
      deliveryStatus: 'submitted',
      deliveryError: null,
    });

    const response = await request(app).get('/api/1/public/campaigns/stats-campaign');

    expect(response.status).toBe(200);
    expect(response.body.data.campaign.stats).toEqual({
      pageViews: 2,
      flowStarts: 1,
      peopleTakenAction: 2,
      totalMessagesSent: 3,
    });
  });
});
