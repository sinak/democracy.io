import React from "react";

export default function Footer() {
  return (
    <div id="footer" className="bg-white py-5" style={{ fontSize: 14 }}>
      <div className="container">
        <div className="mx-auto">
          <div style={{ width: 150 }} className="mx-auto">
            <svg
              className="logo"
              preserveAspectRatio="none"
              viewBox="0 0 232 20"
            >
              <use xlinkHref="#s-text" />
            </svg>
          </div>

          <div className="text-center">
            <p className="my-2 text-muted">
              <span className="d-none d-sm-block">
                Send messages to members of the US Senate and House of
                Representatives.
              </span>{" "}
            </p>
            <a className="px-3" href="/privacy-policy">
              Privacy Policy
            </a>
            <a
              className="px-3"
              href="mailto:contact@democracy.io?Subject=Democracy.io"
            >
              Contact Us
            </a>
            <a
              className="px-3"
              href="mailto:contact@democracy.io?Subject=Contact%20Congress%20API&body=I%27m%20interested%20in%20using%20an%20API%20for%20delivering%20email%20to%20Congress.%20I%27d%20be%20using%20it%20for%20..."
            >
              Email delivery API
            </a>
            <a className="px-3" href="https://github.com/sinak/democracy.io">
              View code on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
