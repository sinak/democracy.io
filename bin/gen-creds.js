var crypto = require("crypto");

var salt = crypto.randomBytes(64).toString("base64");
console.log("salt: " + salt);