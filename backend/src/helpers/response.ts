export function makeResponse(data: any) {
  return { status: 'success', data };
}

export function makeError(err: any, statusCode = 400) {
  return {
    status: 'error',
    message: err?.message || String(err),
    code: statusCode,
    data: null,
  };
}
