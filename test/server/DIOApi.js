const axios = require("axios").default;

module.exports = axios.create({
  baseURL: "http://localhost:3005"
});
