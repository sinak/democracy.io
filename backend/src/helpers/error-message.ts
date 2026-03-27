export function extractErrorMessage(err: unknown) {
  if (typeof err === 'object' && err !== null) {
    const responseData = (err as { response?: { data?: { error?: { message?: unknown }; message?: unknown } } })
      .response?.data;

    if (typeof responseData?.error?.message === 'string') {
      return responseData.error.message;
    }

    if (typeof responseData?.message === 'string') {
      return responseData.message;
    }
  }

  return err instanceof Error ? err.message : String(err);
}
