// @ts-check
import * as POTC from "../services/PotcAPI";
import * as Models from "../models";
import Config from "../config";
import { Router } from "express";
import Legislators from "../legislators/LegislatorsSearchInstance";

const expressRouter = Router();

/**
 * GET /legislators/findByDistrict
 */
expressRouter.get("/legislators/findByDistrict", async (req, res) => {
  const { state, district } = req.query;

  const foundLegislators = Legislators.findLegislators(
    state,
    parseInt(district)
  );
  if (foundLegislators.length === 0) {
    return res.status(400).json({
      error: "Missing legislator or bioguide ID"
    });
  }

  const bioguideIds = foundLegislators.map(legislator => legislator.bioguideId);

  // get each legislator's form info from POTC
  let formElementsData: POTC.RetrieveFormElementsResponse;

  try {
    const formElementsRes = await POTC.retrieveFormElements(bioguideIds);
    formElementsData = formElementsRes.data;
  } catch (e) {
    return res.status(504).json({
      error: "Request to Phantom of the Capitol failed"
    });
  }

  /**
   * merge legislator data with POTC's form data
   * note: it is possible that POTC won't have data on a legislator.
   * if there is no data, `responseData[bioguideID]` will be undefined
   */
  const legislators = bioguideIds.map<Models.LegislatorContact>((id, index) => {
    const legislatorFound = id in formElementsData;

    let formStatus;
    if (legislatorFound === false) {
      formStatus = Models.LegislatorWebFormStatus.ComingSoon;
    } else if (formElementsData[id].defunct) {
      formStatus = Models.LegislatorWebFormStatus.Defunct;
    } else {
      formStatus = Models.LegislatorWebFormStatus.Ok;
    }

    return {
      ...foundLegislators[index],
      form: {
        status: formStatus,
        url: legislatorFound ? formElementsData[id].contact_url : "",
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
      }
    };
  });

  res.json(legislators);
});

export default expressRouter;
