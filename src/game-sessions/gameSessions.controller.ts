import {RequestHandler} from "express";
import asyncHandler from "express-async-handler";
import {UpdateGameSessionBodyDto} from "./gameSessions.dto";
import {ParamIsMongoIdDto} from "../middlewares/validation/validators";
import Session from "./gameSessions.model";

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
  async (req, res, next) => {}
);

// ---------------------------------
// @desc    Update Single Game Session
// @route   PATCH  /game-sessions/:id
// @access  Private("ADMIN", "OWNER")
// ---------------------------------
const updateSingleGameSession: RequestHandler<
  ParamIsMongoIdDto,
  unknown,
  UpdateGameSessionBodyDto
> = asyncHandler(async (req, res, next) => {});

// ---------------------------------
// @desc    Delete Single Game Session
// @route   DELETE  /game-sessions/:id
// @access  Private("OWNER")
// ---------------------------------
const deleteSingleGameSession: RequestHandler<ParamIsMongoIdDto> = asyncHandler(
  async (req, res, next) => {}
);

export {getAllGameSessions};
