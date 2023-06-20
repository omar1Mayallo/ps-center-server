import express from "express";
import {allowedTo, isAuth} from "../middlewares/auth";
import {
  getAllGameSessions,
  getSingleGameSession,
  deleteSingleGameSession,
  deleteAllGameSessions,
} from "./gameSessions.controller";
import {paramIsMongoIdValidation} from "../middlewares/validation/validators";

const router = express.Router();

router.use(isAuth);
// router.use(allowedTo("OWNER", "ADMIN"));

router.route("/").get(getAllGameSessions).delete(deleteAllGameSessions);

router.use("/:id", paramIsMongoIdValidation);
router.route("/:id").get(getSingleGameSession).delete(deleteSingleGameSession);

export default router;
