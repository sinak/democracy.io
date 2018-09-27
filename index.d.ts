declare namespace Congress {
  declare type Legislator = Senator | Representative;
  declare interface LegislatorBase {
    firstName: string;
    lastName: string;
    bioguideId: string;
    state: string;
  }
  interface Senator extends LegislatorBase {
    chamber: "senate";
    title: "Sen";
    district: null;
  }
  interface Representative extends LegislatorBase {
    chamber: "house";
    title: "Rep";
    district: string;
  }
}

declare namespace SmartyStreets {
  declare namespace StreetAddress {
    declare interface Body {
      input_id?: string;
      street: string;
      street2?: string;
      secondary?: string;
      city?: string;
      lastline?: string;
      addressee?: string;
      urbanization?: string;
      candidates?: string;
      match?: "strict" | "range" | "invalid";
    }

    declare interface Result {
      input_id: string;
      input_index: number;
      candidate_index: number;
      addressee: string;
      delivery_line_1: string;
      delivery_line_2: string;
      last_line: string;
      delivery_point_barcode: string;
      components: StreetAddressResultComponents;
      metadata: StreetAddressResultMetadata;
    }

    declare interface ResultComponents {
      urbanization?: string;
      primary_number: string;
      street_name: string;
      street_predirection?: string;
      street_postdirection?: string;
      street_suffix: string;
      secondary_number?: string;
      secondary_designator?: string;
      extra_secondary_number?: string;
      pmb_designator?: string;
      city_name: string;
      default_city_name?: string;
      state_abbreviation: string;
      zipcode: string;
      plus4_code: string;
      delivery_point: string;
      delivery_point_check_digit: string;
    }
    declare interface ResultMetadata {
      record_type: "F" | "G" | "H" | "P" | "R" | "S" | "[blank]";
      zip_type: "Unique" | "Military" | "POBox" | "Standard";
      county_fips: string;
      county_name: string;
      carrier_route: string;
      congressional_district: string;
      building_default_indicator: "Y" | "N";
      rdi: "Residential" | "Commercial" | "[blank]";
      elot_sequence: string;
      elot_sort: string;
      latittude: number;
      longitude: number;
      precision:
        | "Unknown"
        | "None"
        | "State"
        | "SolutionArea"
        | "City"
        | "Zip5"
        | "Zip6"
        | "Zip7"
        | "Zip8"
        | "Zip9"
        | "Structure";
      time_zone: string;
      utf_offset: number;
      dst: string;
    }
    declare interface ResultAnalysis {
      dpv_match_code: "Y" | "N" | "S" | "D" | "[blank]";
      dpv_footnotes: string;
      dpv_cmra: "Y" | "N" | "[blank]";
      dpv_vacant: "Y" | "N" | "[blank]";
      active: "Y" | "N" | "[blank]";
      ews_match?: "true" | "[blank]";
      footnotes: string;
      lacslink_code?: "A" | "00" | "09" | "14" | "92" | "[blank]";
      lacslink_indicator?: "Y" | "S" | "N" | "F" | "[blank]";
      suitelink_match?: "true" | "false";
    }
  }
}

declare namespace POTC {
  declare interface FormElementsResult {
    [key: string]: LegislatorData;
  }

  declare interface LegislatorData {
    required_actions: RequiredAction[];
    defunct?: boolean;
    contact_url?: string;
  }

  declare interface RequiredAction {
    maxlength: any;
    value: string;
    options_hash: any;
  }

  declare namespace FillOutForm {
    declare interface Request {
      bio_id: string;
      campaign_tag: string;
      fields: object;
    }

    declare type Response = ResponseNoCaptcha | ResponseCaptcha;

    declare interface ResponseNoCaptcha {
      status: "success" | "error";
    }

    declare interface ResponseCaptcha {
      status: "captcha_needed";
      url: string;
    }
  }
}
