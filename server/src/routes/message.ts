import crypto from "crypto";
import express from "express";
import * as Models from "./../models";
import Config from "./../config";
import * as PotcAPI from "./../services/PotcAPI";
import { captureException } from "@sentry/core";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";

const expressRouter = express();

const rateLimiter = new RateLimiterMemory({
  points: 30,
  duration: 3600
});

// rate limit
expressRouter.use("/message", async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rateLimiterRes) {
    let rls: RateLimiterRes = rateLimiterRes;

    res.setHeader("Retry-After", rls.msBeforeNext / 1000);
    res.sendStatus(429);
  }
});

/**
 * /message
 * Handles posting one or more new message via POTC.
 */

expressRouter.post("/message", async (req, res) => {
  /** @type {Models.Message[]} */
  const messages = req.body;

  /**
   * map message form fields to POTC's /fill-out-form params
   */
  function messageToFillOutFormBody(
    message: Models.Message
  ): PotcAPI.FillOutFormRequest {
    const address = message.senderAddress;
    return {
      bio_id: message.bioguideId,
      campaign_tag: `${Config.POTC_CAMPAIGN_TAG}-${crypto
        .randomBytes(16)
        .toString("hex")}`,
      fields: {
        // sender
        $NAME_PREFIX: message.sender.namePrefix,
        $NAME_FIRST: message.sender.firstName,
        $NAME_LAST: message.sender.lastName,
        $NAME_FULL: message.sender.firstName + message.sender.lastName,
        $PHONE: message.sender.phone,
        $PHONE_PARENTHESES: message.sender.parenPhone,
        $EMAIL: message.sender.email,

        // address
        $ADDRESS_STREET: address.streetAddress,
        $ADDRESS_STREET_2: null, // This is never set
        $ADDRESS_CITY: address.city,
        $ADDRESS_STATE_POSTAL_ABBREV: address.statePostalAbbrev,
        $ADDRESS_STATE_FULL: address.stateFull,
        $ADDRESS_COUNTY: address.county,
        $ADDRESS_ZIP5: address.zip5,
        $ADDRESS_ZIP4: address.zip4,
        $ADDRESS_ZIP_PLUS_4: address.zipPlus4,

        // message
        $TOPIC: message.topic,
        $SUBJECT: message.subject,
        $MESSAGE: message.message,

        // campaign
        $CAMPAIGN_UUID: message.campaign.uuid,
        $ORG_URL: message.campaign.orgURL,
        $ORG_NAME: message.campaign.orgName
      }
    };
  }

  // build the body for each message sent to POTC /fill-form requests
  const potcMessages: PotcAPI.FillOutFormRequest[] = messages.map(
    messageToFillOutFormBody
  );

  const sendMessageRequests = potcMessages.map(message =>
    PotcAPI.fillOutForm(message)
  );

  let messageResponses: Models.MessageResponse[] = [];

  for (let i = 0; i < sendMessageRequests.length; i++) {
    try {
      const res = await sendMessageRequests[i];
      messageResponses.push({
        bioguideId: potcMessages[i].bio_id,
        potcResponse: res.data
      });
    } catch (e) {
      messageResponses.push({
        bioguideId: potcMessages[i].bio_id
      });
      captureException(e);
    }
  }

  res.json(messageResponses);
});

export default expressRouter;
