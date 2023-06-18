import express from "express";
import {allowedTo, isAuth} from "../middlewares/auth";
import {
  createDevice,
  deleteSingleDevice,
  getAllDevices,
  getSingleDevice,
  updateSingleDevice,
  startTime,
  endTime,
} from "./device.controller";
import {createDeviceValidation, updateDeviceValidation} from "./device.dto";
import {paramIsMongoIdValidation} from "../middlewares/validation/validators";

const router = express.Router();

router.use(isAuth);

router.route("/").get(allowedTo("OWNER", "ADMIN"), getAllDevices);

router.use(allowedTo("OWNER"));

router.route("/").post(createDeviceValidation, createDevice);

router.use("/:id", paramIsMongoIdValidation);
router
  .route("/:id")
  .get(getSingleDevice)
  .put(updateDeviceValidation, updateSingleDevice)
  .delete(deleteSingleDevice);

router.route("/start-time/:id").patch(startTime);
router.route("/end-time/:id").post(endTime);

export default router;
