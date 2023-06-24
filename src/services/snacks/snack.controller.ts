import {RequestHandler} from "express";
import asyncHandler from "express-async-handler";
import {CREATED, NOT_FOUND, NO_CONTENT, OK} from "http-status";
import APIError from "../../utils/ApiError";
import {ParamIsMongoIdDto} from "../../middlewares/validation/validators";
import Snack from "./snack.model";
import {CreateSnackBodyDto, UpdateSnackBodyDto} from "./snack.dto";

// ---------------------------------
// @desc    Create Snack
// @route   POST  /snacks
// @access  Private("OWNER")
// ---------------------------------
const createSnack: RequestHandler<unknown, unknown, CreateSnackBodyDto> =
  asyncHandler(async (req, res, next) => {
    const doc = await Snack.create(req.body);
    res.status(CREATED).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

// ---------------------------------
// @desc    Get All Snacks
// @route   GET  /snacks
// @access  Private("OWNER")
// ---------------------------------
const getAllSnacks: RequestHandler = asyncHandler(async (req, res, next) => {
  const docs = await Snack.find().sort("-createdAt").select("-__v");
  res.status(OK).json({
    status: "success",
    results: docs.length,
    data: {
      docs,
    },
  });
});

// ---------------------------------
// @desc    Get Single Snack
// @route   GET  /snacks/:id
// @access  Private("OWNER")
// ---------------------------------
const getSingleSnack: RequestHandler<ParamIsMongoIdDto> = asyncHandler(
  async (req, res, next) => {
    const {id} = req.params;
    const doc = await Snack.findById(id).select("-__v");
    if (!doc) {
      return next(
        new APIError(`There is no snack match this id : ${id}`, NOT_FOUND)
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

// ---------------------------------
// @desc    Update Single Snack
// @route   PUT  /snacks/:id
// @access  Private("OWNER")
// ---------------------------------
const updateSingleSnack: RequestHandler<
  ParamIsMongoIdDto,
  unknown,
  UpdateSnackBodyDto
> = asyncHandler(async (req, res, next) => {
  const {id} = req.params;

  const doc = await Snack.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    return next(
      new APIError(`There is no snack match this id : ${id}`, NOT_FOUND)
    );
  }
  res.status(OK).json({
    status: "success",
    data: {
      doc,
    },
  });
});

// ---------------------------------
// @desc    Delete Single Snack
// @route   DELETE  /snacks/:id
// @access  Private("OWNER")
// ---------------------------------
const deleteSingleSnack: RequestHandler<ParamIsMongoIdDto> = asyncHandler(
  async (req, res, next) => {
    const {id} = req.params;
    const doc = await Snack.findByIdAndDelete(id);
    if (!doc) {
      return next(
        new APIError(`There is no snack match this id : ${id}`, NOT_FOUND)
      );
    }
    res.status(NO_CONTENT).json({
      status: "success",
    });
  }
);
export {
  createSnack,
  getAllSnacks,
  getSingleSnack,
  updateSingleSnack,
  deleteSingleSnack,
};
