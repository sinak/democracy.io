import type {
  CanonicalAddress,
  FormElement,
  Legislator,
  LegislatorFormElements,
  Message,
  PublicCampaign,
  TopicOption,
  CountyData,
} from '../types';

export function parseTopicOptions(topicElem: FormElement, legislator: Legislator): TopicOption {
  const options = Array.isArray(topicElem.optionsHash)
    ? topicElem.optionsHash
    : Object.keys(topicElem.optionsHash);

  return {
    bioguideId: legislator.bioguideId,
    name: `${legislator.title}. ${legislator.lastName}`,
    options,
    optionsHash: topicElem.optionsHash,
    selected: options[0],
  };
}

export function parseCountyOptions(countyElem: FormElement, addressCounty: string): CountyData {
  const countyOptions = countyElem.optionsHash as string[];
  const selectedCounty = countyOptions.find(
    (c) => addressCounty === c || c.startsWith(addressCounty)
  );
  return {
    selected: selectedCounty ?? countyOptions[0],
    options: countyOptions,
  };
}

export function getCountyData(
  formElements: LegislatorFormElements[],
  addressCounty: string
): CountyData {
  for (const lfe of formElements) {
    const countyElem = lfe.formElements.find((fe) => fe.value === '$ADDRESS_COUNTY');
    if (countyElem) {
      return parseCountyOptions(countyElem, addressCounty);
    }
  }
  return {};
}

export function getTopicOptions(
  formElements: LegislatorFormElements[],
  legislators: Legislator[]
): Record<string, TopicOption> {
  const topicOptions: Record<string, TopicOption> = {};

  for (const lfe of formElements) {
    const topicElem = lfe.formElements.find((fe) => fe.value === '$TOPIC');
    if (topicElem) {
      const legislator = legislators.find((l) => l.bioguideId === lfe.bioguideId);
      if (legislator) {
        topicOptions[lfe.bioguideId] = parseTopicOptions(topicElem, legislator);
      }
    }
  }

  return topicOptions;
}

export function createFormFields(
  formElements: LegislatorFormElements[],
  legislators: Legislator[],
  address: CanonicalAddress
) {
  const countyData = getCountyData(formElements, address.county);
  return {
    countyData,
    formData: {
      prefix: 'Ms.',
      county: countyData.selected,
    },
    topicOptions: getTopicOptions(formElements, legislators),
  };
}

export function makeMessage(
  legislator: Legislator,
  formData: Record<string, string>,
  phoneValue: string,
  topicOptions: Record<string, TopicOption>,
  address: CanonicalAddress,
  campaign?: Pick<
    PublicCampaign,
    'id' | 'organizationName' | 'organizationUrl' | 'slug'
  > | null
): Message {
  const topic = topicOptions[legislator.bioguideId];
  let topicValue: string | undefined;

  if (topic) {
    topicValue = Array.isArray(topic.optionsHash)
      ? topic.selected
      : (topic.optionsHash as Record<string, string>)[topic.selected];
  }

  const phone = phoneValue.replace('(', '').replace(')', '').replace(' ', '-');

  const msg: Message = {
    bioguideId: legislator.bioguideId,
    recipientName: `${legislator.title}. ${legislator.firstName} ${legislator.lastName}`,
    subject: formData.subject,
    message: `Dear ${legislator.title} ${legislator.lastName}, \n${formData.message}`,
    sender: {
      namePrefix: formData.prefix,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone,
      parenPhone: phoneValue,
      county: formData.county,
    },
    canonicalAddress: address,
    campaign: campaign
      ? {
          uuid: campaign.id,
          tag: campaign.slug,
          orgURL: campaign.organizationUrl || undefined,
          orgName: campaign.organizationName || undefined,
        }
      : {},
  };

  if (topicValue) {
    msg.topic = topicValue;
  }

  return msg;
}
