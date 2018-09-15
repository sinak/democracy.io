export namespace POTC {
  export interface FormElementsRes {
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
}
