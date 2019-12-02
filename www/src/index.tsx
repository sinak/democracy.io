// these imports must be at the top
import "react-app-polyfill/ie9";
import "react-app-polyfill/stable";
import "intersection-observer";
//////////////////////////////////////////

import { init } from "@sentry/browser";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "./Assets/sass/app.scss";
import * as serviceWorker from "./serviceWorker";

if (process.env.NODE_ENV === "production") {
  init({
    dsn: process.env.REACT_APP_SENTRY_DSN
    // TODO: scrub personal data
    // beforeSend: event => {
    // }
  });
}

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
