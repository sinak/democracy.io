/**
 * Root controller to render the top level Democracy.io page.
 */
const config = require("./../config");

var home = function(req, res) {
  var maintenanceMode = config.get("MAINTENANCE_MODE");
  if (maintenanceMode == "false") maintenanceMode = false;

  if (maintenanceMode && !req.query.maintenance) res.render("maintenance");
  else res.render("index", { CONFIG: config });
};

module.exports = home;
