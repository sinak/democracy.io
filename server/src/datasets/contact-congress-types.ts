/**
 * contact-congress dataset
 * https://github.com/unitedstates/contact-congress
 *
 * This code is currently only used in tests.
 * In production, this data is pulled from the Phantom of the Capitol API.
 */

/**
 *
 * https://github.com/unitedstates/contact-congress/blob/21a5788e48f54f9e43f82ef18d5f94494d3feb30/documentation/schema.md
 */
export interface ContactCongressMember {
  /**
   * bioguide is the legislator's assigned
   * [Bioguide ID](http://bioguide.congress.gov/) which can be used to connect
   * this data to other data sources in the
   * [unitedstates project](https://github.com/unitedstates).
   */
  bioguide: string;

  /**
   * The HTTP method used to submit the form in all caps, most likely
   * GET or POST
   */
  method: string;

  /**
   * The URL the form should submit to. An empty string ('') can be used to
   * represent the URL the form is located at, but otherwise, this should be an
   * absolute URL like http://github.com/unitedstates/congress-contact, rather
   * than /unitedstates/congress-contact, even if that is what appears in the
   * form.
   */
  action: string;

  /**
   * contact_form is a nested hash of the pertinent details of successfully
   * filling out and validating receipt of the member's contact form.
   */
  contact_form: {
    method: string;
    action: string;
    steps: Step[];
  };
}

export type Step =
  | StepVisit
  | StepFind
  | StepFillIn
  | StepSelect
  | StepCheck
  | StepUncheck
  | StepChoose
  | StepClickOn
  | StepWait
  | StepJavascript;

export interface InputStep {
  name: string;
  selector: string;
  value: string;
  required?: boolean;
  options: {};
  withinFrame?: string;
}

/**
 * The act of navigating to a given url.
 */
interface StepVisit {
  visit: string;
}
/**
 * Locating a selector on the page, an indication that no further steps should
 * be executed until the selector is present and visible.
 */
interface StepFind {
  find: {
    /**
     * The selector of a find step is just a string CSS selector which should
     * be found on the page (and should be visible) before proceeding to execute
     * more steps.
     */
    selector: string;
    /**
     * The value of a find step is optional, and it may specify the markup
     * contained in the element that is required for this element to be found.
     */
    value?: string;
    /**
     * The options attribute for the find step may be specified as wait: x,
     * where x is an integer number of seconds. If the element is not found
     * within this number of seconds, the form fill will be abandoned and should
     * return an error to the caller.
     */
    options?: {
      wait: number;
    };
    /**
     * The within_frame attribute is optional and consists of a string denoting
     * the selector of an iframe on the page. If present, the find step will be
     * executed in the context of the matching iframe.
     */
    within_frame?: string;
  };
}

/**
 * The value of a fill_in step can be a single field, or a list of hashes
 * defining a batch of fields to fill in at once, but should be defined as a
 * list either way. Each hash describes a form field by a few attributes, many
 * of which are common to most steps:
 */
export interface StepFillIn {
  fill_in: InputStep[];
}

/**
 * Like the other input-related steps, selects can list either one or many
 * hashes. Attributes are the same as fill_in with the addition of options, a
 * list of the possible options which can be selected. If the value attributes
 * of the select's options are obscure abbreviations or otherwise
 * non-human-readable, the value of options can be a hash where the key is the
 * text that appears in the select box when the option is selected, and the
 * value is the option's value attribute. In cases where the options are common
 * across several members' forms, a constant may be used as a placeholder.
 * Available constants are listed in constants.yaml in this repository.
 * Currently the only available constants are a list of the postal codes of
 * the 50 US states plus DC, and the full list of states and territories.
 * The constants encountered in options lists comprise the keys in
 * constants.yaml so the resulting constants hash can be indexed directly
 * with them.
 *
 * The within_frame attribute is optional and consists of a string denoting the
 * selector of an iframe on the page. If present, the select step will be executed in the context of the matching iframe.
 */
export interface StepSelect {
  select: InputStep[];
}
interface StepCheck {
  check: {
    /**
     * the actual value attribute of the checkbox that should be checked/unchecked/chosen, in case several have the same name attribute.
     */
    value: string;
  };
}
interface StepUncheck {
  uncheck: {
    /**
     * the actual value attribute of the checkbox that should be checked/unchecked/chosen, in case several have the same name attribute.
     */
    value: string;
  };
}
interface StepChoose {
  uncheck: {
    /**
     * the actual value attribute of the checkbox that should be checked/unchecked/chosen, in case several have the same name attribute.
     */
    value: string;
  };
}
/**
 * A click_on step terminates the preceding list of input-related steps, by submitting the web form. It is a list containing a hash with only two possible keys: selector and value. selector is the CSS selector for finding the button or link to click, and value is the HTML value attribute if present, both to disambiguate and for the benefit of clients which may be POSTing directly instead of using a headless browser, though this is not recommended. selector is the only attribute you must provide/should expect to be guaranteed.

The within_frame attribute is optional and consists of a string denoting the selector of an iframe on the page. If present, the click_on step will be executed in the context of the matching iframe.
 */
interface StepClickOn {
  click_on: {
    selector: string;
  };
}

/**
 * wait

This step should be considered experimental and subject to change

This is not part of the capybara command set, but is in place at least temporarily for the benefit of javascript-capable clients. It may get folded into find at a later date. It indicates the integer number of seconds that should be waited before performing the next action.

This step is not to be confused with the wait option under find, which denotes the maximum time that should pass while waiting for an element to appear.
 */
interface StepWait {
  wait: number;
}

interface StepJavascript {
  javascript: string;
}

interface StepRecaptcha {
  recaptcha: {
    value: true;
  };
}
