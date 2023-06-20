import {NextFunction, Request, Response} from "express";
import {INTERNAL_SERVER_ERROR} from "http-status";
import APIError, {CustomError} from "../../utils/ApiError";
import {
  handleCastError,
  handleDuplicationError,
  handleJwtExpiredError,
  handleJwtInvalidError,
  handleValidationError,
} from "./errors";

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
    // NOT good practice to override an argument (ex: err = handleCastError(err)) of function
    let error: CustomError = {...err, name: err.name, message: err.message};

    if (error.name === "CastError") error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicationError(error);
    if (error.name === "ValidationError") error = handleValidationError(error);
    if (error.name === "JsonWebTokenError") error = handleJwtInvalidError();
    if (error.name === "TokenExpiredError") error = handleJwtExpiredError();

    sendErrorToProd(error, res);
  }
};

export default globalErrorMiddleware;
