import {NextFunction, Request, RequestHandler, Response} from "express";
import asyncHandler from "express-async-handler";
import {NOT_FOUND, OK} from "http-status";
import {ParamIsMongoIdDto} from "../../middlewares/validation/validators";
import APIError from "../../utils/ApiError";
import CRUDController from "../../utils/CrudController";
import User, {UserDocument} from "./user.model";
import {CreateUserBodyDto, UpdateUserRoleBodyDto} from "./uses.dto";

// USERS_CRUD_INSTANCE
const CRUDUsers = new CRUDController<CreateUserBodyDto, unknown>(User);

// ---------------------------------
// @desc    CREATE User
// @route   POST  /users
// @access  Private("OWNER")
// ---------------------------------
const createUser = CRUDUsers.createOne;

// ---------------------------------
// @desc    GET Users
// @route   GET  /users
// @access  Private("OWNER")
// ---------------------------------
const getAllUsers = CRUDUsers.getAll;

// ---------------------------------
// @desc    GET Single User
// @route   GET  /users/:id
// @access  Private("OWNER")
// ---------------------------------
const getSingleUser = CRUDUsers.getOne;

// ---------------------------------
// @desc    DELETE User
// @route   DELETE  /users/:id
// @access  Private("OWNER")
// ---------------------------------
const deleteSingleUser = CRUDUsers.deleteOne;

// ---------------------------------
// @desc    UPDATE User Role
// @route   PATCH  /users/:id/role
// @access  Private("OWNER")
// ---------------------------------
const updateUserRole: RequestHandler<
  ParamIsMongoIdDto,
  unknown,
  UpdateUserRoleBodyDto
> = asyncHandler(async (req, res, next) => {
  const {id} = req.params;
  const {role} = req.body;

  const doc = await User.findByIdAndUpdate(
    id,
    {role},
    {
      new: true,
      runValidators: true,
    }
  );
  if (!doc) {
    return next(
      new APIError(`There is no document match this id : ${id}`, NOT_FOUND)
    );
  }
  res.status(OK).json({
    status: "success",
    data: {
      doc,
    },
  });
});

interface AuthRequest extends Request {
  user: UserDocument;
}
// ---------------------------------
// @desc    Logged User
// @route   GET  /users/my-profile
// @access  Protected
// ---------------------------------
const getLoggedUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = (req as AuthRequest).user._id;

    const doc = await User.findById(id).select("-__v");

    //NOTFOUND Document Error
    if (!doc) {
      return next(
        new APIError(`There is no user match with this id : ${id}`, NOT_FOUND)
      );
    }

    res.status(OK).json({
      status: "success",
      data: {
        doc,
      },
    });
  }
);

export {
  createUser,
  deleteSingleUser,
  getAllUsers,
  getLoggedUser,
  getSingleUser,
  updateUserRole,
};
