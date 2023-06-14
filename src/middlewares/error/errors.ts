import {UNAUTHORIZED, NOT_FOUND} from "http-status";
import APIError from "../../utils/ApiError";
import server from "../..";
import {RequestHandler} from "express";

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

// @ERROR_TYPE  INVALID_TOKEN_ERROR
const handleJwtInvalidError = () =>
  new APIError("Invalid token, please login again", UNAUTHORIZED);

// @ERROR_TYPE EXPIRED_TOKEN_ERROR
const handleJwtExpiredError = () =>
  new APIError("Expired token, please login again", UNAUTHORIZED);

export {
  uncaughtException,
  unhandledRejection,
  handleJwtInvalidError,
  handleJwtExpiredError,
  routeNotFoundError,
};
