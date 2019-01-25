/**
 *
 */

var apiHelpers = require("./helpers/api");
var effCivicCRM = require("../services/eff-civic-crm");
var models = require("../../models");
var resHelpers = require("./helpers/response");
const router = require("express").Router();

router.post("/subscription", async function(req, res) {
  var request = apiHelpers.getModelData(req.body, models.SubscriptionRequest);

  var params = {
    contact_params: {
      email: request.sender.email,
      first_name: request.sender.firstName,
      last_name: request.sender.lastName,
      source: "democracy.io",
      subscribe: true
    },
    address_params: {
      street: "",
      city: request.canonicalAddress.components.cityName,
      state: request.canonicalAddress.components.stateName,
      zip: request.canonicalAddress.components.zipcode,
      country: "USA" // hardcoded for now
    }
  };

  try {
    let subscribeRes = await effCivicCRM.subscribeToEFFMailingList(params);

    if (subscribeRes.status >= 200 && subscribeRes.status < 300) {
      // TODO(leah): Look at the format of the response on this
      var modelData = {};
      res.json(resHelpers.makeResponse(modelData));
    } else {
      res
        .status(subscribeRes.status)
        .json(resHelpers.makeError(subscribeRes.data, subscribeRes.status));
    }
  } catch (err) {
    res.status(400).json(resHelpers.makeError(err));
  }
});

module.exports = router;
