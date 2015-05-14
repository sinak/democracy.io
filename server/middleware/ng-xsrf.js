module.exports = function (config) {

  return function(req, res, next) {
    res.cookie('XSRF-TOKEN', res.locals._csrf);
    next();
  };

};
