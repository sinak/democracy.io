const DELIVERY_ERROR_MAX_LENGTH = 12_000;
const ERROR_STATUS_VALUES = new Set(['error', 'failed', 'failure']);

type ErrorRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ErrorRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getStringField(record: ErrorRecord, key: string) {
  const value = record[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function getResponseData(err: unknown) {
  if (!isRecord(err)) {
    return undefined;
  }

  const response = err.response;
  return isRecord(response) ? response.data : undefined;
}

function hasErrorStatus(record: ErrorRecord) {
  const status = getStringField(record, 'status')?.toLowerCase();
  return status ? ERROR_STATUS_VALUES.has(status) || status.includes('error') || status.includes('fail') : false;
}

function extractMessageFromRecord(record: ErrorRecord, requireErrorSignal = false): string | undefined {
  const error = record.error;
  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  if (isRecord(error)) {
    const nestedErrorMessage = extractMessageFromRecord(error);
    if (nestedErrorMessage) {
      return nestedErrorMessage;
    }
  }

  const errors = record.errors;
  if (Array.isArray(errors)) {
    const messages = errors
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry;
        }

        return isRecord(entry) ? extractMessageFromRecord(entry) : undefined;
      })
      .filter((entry): entry is string => Boolean(entry));

    if (messages.length > 0) {
      return messages.join('; ');
    }
  }

  const message = getStringField(record, 'message');
  if (message && (!requireErrorSignal || hasErrorStatus(record))) {
    return message;
  }

  return (
    getStringField(record, 'detail') ??
    getStringField(record, 'details') ??
    getStringField(record, 'reason') ??
    getStringField(record, 'description')
  );
}

function extractMessage(value: unknown, requireErrorSignal = false): string | undefined {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const responseMessage = extractMessage(getResponseData(value), requireErrorSignal);
  if (responseMessage) {
    return responseMessage;
  }

  return extractMessageFromRecord(value, requireErrorSignal);
}

function getHttpErrorDetails(err: ErrorRecord) {
  const response = isRecord(err.response) ? err.response : undefined;
  const config = isRecord(err.config) ? err.config : undefined;

  return {
    code: getStringField(err, 'code'),
    httpStatus: typeof response?.status === 'number' ? response.status : undefined,
    httpStatusText: getStringField(response ?? {}, 'statusText'),
    method: getStringField(config ?? {}, 'method')?.toUpperCase(),
    url: getStringField(config ?? {}, 'url'),
    responseData: response?.data,
  };
}

function stripUndefinedValues(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripUndefinedValues);
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, stripUndefinedValues(entry)])
  );
}

function truncateDeliveryError(value: string) {
  return value.length > DELIVERY_ERROR_MAX_LENGTH
    ? `${value.slice(0, DELIVERY_ERROR_MAX_LENGTH)}... [truncated]`
    : value;
}

export function extractErrorMessage(err: unknown) {
  return extractMessage(err) ?? String(err);
}

export function extractDeliveryErrorMessage(value: unknown) {
  return extractMessage(value, true);
}

export function formatDeliveryErrorForStorage(err: unknown) {
  const message = extractMessage(err);
  const details = isRecord(err)
    ? {
        message,
        name: getStringField(err, 'name'),
        ...getHttpErrorDetails(err),
      }
    : { message: message ?? String(err) };

  return truncateDeliveryError(JSON.stringify(stripUndefinedValues(details)));
}

export function formatDeliveryResponseErrorForStorage(responseData: unknown) {
  const message = extractDeliveryErrorMessage(responseData);
  const details = {
    message,
    responseData,
  };

  return truncateDeliveryError(JSON.stringify(stripUndefinedValues(details)));
}
