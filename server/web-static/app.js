/**
 * Router for all routes under /
 */
const path = require("path");
const express = require("express");

const config = require("./../config");
const app = express();

// NOTE: The app currently assumes a flat deploy with the server serving static assets directly.
var BUILD_DIR = path.resolve(path.join(__dirname, "../../.build"));

// NOTE: EFF doesn't use CDNs, so rely on static serve w/ a caching layer in front of it in prod
app.use(express.static(BUILD_DIR, config.get("STATIC")));

app.route("/").get(require("./home"));

module.exports = app;
