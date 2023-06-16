import {NextFunction, Request, Response} from "express";
import {INTERNAL_SERVER_ERROR} from "http-status";
import APIError from "../../utils/ApiError";
import {handleJwtExpiredError, handleJwtInvalidError} from "./errors";

// ERRORS-For(NODE_ENV === "development")
const sendErrorToDev = (err: APIError, res: Response) => {
  return res.status(err.statusCode).json({
    error: err,
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

// ERRORS-For(NODE_ENV === "production")
const sendErrorToProd = (err: APIError, res: Response) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("🔴_ERROR_🔴", err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const globalErrorMiddleware = (
  err: APIError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || INTERNAL_SERVER_ERROR;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorToDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    if (err.name === "JsonWebTokenError") err = handleJwtInvalidError();
    if (err.name === "TokenExpiredError") err = handleJwtExpiredError();
    sendErrorToProd(err, res);
  }
};

export default globalErrorMiddleware;
