declare namespace POTC {
  export interface FormElementsResult {
    [key: string]: LegislatorData;
  }

  export interface LegislatorData {
    required_actions: RequiredAction[];
    defunct?: boolean;
    contact_url?: string;
  }

  export interface RequiredAction {
    maxlength: any;
    value: string;
    options_hash: any;
  }

  declare namespace FillOutForm {
    export interface Request {
      bio_id: string;
      campaign_tag: string;
      fields: object;
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
