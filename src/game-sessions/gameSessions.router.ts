import express from "express";
import {allowedTo, isAuth} from "../middlewares/auth";
import {getAllGameSessions} from "./gameSessions.controller";

const router = express.Router();

router.use(isAuth);
router.use(allowedTo("OWNER", "ADMIN"));

router.route("/").get(getAllGameSessions);

export default router;
