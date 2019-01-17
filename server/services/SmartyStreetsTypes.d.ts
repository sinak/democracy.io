declare namespace SmartyStreets {
  export namespace USStreetAPI {
    export interface Lookup {
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

    export interface Candidate {
      input_id: string;
      input_index: number;
      candidate_index: number;
      addressee?: string;
      delivery_line_1: string;
      delivery_line_2?: string;
      last_line: string;
      delivery_point_barcode: string;
      components: Components;
      metadata: Metadata;
      analysis: Analysis;
    }

    export interface Components {
      urbanization?: string;
      primary_number?: string;
      street_name: string;
      street_predirection?: string;
      street_postdirection?: string;
      street_suffix?: string;
      secondary_number?: string;
      secondary_designator?: string;
      extra_secondary_number?: string;
      pmb_designator?: string;
      city_name: string;
      default_city_name?: string;
      state_abbreviation: string;
      zipcode?: string;
      plus4_code: string;
      delivery_point?: string;
      delivery_point_check_digit?: string;
    }
    export interface Metadata {
      record_type: "F" | "G" | "H" | "P" | "R" | "S" | "[blank]";
      zip_type: "Unique" | "Military" | "POBox" | "Standard";
      county_fips: string;
      county_name: string;
      carrier_route?: string;
      congressional_district?: string;
      building_default_indicator?: "Y" | "N";
      rdi?: "Residential" | "Commercial" | "[blank]";
      elot_sequence?: string;
      elot_sort?: string;
      latitude: number;
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
      dst: boolean;
    }
    export interface Analysis {
      dpv_match_code?: "Y" | "N" | "S" | "D" | "[blank]";
      dpv_footnotes: string;
      dpv_cmra?: "Y" | "N" | "[blank]";
      dpv_vacant?: "Y" | "N" | "[blank]";
      active?: "Y" | "N" | "[blank]";
      ews_match?: "true" | "[blank]";
      footnotes: string;
      lacslink_code?: "A" | "00" | "09" | "14" | "92" | "[blank]";
      lacslink_indicator?: "Y" | "S" | "N" | "F" | "[blank]";
      suitelink_match?: "true" | "false";
    }
  }
}
