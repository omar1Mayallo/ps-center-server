import {RequestHandler} from "express";
import asyncHandler from "express-async-handler";
import {
  BAD_REQUEST,
  CREATED,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  NO_CONTENT,
  OK,
} from "http-status";
import APIError from "../utils/ApiError";
import {CreateDeviceBodyDto, UpdateDeviceBodyDto} from "./device.dto";
import Device from "./device.model";
import {ParamIsMongoIdDto} from "../middlewares/validation/validators";
import Session, {SessionTypes} from "../game-sessions/gameSessions.model";

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
const getSingleDevice: RequestHandler<ParamIsMongoIdDto> = asyncHandler(
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
// @route   PUT  /devices/:id
// @access  Private("OWNER")
// ---------------------------------
const updateSingleDevice: RequestHandler<
  ParamIsMongoIdDto,
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
const deleteSingleDevice: RequestHandler<ParamIsMongoIdDto> = asyncHandler(
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

// ---------------------------------
// @desc    Start Time
// @route   PATCH  /devices/:id/start-time
// @access  Private("ADMIN", "OWNER")
// ---------------------------------
const startTime: RequestHandler<ParamIsMongoIdDto> = asyncHandler(
  async (req, res, next) => {
    const {id} = req.params;
    // 1) Find the device which we start session from it to get the session type(duo or multi)
    const device = await Device.findById(id);
    // [A] CHECK_POSSIBLE_ERRORS
    // [A]-(a) Device Not Found
    if (!device) {
      return next(
        new APIError(`There is no device match this id : ${id}`, NOT_FOUND)
      );
    }
    // [A]-(b) Device Is Not Empty Now
    if (!device.isEmpty) {
      return next(new APIError(`This device is not empty now`, BAD_REQUEST));
    }

    // 2) Update the device status
    await Device.updateOne(
      {_id: id},
      {
        $set: {
          startTime: Date.now(),
          isEmpty: false,
        },
      },
      {runValidators: false} // Disable validators
    );

    // Fetch the updated device
    const updatedDevice = await Device.findById(id);

    res.status(OK).json({
      status: "success",
      data: {
        updatedDevice,
      },
    });
  }
);

// ---------------------------------
// @desc    End Time And Create Game Session
// @route   POST  /devices/:id/end-time
// @access  Private("ADMIN", "OWNER")
// ---------------------------------
const endTime: RequestHandler<ParamIsMongoIdDto> = asyncHandler(
  async (req, res, next) => {
    const {id} = req.params;
    // 1) Find the device which we start session from it to get the session type(duo or multi)
    const device = await Device.findById(id);
    // [A] CHECK_POSSIBLE_ERRORS
    // [A]-(a) Device Not Found
    if (!device) {
      return next(
        new APIError(`There is no device match this id : ${id}`, NOT_FOUND)
      );
    }
    // [A]-(b) Device Is Not Started Or Is Empty
    if (!device.startTime || device.isEmpty) {
      return next(
        new APIError(
          `Can't end time for empty device or it hasn't start time`,
          BAD_REQUEST
        )
      );
    }

    // 2) Update the device status
    device.endTime = Date.now();
    await device.save();

    // 3) Calc game session time in hours
    const estimatedTimeInHours =
      (device.endTime - device.startTime) / (1000 * 60 * 60);

    // 4) Calc total game session price (based on device sessionType(duo or multi))
    const gamePrice =
      device.sessionType === SessionTypes.DUO
        ? device.duoPricePerHour * estimatedTimeInHours
        : device.multiPricePerHour * estimatedTimeInHours;

    // Add orderPrice if order added to the device
    let ordPrice: number = 0;
    if (device.order) {
      const device = await Device.findById(id).populate({
        path: "order",
        select: "orderPrice",
      });
      const {orderPrice}: any = device?.order;
      ordPrice = orderPrice;
    }

    const sessionPrice = ordPrice ? ordPrice + gamePrice : gamePrice;

    //5) Create a new game session
    const session = await Session.create({
      device: device._id,
      type: device.sessionType,
      estimatedTimeInHours,
      gamePrice,
      sessionPrice: sessionPrice,
    });

    //6) If session created >> Reset Device
    if (session) {
      await Device.updateOne(
        {_id: id},
        {
          $set: {
            sessionType: SessionTypes.DUO,
            startTime: null,
            endTime: null,
            isEmpty: true,
            order: null,
          },
        },
        {runValidators: false} // Disable validators
      );

      res.status(CREATED).json({
        status: "success",
        data: {
          session,
        },
      });
    } else {
      // else >> return error
      return next(
        new APIError(
          `Fail to end time and create new session`,
          INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

// ---------------------------------
// @desc    Reset Single Device
// @route   PUT  /devices/:id/reset
// @access  Private("ADMIN", "OWNER")
// ---------------------------------
const resetSingleDevice: RequestHandler<ParamIsMongoIdDto> = asyncHandler(
  async (req, res, next) => {
    const {id} = req.params;

    const doc = await Device.findByIdAndUpdate(
      id,
      {
        sessionType: "DUO",
        isEmpty: true,
        // $unset[https://www.mongodb.com/docs/manual/reference/operator/update/unset/][https://stackoverflow.com/questions/6327893/mongodb-update-modifier-semantics-of-unset]
        $unset: {["startTime"]: 1, ["endTime"]: 1, ["order"]: 1},
      },
      {
        new: true,
        runValidators: true,
      }
    );
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
// @desc    Reset All Devices
// @route   PUT  /devices/reset
// @access  Private("ADMIN", "OWNER")
// ---------------------------------
const resetAllDevices: RequestHandler = asyncHandler(async (req, res, next) => {
  const doc = await Device.updateMany(
    {},
    {
      sessionType: "DUO",
      isEmpty: true,
      // $unset[https://www.mongodb.com/docs/manual/reference/operator/update/unset/][https://stackoverflow.com/questions/6327893/mongodb-update-modifier-semantics-of-unset]
      $unset: {["startTime"]: 1, ["endTime"]: 1, ["order"]: 1},
    }
  );

  res.status(OK).json({
    status: "success",
    data: {
      doc,
    },
  });
});

export {
  createDevice,
  deleteSingleDevice,
  getAllDevices,
  getSingleDevice,
  updateSingleDevice,
  startTime,
  endTime,
  resetSingleDevice,
  resetAllDevices,
};
