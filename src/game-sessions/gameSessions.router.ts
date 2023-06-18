import express from "express";
import {allowedTo, isAuth} from "../middlewares/auth";

const router = express.Router();

router.use(isAuth);
router.use(allowedTo("OWNER", "ADMIN"));

// router.route("/").get(getAllDevices);

export default router;
