declare namespace POTC {
  interface FormElementsResult {
    [key: string]: LegislatorFormElements;
  }
  interface LegislatorFormElements {
    required_actions: {
      maxlength: any;
      value: string;
      options_hash: any;
    }[];
    defunct?: boolean;
    contact_url?: string;
  }

  declare namespace FillOutForm {
    export interface Request {
      bio_id: string;
      campaign_tag: string;
      fields: {
        [key: string]: any;
      };
    }

    export type Response = ResponseNoCaptcha | ResponseCaptcha;

    export interface ResponseNoCaptcha {
      status: "success" | "error";
    }

    export interface ResponseCaptcha {
      status: "captcha_needed";
      url: string;
    }
  }

  export interface FillOutCaptchaBody {
    answer: string;
    uid: string;
  }

  export interface FillOutCaptchaResponse {
    status: "success" | "error";
  }
}
