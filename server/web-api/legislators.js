// @ts-check
const _ = require("lodash");
const expressRouter = require("express").Router();
const config = require("./../config");
const CongressLegislators = require("../congress-legislators/Legislators");
const potc = require("../services/POTC");
const resHelpers = require("./helpers/response");
const us = require("us");

/**
 * GET /legislators/findByDistrict
 */
expressRouter.get("/legislators/findByDistrict", async (req, res) => {
  const { state, district } = req.query;

  // validate
  if (CongressLegislators.validDistrict(state, district) === false) {
    return res.status(400).json(
      resHelpers.makeError({
        message: "Bad value for state/district parameter"
      })
    );
  }

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
  /** @type {import("axios").AxiosResponse<POTC.FormElementsResult>} */
  let formElementsRes;
  try {
    formElementsRes = await potc.getFormElements(bioguideIds);
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
  /** @type {import("./../Models").Legislator[]} */
  const legislators = bioguideIds.map((id, index) => {
    const formElementsData = formElementsRes.data;

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
  /** @type {import("./../Models").Message[]} */
  const messages = req.body;

  /**
   * map message form fields to POTC's /fill-out-form params
   * @param {import("./../Models").Message} message
   * @returns {POTC.FillOutForm.Request}
   */
  function messageToFillOutFormBody(message) {
    const addrComponents = message.canonicalAddress.components;
    return {
      bio_id: message.bioguideId,
      campaign_tag: `${config.get(
        "CAMPAIGNS.DEFAULT_TAG"
      )}-${crypto.randomBytes(16).toString("hex")}`,
      fields: {
        $NAME_PREFIX: message.sender.namePrefix,
        $NAME_FIRST: message.sender.firstName,
        $NAME_LAST: message.sender.lastName,
        $ADDRESS_CITY: addrComponents.cityName,
        $ADDRESS_STATE_POSTAL_ABBREV: addrComponents.stateAbbreviation,
        $ADDRESS_COUNTY: message.canonicalAddress.county,
        $ADDRESS_ZIP5: addrComponents.zipcode,
        $ADDRESS_ZIP4: addrComponents.plus4Code,
        $PHONE: message.sender.phone,
        $PHONE_PARENTHESES: message.sender.parenPhone,
        $EMAIL: message.sender.email,
        $TOPIC: message.topic,
        $SUBJECT: message.subject,
        $MESSAGE: message.message,
        $CAMPAIGN_UUID: message.campaign.uuid,
        $ORG_URL: message.campaign.orgURL,
        $ORG_NAME: message.campaign.orgName,

        // computed fields
        $NAME_FULL: message.sender.firstName + message.sender.lastName,
        $ADDRESS_STATE_FULL: us.lookup(addrComponents.stateAbbreviation).name,
        $ADDRESS_STREET: _.compact([
          addrComponents.primaryNumber,
          addrComponents.streetPredirection,
          addrComponents.streetName,
          addrComponents.streetPostdirection,
          addrComponents.streetSuffix
        ]).join(" "),
        $ADDRESS_STREET_2: null, // This is never set
        $ADDRESS_ZIP_PLUS_4: addrComponents.plus4Code
          ? addrComponents.zipcode
          : `${addrComponents.zipcode}-${addrComponents.plus4Code}`
      }
    };
  }

  // build the body for each message sent to POTC /fill-form requests
  /** @type {POTC.FillOutForm.Request[]} */
  const potcMessages = messages.map(messageToFillOutFormBody);
  const sendMessageRequests = potcMessages.map(message =>
    potc.sendMessage(message)
  );

  let messageResponses = [];
  for (let request of sendMessageRequests) {
    try {
      const res = await request;
      messageResponses.push({ bioguideId: "", status: res.data.status });
    } catch (e) {
      // handle failure
    }
  }
  res.json({
    status: "success",
    data: messageResponses
  });
});

module.exports = expressRouter;
