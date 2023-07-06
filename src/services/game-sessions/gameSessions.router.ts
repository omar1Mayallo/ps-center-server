import express from "express";
import {allowedTo, isAuth} from "../../middlewares/auth";
import {
  getAllGameSessions,
  getSingleGameSession,
  deleteSingleGameSession,
  deleteAllGameSessions,
  getSessionsMonthlyProfits,
  getSessionsTypesPercentage,
} from "./gameSessions.controller";
import {paramIsMongoIdValidation} from "../../middlewares/validation/validators";
import {UserRoles} from "../users/user.model";

const router = express.Router();

router.use(isAuth);
router.use(allowedTo(UserRoles.OWNER, UserRoles.ADMIN));

router.route("/").get(getAllGameSessions).delete(deleteAllGameSessions);

router.get(
  "/monthly-profits",
  allowedTo(UserRoles.OWNER),
  getSessionsMonthlyProfits
);

router.get(
  "/session-types-percentage",
  allowedTo(UserRoles.OWNER),
  getSessionsTypesPercentage
);

router.use("/:id", paramIsMongoIdValidation);
router.route("/:id").get(getSingleGameSession).delete(deleteSingleGameSession);

export default router;
