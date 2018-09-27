/**
 *
 */

var resHelpers = require('../../helpers/response');
var potc = require('../../../../services/third-party-apis/potc');
var potcHelpers = require('../../helpers/potc');


/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
var get = function (req, res) {
  var bioguideId = req.params.bioguideId;

  potc
    .getFormElementsForRepIdsFromPOTC([bioguideId])
    .then(formElementsRes => {
      var modelData = potcHelpers.makeLegislatorFormElements(formElementsRes.data[bioguideId], bioguideId);
      res.json(resHelpers.makeResponse(modelData))
    })
    .catch(err => {
      return res.status(400).json(resHelpers.makeError(err));
    })
};


module.exports.get = get;
