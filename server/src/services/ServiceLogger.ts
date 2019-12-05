import { AxiosResponse, AxiosError } from "axios";
import logger from "./../logger";

export function createResponseInterceptor(
  serviceName: string
): (res: AxiosResponse) => AxiosResponse {
  return function(res) {
    logger.http(
      `[${serviceName}] ${res.request.method} ${res.config.url} ${res.status}`
    );
    return res;
  };
}

export function createErrorInterceptor(
  serviceName: string
): (error: AxiosError) => Promise<AxiosError> {
  return function(error) {
    if (error.response) {
      logger.http(
        `[${serviceName}] ${error.request.method} ${error.config.url} - ${error.response.status}`
      );
    }

    return Promise.reject(error);
  };
}
