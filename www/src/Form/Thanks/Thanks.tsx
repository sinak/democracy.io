import React from "react";
import { ReactComponent as FacebookLogoSVG } from "./FacebookLogo.svg";
import { ReactComponent as TwitterLogoSVG } from "./TwitterLogo.svg";
import { ReactComponent as MailSVG } from "./Mail.svg";

const FACEBOOK_SHARE_LINK =
  "https://www.facebook.com/sharer/sharer.php?app_id=709021229138321&u=https%3A%2F%2Fdemocracy.io%2F&display=popup";

const TWITTER_SHARE_LINK =
  "https://twitter.com/intent/tweet?status=I%20just%20wrote%20a%20letter%20to%20my%20representatives%20using%20https%3A%2F%2Fdemocracy.io&related=eff,efflive";

const EMAIL_SHARE_LINK =
  "mailto:?Subject=Writing%20to%20my%20representatives&Body=Hi%2C%0A%0AI%20just%20wrote%20a%20message%20to%20my%20representatives%20using%20https%3A//democracy.io%20about%20an%20important%20issue%20I%20care%20about.%0A%0AWill%20you%20do%20the%20same%3F%0A%0AThanks%2C%0A%0A";

function openPopup(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  window.open(e.currentTarget.href, "Share", "width=650,height=400");
}

export default function() {
  return (
    <div>
      <div id="thanks" className="col-md-8 col-lg-4 mx-auto">
        <p>
          Spread the word and ask your friends to write to their representatives
          too.
        </p>

        <div id="share-icons">
          <svg
            id="triangle"
            viewBox="78 267.9 767.5 383.9"
            width="30"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M78,268l383.8,383.8L845.5,268H78z" fill="#fff" />
          </svg>

          <div className="d-flex">
            <div className="col col-xs-4">
              <a
                className="share-link"
                onClick={openPopup}
                href={FACEBOOK_SHARE_LINK}
              >
                <FacebookLogoSVG />
              </a>
            </div>
            <div className="col col-xs-4">
              <a
                className="share-link"
                onClick={openPopup}
                href={TWITTER_SHARE_LINK}
              >
                <TwitterLogoSVG />
              </a>
            </div>
            <div className="col col-xs-4">
              <a className="share-link" href={EMAIL_SHARE_LINK}>
                <MailSVG />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
