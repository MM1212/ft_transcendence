export { default as Endpoints } from './endpoints';

namespace API {
  export enum RespStatus {
    Ok = 'ok',
    Error = 'error',
  }
  type RespStatusValuesUnion = RespStatus.Ok | RespStatus.Error;
  interface ResponseOk<T> {
    status: 'ok';
    data: T;
  }
  interface ResponseError {
    status: 'error';
    errorMsg?: string;
  }
  export type Response<T> = ResponseOk<T> | ResponseError;

  export const buildResponseObject = <T>(
    status: RespStatusValuesUnion,
    data?: T,
    errorMsg?: string
  ): Response<T> => ({
    status,
    data: data ?? (undefined as unknown as T),
    errorMsg,
  });

  export const buildOkResponse = <T>(data: T): ResponseOk<T> =>
    buildResponseObject<T>(RespStatus.Ok, data) as ResponseOk<T>;

  export const buildErrorResponse = (errorMsg: string): ResponseError =>
    buildResponseObject(RespStatus.Error, undefined, errorMsg) as ResponseError;
}

export default API;
