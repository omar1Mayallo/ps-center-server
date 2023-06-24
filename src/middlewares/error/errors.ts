import {RequestHandler} from "express";
import {BAD_REQUEST, NOT_FOUND, UNAUTHORIZED} from "http-status";
import server from "../..";
import APIError, {CustomError} from "../../utils/ApiError";

// @ERROR_TYPE 404_ROUTES
const routeNotFoundError: RequestHandler = (req, _, next) => {
  next(
    new APIError(`Can't find ${req.originalUrl} on this server!`, NOT_FOUND)
  );
};

// @ERROR_TYPE  UNHANDLED_EXCEPTIONS
function uncaughtException(err: Error): void {
  console.log(err.name, err.message);
  console.log("UNCAUGHT_EXCEPTIONS! Server Shutting down...");
  process.exit(1);
}

// @ERROR_TYPE  UNHANDLED_REJECTION
function unhandledRejection(err: Error): void {
  console.error(err.name, err.message);
  server.close(() => {
    console.log("UNHANDLED_REJECTIONS! Server Shutting down...");
    process.exit(1);
  });
}

// @ERROR_TYPE  UNHANDLED_CAST_ERROR(invalid mongoDB id error)
export const handleCastError = (err: CustomError) => {
  return new APIError(`Invalid ${err.path}: ${err.value}.`, BAD_REQUEST);
};

// @ERROR_TYPE DUPLICATION_ERROR(duplicate a unique field)
export const handleDuplicationError = (err: CustomError) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)![0];
  return new APIError(
    `Duplicate field value: ${value}. Please use another value!`,
    BAD_REQUEST
  );
};

// @ERROR_TYPE VALIDATION_ERROR(mongoose schema validation)
export const handleValidationError = (err: CustomError) => {
  const errors = Object.values(err.errors!).map((el: Error) => el.message);
  return new APIError(`Invalid input data. ${errors.join(" , ")}`, BAD_REQUEST);
};

// @ERROR_TYPE  INVALID_TOKEN_ERROR
const handleJwtInvalidError = () =>
  new APIError("Invalid token, please login again", UNAUTHORIZED);

// @ERROR_TYPE EXPIRED_TOKEN_ERROR
const handleJwtExpiredError = () =>
  new APIError("Expired token, please login again", UNAUTHORIZED);

export {
  handleJwtExpiredError,
  handleJwtInvalidError,
  routeNotFoundError,
  uncaughtException,
  unhandledRejection,
};
