import {RequestHandler} from "express";
import CRUDController from "../../utils/CrudController";
import Session from "./gameSessions.model";
import asyncHandler from "express-async-handler";
import {OK} from "http-status";

// SESSIONS_CRUD_INSTANCE
const CRUDSessions = new CRUDController(Session);
// ---------------------------------
// @desc    Get Single Game Session
// @route   GET  /game-sessions/:id
// @access  Private("ADMIN", "OWNER")
// ---------------------------------
const getSingleGameSession = CRUDSessions.getOne;

// ---------------------------------
// @desc    Delete Single Game Session
// @route   DELETE  /game-sessions/:id
// @access  Private("OWNER")
// ---------------------------------
const deleteSingleGameSession = CRUDSessions.deleteOne;

// ---------------------------------
// @desc    Delete All Game Sessions
// @route   DELETE  /game-sessions
// @access  Private("OWNER")
// ---------------------------------
const deleteAllGameSessions = CRUDSessions.deleteAll;

// ---------------------------------
// @desc    Get All Sessions
// @route   GET  /game-sessions
// @access  Private("ADMIN", "OWNER")
// ---------------------------------
const getAllGameSessions = CRUDSessions.getAll;

// ---------------------------------
// @desc    Get Sessions Profits
// @route   GET  /game-sessions/monthly-profits
// @access  Private("OWNER")
// ---------------------------------
const getSessionsMonthlyProfits: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const profits = await Session.aggregate([
      {
        $group: {
          _id: {
            month: {$month: "$createdAt"},
            year: {$year: "$createdAt"},
          },
          value: {$sum: "$sessionPrice"},
        },
      },
    ]);
    res.status(OK).json({
      status: "success",
      data: {
        profits,
      },
    });
  }
);

// ---------------------------------
// @desc    Get Session Types Percentages
// @route   GET  /game-sessions/session-types-percentage
// @access  Private("OWNER")
// ---------------------------------
const getSessionsTypesPercentage: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const percentage = await Session.aggregate([
      {
        $group: {
          _id: "$type",
          count: {$sum: 1},
        },
      },

      {
        $group: {
          _id: null,
          total: {$sum: "$count"},
          sessionTypes: {
            $push: {
              type: "$_id",
              count: "$count",
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          DuoPercentage: {
            $multiply: [
              {$divide: [{$arrayElemAt: ["$sessionTypes.count", 0]}, "$total"]},
              100,
            ],
          },
          MultiPercentage: {
            $multiply: [
              {$divide: [{$arrayElemAt: ["$sessionTypes.count", 1]}, "$total"]},
              100,
            ],
          },
        },
      },
    ]);
    res.status(OK).json({
      status: "success",
      data: {
        percentage,
      },
    });
  }
);

export {
  deleteAllGameSessions,
  deleteSingleGameSession,
  getAllGameSessions,
  getSingleGameSession,
  getSessionsMonthlyProfits,
  getSessionsTypesPercentage,
};
