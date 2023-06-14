import express from "express";
import {getLoggedUser} from "./user.controller";
import {isAuth} from "../middlewares/auth";

const router = express.Router();

// AUTH_ROUTES
router.use(isAuth);

router.route("/my-profile").get(getLoggedUser);

export default router;
