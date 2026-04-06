import type { Message, LegislatorFormElements } from '../types.js';

export function makePOTCMessage(message: Message, campaignTag: string) {
  const addr = message.canonicalAddress;
  const components = addr.components;
  const sender = message.sender;

  const fullName = `${sender.firstName} ${sender.lastName}`;
  const streetParts = [
    components.primaryNumber,
    components.streetPredirection,
    components.streetName,
    components.streetPostdirection,
    components.streetSuffix,
  ].filter(Boolean);
  const streetAddress = streetParts.join(' ');

  const fullZip = components.plus4Code
    ? `${components.zipcode}-${components.plus4Code}`
    : components.zipcode;

  const fields: Record<string, any> = {
    $NAME_PREFIX: sender.namePrefix,
    $NAME_FIRST: sender.firstName,
    $NAME_LAST: sender.lastName,
    $NAME_FULL: fullName,
    $ADDRESS_STREET: streetAddress,
    $ADDRESS_CITY: components.cityName,
    $ADDRESS_STATE_POSTAL_ABBREV: components.stateAbbreviation,
    $ADDRESS_STATE_FULL: components.stateName,
    $ADDRESS_COUNTY: sender.county,
    $ADDRESS_ZIP5: components.zipcode,
    $ADDRESS_ZIP4: components.plus4Code,
    $ADDRESS_ZIP_PLUS_4: fullZip,
    $PHONE: sender.phone,
    $PHONE_PARENTHESES: sender.parenPhone,
    $EMAIL: sender.email,
    $TOPIC: message.topic,
    $SUBJECT: message.subject,
    $MESSAGE: message.message,
    $CAMPAIGN_UUID: message.campaign.uuid,
    $ORG_URL: message.campaign.orgURL,
    $ORG_NAME: message.campaign.orgName,
  };

  // Remove null/undefined fields
  const cleanFields: Record<string, any> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v != null) cleanFields[k] = v;
  }

  const tag = message.campaign.tag || campaignTag;

  return {
    bio_id: message.bioguideId,
    fields: cleanFields,
    campaign_tag: tag,
  };
}

export function makeLegislatorFormElements(
  potcResponse: any,
  bioguideId: string
): LegislatorFormElements {
  const formElements = (potcResponse?.required_actions || []).map((action: any) => ({
    value: action.value,
    maxLength: action.maxlength,
    optionsHash: action.options_hash,
  }));

  return { bioguideId, formElements };
}
