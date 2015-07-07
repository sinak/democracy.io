/**
 * Root controller to render the top level Democracy.io page.
 */

var home = function(req, res) {
  res.render('index');
  console.log('ip:', req.ip);
  console.log('ips:', req.ips);
};


module.exports = home;
