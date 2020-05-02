import React from "react";
import { POTCCaptcha } from "../../../../server/src/models";
import Whitebox from "../Whitebox";
import { captureException } from "@sentry/browser";

interface CaptchaSolveFormProps {
  captchas: POTCCaptcha[];
}

export default function CaptchaSolveForm(props: CaptchaSolveFormProps) {
  return (
    <Whitebox showBackButton={false}>
      <div>
        {props.captchas.map((captcha) => {
          const htmlID = `captcha-${captcha.uid}`;
          return (
            <div>
              <img
                src={captcha.url}
                alt="This is an image captcha. Unfortunately we cannot provide an audio based captcha at this time."
                onError={(e) => captureException(e)}
              />
              <div className="form-group">
                <label htmlFor={`captcha-${htmlID}`}>Enter CAPTCHA text</label>
                <input id={htmlID} className="form-control" type="text" />
              </div>
            </div>
          );
        })}
      </div>
      <p>Submitting the CAPTCHA text.</p>{" "}
      <p className="small">
        This may take up to 90 seconds - thanks for being patient!
      </p>
    </Whitebox>
  );
}
