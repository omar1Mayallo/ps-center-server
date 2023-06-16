import {NextFunction, Request, Response} from "express";
import asyncHandler from "express-async-handler";
import {FORBIDDEN, UNAUTHORIZED} from "http-status";
import User, {UserDocument} from "../../users/user.model";
import APIError from "../../utils/ApiError";
import {verifyToken} from "../../utils/tokenHandler";

interface AuthRequest extends Request {
  user: UserDocument;
}

// @desc   isAuthenticated Middleware
export const isAuth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Check if token is exist from req.headers.authorization(Bearer token)
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(
        new APIError("Unauthorized , Please login to get access", UNAUTHORIZED)
      );
    }

    // 2) Verify token
    const decoded = verifyToken(token) as {userId: string};
    // console.log(decoded);

    // 3) Check if user is still exist (what if the user was deleted ? we check to see if the user is still exist or deleted)
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(
        new APIError(
          "The user that belong to this token does no longer exist",
          UNAUTHORIZED
        )
      );
    }

    // 4) Reserve user to req object
    (req as AuthRequest).user = currentUser;

    next();
  }
);

// @desc    allowedTo Middleware
export const allowedTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as AuthRequest).user.role)) {
      return next(
        new APIError(
          `You as ${
            (req as AuthRequest).user.role
          } do not have permission to perform this action`,
          FORBIDDEN
        )
      );
    }
    next();
  };
};
