import * as React from "react";

export default function() {
  return (
    <div id="footer">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <svg
              className="logo"
              preserveAspectRatio="none"
              viewBox="0 0 232 20"
            >
              <use xlinkHref="#s-text" />
            </svg>
            <p>
              <span className="hidden-xs">
                Send messages to members of the US Senate and House of
                Representatives.
              </span>{" "}
            </p>
            <ul>
              <li>
                <a href="/privacy-policy">Privacy Policy</a>
              </li>
              <li>
                <a href="mailto:contact@democracy.io?Subject=Democracy.io">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="mailto:contact@democracy.io?Subject=Contact%20Congress%20API&body=I%27m%20interested%20in%20using%20an%20API%20for%20delivering%20email%20to%20Congress.%20I%27d%20be%20using%20it%20for%20...">
                  Email delivery API
                </a>
              </li>
              <li className="hidden-xs">
                <a href="https://github.com/sinak/democracy.io">
                  View code on GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
