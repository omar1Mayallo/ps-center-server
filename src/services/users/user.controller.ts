import {NextFunction, Request, Response} from "express";
import asyncHandler from "express-async-handler";
import {NOT_FOUND} from "http-status";
import APIError from "../../utils/ApiError";
import User, {UserDocument} from "./user.model";

interface AuthRequest extends Request {
  user: UserDocument;
}
// ---------------------------------
// @desc    Logged User
// @route   GET  /users/my-profile
// @access  Protected
// ---------------------------------
export const getLoggedUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = (req as AuthRequest).user._id;
    //Build Query
    let query = User.findById(id).select("-__v");

    //Execute query
    const doc = await query;

    //NOTFOUND Document Error
    if (!doc) {
      return next(
        new APIError(`There is no user match with this id : ${id}`, NOT_FOUND)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  }
);
