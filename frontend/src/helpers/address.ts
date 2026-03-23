import type { CanonicalAddress } from '../types';

export const ADDRESS_ERRORS = {
  SERVER:
    'There appears to be a problem with the server. Please try again, and if the problem persists, email contact@democracy.io with the address you used so we can try and fix the issue.',
  UNRECOGNIZED: 'Your address was not recognized. Please check the address and try again.',
  MISMATCHED_ZIP:
    'The zipcode you entered does not match the verified zip code for your street address. Please check the address and try again.',
};

export function validateAddressResponse(
  err: unknown,
  addresses: CanonicalAddress[] | null,
  zipcode: string
): CanonicalAddress | string {
  const address = addresses && addresses.length > 0 ? addresses[0] : null;

  if (err) return ADDRESS_ERRORS.SERVER;
  if (!address) return ADDRESS_ERRORS.UNRECOGNIZED;
  if (address.components.zipcode !== zipcode) return ADDRESS_ERRORS.MISMATCHED_ZIP;

  return address;
}

export function streetAddress(addr: CanonicalAddress): string {
  let s = addr.components.primaryNumber;
  if (addr.components.streetPredirection) s += ' ' + addr.components.streetPredirection;
  s += ' ' + addr.components.streetName;
  if (addr.components.streetPostdirection) s += ' ' + addr.components.streetPostdirection;
  if (addr.components.streetSuffix) s += ' ' + addr.components.streetSuffix;
  return s;
}

export function cityState(addr: CanonicalAddress): string {
  return `${addr.components.cityName}, ${addr.components.stateAbbreviation}`;
}

export function getAddressData(addr: CanonicalAddress | null) {
  if (!addr) return { address: '', city: '', postal: '' };
  return {
    address: streetAddress(addr),
    city: cityState(addr),
    postal: addr.components.zipcode,
  };
}
