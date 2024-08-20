// /* eslint-disable @typescript-eslint/no-magic-numbers */

export const SIXTY = 60 as const;
export const ONE_HUNDRED = 100 as const;
export const ONE_THOUSAND = 1000 as const;

export const MAX_BEGIN_HOURS = 8 as const
export const MAX_END_HOURS = 18 as const
export const HOURS_OF_WORKS = 8 as const;

export enum HttpCode {
    OK = 200,
 CREATED = 201,
 NO_CONTENT = 204,
 BAD_REQUEST = 400,
 UNAUTHORIZED = 401,
 FORBIDDEN = 403,
 NOT_FOUND = 404,
 CONFLICT = 409,
 UNPROCESSABLE_ENTITY = 422,
 INTERNAL_SERVER_ERROR = 500,
 SERVICE_UNAVAILABLE = 503
}