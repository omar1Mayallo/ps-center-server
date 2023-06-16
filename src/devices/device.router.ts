import express from "express";
import {allowedTo, isAuth} from "../middlewares/auth";
import {
  createDevice,
  deleteSingleDevice,
  getAllDevices,
  getSingleDevice,
  updateSingleDevice,
} from "./device.controller";
import {
  createDeviceValidation,
  deviceIdValidation,
  updateDeviceValidation,
} from "./device.dto";

const router = express.Router();

router.use(isAuth);

router.route("/").get(allowedTo("OWNER", "ADMIN"), getAllDevices);

router.use(allowedTo("OWNER"));

router.route("/").post(createDeviceValidation, createDevice);

router.use("/:id", deviceIdValidation);
router
  .route("/:id")
  .get(getSingleDevice)
  .put(updateDeviceValidation, updateSingleDevice)
  .delete(deleteSingleDevice);

export default router;
