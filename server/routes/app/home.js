/**
 * Root controller to render the top level Democracy.io page.
 */

var home = function(req, res) {
  var maintenanceMode = req.app.locals.CONFIG.get('MAINTENANCE_MODE');
  if (maintenanceMode == 'false')
    maintenanceMode = false;

  if (maintenanceMode && !req.query.maintenance)
    res.render('maintenance');
  else
    res.render('index');
};


module.exports = home;
