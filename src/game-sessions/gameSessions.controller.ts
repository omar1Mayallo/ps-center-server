import {RequestHandler} from "express";
import asyncHandler from "express-async-handler";
import {ParamIsMongoIdDto} from "../middlewares/validation/validators";
import Session from "./gameSessions.model";
import APIError from "../utils/ApiError";
import {NOT_FOUND, NO_CONTENT, OK} from "http-status";

// ---------------------------------
// @desc    Get All Sessions
// @route   GET  /game-sessions
// @access  Private("ADMIN", "OWNER")
// ---------------------------------
const getAllGameSessions: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const docs = await Session.find()
      .populate({
        path: "device",
        select: "name type sessionType",
      })
      .sort("-createdAt")
      .select("-__v");
    res.status(200).json({
      status: "success",
      results: docs.length,
      data: {
        docs,
      },
    });
  }
);

// ---------------------------------
// @desc    Get Single Game Session
// @route   GET  /game-sessions/:id
// @access  Private("ADMIN", "OWNER")
// ---------------------------------
const getSingleGameSession: RequestHandler<ParamIsMongoIdDto> = asyncHandler(
  async (req, res, next) => {
    const {id} = req.params;
    const doc = await Session.findById(id).select("-__v");
    if (!doc) {
      return next(
        new APIError(
          `There is no game session match this id : ${id}`,
          NOT_FOUND
        )
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
// @desc    Delete Single Game Session
// @route   DELETE  /game-sessions/:id
// @access  Private("OWNER")
// ---------------------------------
const deleteSingleGameSession: RequestHandler<ParamIsMongoIdDto> = asyncHandler(
  async (req, res, next) => {
    const {id} = req.params;
    const doc = await Session.findByIdAndDelete(id);
    if (!doc) {
      return next(
        new APIError(
          `There is no game session match this id : ${id}`,
          NOT_FOUND
        )
      );
    }
    res.status(NO_CONTENT).json({
      status: "success",
    });
  }
);

// ---------------------------------
// @desc    Delete Single Game Session
// @route   DELETE  /game-sessions/:id
// @access  Private("OWNER")
// ---------------------------------
const deleteAllGameSessions: RequestHandler<ParamIsMongoIdDto> = asyncHandler(
  async (req, res, next) => {
    const result = await Session.deleteMany();
    res.status(NO_CONTENT).json({
      status: "success",
    });
  }
);

export {
  getAllGameSessions,
  getSingleGameSession,
  deleteAllGameSessions,
  deleteSingleGameSession,
};
