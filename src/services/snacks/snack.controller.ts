import {RequestHandler} from "express";
import asyncHandler from "express-async-handler";
import {OK} from "http-status";
import CRUDController from "../../utils/CrudController";
import {CreateSnackBodyDto, UpdateSnackBodyDto} from "./snack.dto";
import Snack from "./snack.model";

// SNACKS_CRUD_INSTANCE
const CRUDSnacks = new CRUDController<CreateSnackBodyDto, UpdateSnackBodyDto>(
  Snack
);

// ---------------------------------
// @desc    Create Snack
// @route   POST  /snacks
// @access  Private("OWNER")
// ---------------------------------
const createSnack = CRUDSnacks.createOne;

// ---------------------------------
// @desc    Get Single Snack
// @route   GET  /snacks/:id
// @access  Private("OWNER")
// ---------------------------------
const getSingleSnack = CRUDSnacks.getOne;

// ---------------------------------
// @desc    Update Single Snack
// @route   PUT  /snacks/:id
// @access  Private("OWNER")
// ---------------------------------
const updateSingleSnack = CRUDSnacks.updateOne;

// ---------------------------------
// @desc    Delete Single Snack
// @route   DELETE  /snacks/:id
// @access  Private("OWNER")
// ---------------------------------
const deleteSingleSnack = CRUDSnacks.deleteOne;

// ---------------------------------
// @desc    Get All Snacks
// @route   GET  /snacks
// @access  Private("OWNER")
// ---------------------------------
const getAllSnacks = CRUDSnacks.getAll;

export {
  createSnack,
  deleteSingleSnack,
  getAllSnacks,
  getSingleSnack,
  updateSingleSnack,
};
