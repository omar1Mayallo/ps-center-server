import {RequestHandler} from "express";
import asyncHandler from "express-async-handler";
import {CREATED, NOT_FOUND, NO_CONTENT, OK} from "http-status";
import APIError from "../utils/ApiError";
import {
  CreateDeviceBodyDto,
  DeviceIdParamsDto,
  UpdateDeviceBodyDto,
} from "./device.dto";
import Device from "./device.model";

// ---------------------------------
// @desc    Create Device
// @route   POST  /devices
// @access  Private("OWNER")
// ---------------------------------
const createDevice: RequestHandler<unknown, unknown, CreateDeviceBodyDto> =
  asyncHandler(async (req, res, next) => {
    const doc = await Device.create(req.body);
    res.status(CREATED).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

// ---------------------------------
// @desc    Get All Devices
// @route   GET  /devices
// @access  Private("ADMIN", "OWNER")
// ---------------------------------
const getAllDevices: RequestHandler = asyncHandler(async (req, res, next) => {
  const docs = await Device.find().sort("-createdAt").select("-__v");
  res.status(OK).json({
    status: "success",
    results: docs.length,
    data: {
      docs,
    },
  });
});

// ---------------------------------
// @desc    Get Single Device
// @route   GET  /devices/:id
// @access  Private("OWNER")
// ---------------------------------
const getSingleDevice: RequestHandler<DeviceIdParamsDto> = asyncHandler(
  async (req, res, next) => {
    const {id} = req.params;
    const doc = await Device.findById(id).select("-__v");
    if (!doc) {
      return next(
        new APIError(`There is no device match this id : ${id}`, NOT_FOUND)
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
// @desc    Update Single Device
// @route   put  /devices/:id
// @access  Private("OWNER")
// ---------------------------------
const updateSingleDevice: RequestHandler<
  DeviceIdParamsDto,
  unknown,
  UpdateDeviceBodyDto
> = asyncHandler(async (req, res, next) => {
  const {id} = req.params;

  const doc = await Device.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    return next(
      new APIError(`There is no device match this id : ${id}`, NOT_FOUND)
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
// @desc    Delete Single Device
// @route   DELETE  /devices/:id
// @access  Private("OWNER")
// ---------------------------------
const deleteSingleDevice: RequestHandler<DeviceIdParamsDto> = asyncHandler(
  async (req, res, next) => {
    const {id} = req.params;
    const doc = await Device.findByIdAndDelete(id);
    if (!doc) {
      return next(
        new APIError(`There is no device match this id : ${id}`, NOT_FOUND)
      );
    }
    res.status(NO_CONTENT).json({
      status: "success",
    });
  }
);

export {
  createDevice,
  deleteSingleDevice,
  getAllDevices,
  getSingleDevice,
  updateSingleDevice,
};
