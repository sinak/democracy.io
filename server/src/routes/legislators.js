// @ts-check
import * as POTC from "../services/PotcAPI";
import * as Models from "./../Models";
import Config from "./../config";
import { Router } from "express";

const CongressLegislators = require("../congress-legislators/Legislators");

const resHelpers = require("./helpers/response");

const expressRouter = Router();

/**
 * GET /legislators/findByDistrict
 */
expressRouter.get("/legislators/findByDistrict", async (req, res) => {
  const { state, district } = req.query;

  const foundLegislators = CongressLegislators.findLegislators(state, district);
  if (foundLegislators.length === 0) {
    return res.status(400).json(
      resHelpers.makeError({
        message: "Missing legislator or bioguideID data."
      })
    );
  }

  const bioguideIds = foundLegislators.map(legislator => legislator.bioguideId);

  // get each legislator's form info from POTC
  /** @type {POTC.RetrieveFormElementsResponse} */
  let formElementsData;

  try {
    const formElementsRes = await POTC.retrieveFormElements(bioguideIds);
    formElementsData = formElementsRes.data;
  } catch (e) {
    return res.status(400).json(
      resHelpers.makeError({
        error: e,
        message: "HTTP Request to Phantom of the Capitol failed"
      })
    );
  }

  /**
   * merge legislator data with POTC's form data
   * note: it is possible that POTC won't have data on a legislator.
   * if there is no data, `responseData[bioguideID]` will be undefined
   */
  /** @type {Models.Legislator[]} */
  const legislators = bioguideIds.map((id, index) => {
    const legislatorFound = id in formElementsData;

    /** @type {"ok" | "coming_soon" | "defunct" } */
    let formStatus;
    if (legislatorFound === false) {
      formStatus = "coming_soon";
    } else if (formElementsData[id].defunct) {
      formStatus = "defunct";
    } else {
      formStatus = "ok";
    }

    return {
      ...foundLegislators[index],
      formStatus: formStatus,
      contactURL: legislatorFound ? formElementsData[id].contact_url : "",
      formElements: legislatorFound
        ? formElementsData[id].required_actions.map(action => {
            // rename properties to camel case
            return {
              value: action.value,
              maxLength: action.maxlength,
              optionsHash: action.options_hash
            };
          })
        : []
    };
  });

  res.json({
    status: "success",
    data: legislators
  });
});

/**
 * /legislators/message
 * Handles posting one or more new message via POTC.
 */

var crypto = require("crypto");

expressRouter.post("/legislators/message", async (req, res) => {
  /** @type {Models.Message[]} */
  const messages = req.body;

  /**
   * map message form fields to POTC's /fill-out-form params
   * @param {Models.Message} message
   * @returns {POTC.FillOutFormRequest}
   */
  function messageToFillOutFormBody(message) {
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
  /** @type {POTC.FillOutFormRequest[]} */
  const potcMessages = messages.map(messageToFillOutFormBody);

  const sendMessageRequests = potcMessages.map(message =>
    POTC.fillOutForm(message)
  );

  let messageResponses = [];

  for (let i = 0; i < sendMessageRequests.length; i++) {
    try {
      const res = await sendMessageRequests[i];
      messageResponses.push({
        bioguideId: potcMessages[i].bio_id,
        status: res.data.status
      });
    } catch (e) {
      // handle failure
    }
  }

  res.json({
    status: "success",
    data: messageResponses
  });
});

export default expressRouter;
