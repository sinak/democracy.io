import { Router } from "express";
import Legislators from "../legislators/LegislatorsSearchInstance";
import * as Models from "../models";
import * as POTC from "../services/PotcAPI";

const expressRouter = Router();

/**
 * GET /legislators/findByDistrict
 * 1. Finds the legislators for state/district
 * 2. Retrieves form data for each legislator from PotC
 */
expressRouter.get("/legislators/findByDistrict", async (req, res) => {
  const { state, district } = req.query;

  const foundLegislators = Legislators.findLegislators(
    state,
    parseInt(district)
  );
  if (foundLegislators.length === 0) {
    return res.status(400).json({
      error: "Could not find any legislators",
    });
  }

  // get each legislator's form info from POTC
  let formElementsData: POTC.RetrieveFormElementsResponse;

  const bioguideIds = foundLegislators.map(
    (legislator) => legislator.bioguideId
  );
  try {
    const formElementsRes = await POTC.retrieveFormElements(bioguideIds);
    console.log(formElementsRes.headers);
    formElementsData = formElementsRes.data;
  } catch (e) {
    return res.status(504).json({
      error: "Request to Phantom of the Capitol failed",
    });
  }

  /**
   * merge legislator data with POTC's form data
   * note: it is possible that POTC won't have data on a legislator.
   * if there is no data, `responseData[bioguideID]` will be undefined
   */
  const legislators = foundLegislators.map<Models.LegislatorContact>(
    (legislator, index) => {
      const legislatorFound = legislator.bioguideId in formElementsData;

      // determine if we can successfully send a message to the legislator

      if (legislatorFound === false) {
        return {
          legislator: foundLegislators[index],
          form: {
            status: Models.LegislatorWebFormStatus.NotFound,
            url: null,
            topics: [],
          },
        };
      }

      const optionsHash = formElementsData[
        legislator.bioguideId
      ].required_actions.find((ra) => ra.value === "$TOPIC")?.options_hash;

      if (optionsHash === undefined) {
        return {
          legislator: foundLegislators[index],
          form: {
            status: Models.LegislatorWebFormStatus.DIOError,
            url: formElementsData[legislator.bioguideId].contact_url,
            topics: [],
          },
        };
      }

      const topics = normalizeLegislatorTopics(optionsHash);

      let formStatus: Models.LegislatorWebFormStatus;
      if (formElementsData[legislator.bioguideId].defunct) {
        // POTC is reporting the legislator as defunct
        formStatus = Models.LegislatorWebFormStatus.Defunct;
      } else {
        formStatus = Models.LegislatorWebFormStatus.Ok;
      }

      return {
        legislator: foundLegislators[index],
        form: {
          status: formStatus,
          url: formElementsData[legislator.bioguideId].contact_url || "",
          topics: topics,
        },
      };
    }
  );

  res.json(legislators);
});

function normalizeLegislatorTopics(
  optionsHash: string[] | { [key: string]: string }
): { label: string; value: string }[] {
  if (Array.isArray(optionsHash)) {
    return optionsHash.map((option) => ({ label: option, value: option }));
  } else {
    return Object.entries(optionsHash).map((entry) => ({
      label: entry[0],
      value: entry[1],
    }));
  }
}

export default expressRouter;
