import {RequestHandler} from "express";
import asyncHandler from "express-async-handler";
import CRUDController from "../../utils/CrudController";
import Session from "./gameSessions.model";

// SESSIONS_CRUD_INSTANCE
const CRUDSessions = new CRUDController(Session, {
  path: "device",
  select: "name type sessionType",
});
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

export {
  deleteAllGameSessions,
  deleteSingleGameSession,
  getAllGameSessions,
  getSingleGameSession,
};
