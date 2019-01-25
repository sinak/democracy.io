/**
 * Router for all routes under /
 */
const path = require("path");
const express = require("express");
const serveFavicon = require("serve-favicon");
const consolidate = require("consolidate");

const config = require("./../config");
const app = express();

// views
app.engine("dust", consolidate.dust);
app.set("views", path.resolve(path.join(__dirname, "../templates")));
app.set("view engine", "dust");

// NOTE: The app currently assumes a flat deploy with the server serving static assets directly.
var BUILD_DIR = path.resolve(path.join(__dirname, "../../.build"));

// favicon
app.use(
  serveFavicon(
    path.join(BUILD_DIR, "static", config.VERSION, "img/favicon.ico")
  )
);

// NOTE: EFF doesn't use CDNs, so rely on static serve w/ a caching layer in front of it in prod
app.use(express.static(BUILD_DIR, config.get("STATIC")));

app.route("/").get(require("./home"));

app.route("/privacy-policy").get((req, res) => {
  res.render("privacy-policy");
});

module.exports = app;
