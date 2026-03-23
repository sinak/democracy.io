import camelcaseKeys from 'camelcase-keys';
import type { CanonicalAddress } from '../types.js';

// us module doesn't have proper ESM types, use dynamic import
let usLookup: (abbrev: string) => { name: string } | undefined;

async function ensureUsModule() {
  if (!usLookup) {
    const us = await import('us');
    usLookup = (abbrev: string) => {
      // us@3 has .lookup()
      const result = (us as any).default?.lookup?.(abbrev) ?? (us as any).lookup?.(abbrev);
      return result;
    };
  }
}

export async function makeCanonicalAddressFromSSResponse(rawAddress: any): Promise<CanonicalAddress> {
  await ensureUsModule();

  const addressBits = [
    rawAddress.delivery_line_1,
    rawAddress.delivery_line_2,
    rawAddress.last_line,
  ].filter((bit) => bit && bit.trim());

  const address = addressBits.join(', ');
  const components = rawAddress.components;

  const usRegion = usLookup!(components.state_abbreviation);
  components.stateName = usRegion?.name ?? '';

  const district = rawAddress.metadata.congressional_district;

  return {
    inputId: rawAddress.input_id,
    inputIndex: rawAddress.input_index,
    address,
    longitude: rawAddress.metadata.longitude,
    latitude: rawAddress.metadata.latitude,
    district: district === 'AL' ? '0' : district,
    county: rawAddress.metadata.county_name,
    components: camelcaseKeys(components),
  };
}
