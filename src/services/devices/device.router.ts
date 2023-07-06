import express from "express";
import {allowedTo, isAuth} from "../../middlewares/auth";
import {
  createDevice,
  deleteSingleDevice,
  getAllDevices,
  getSingleDevice,
  updateSingleDevice,
  startTime,
  endTime,
  resetSingleDevice,
  resetAllDevices,
  updateDeviceSessionType,
} from "./device.controller";
import {
  createDeviceValidation,
  updateDeviceSessionTypeValidation,
  updateDeviceValidation,
} from "./device.dto";
import {paramIsMongoIdValidation} from "../../middlewares/validation/validators";
import {UserRoles} from "../users/user.model";

const router = express.Router();

router.use(isAuth);

router.route("/").get(getAllDevices);

router.use(allowedTo(UserRoles.OWNER, UserRoles.ADMIN));
router.route("/").post(createDeviceValidation, createDevice);

router.route("/reset").put(resetAllDevices);

router.use("/:id", paramIsMongoIdValidation);
router
  .route("/:id")
  .get(getSingleDevice)
  .put(updateDeviceValidation, updateSingleDevice)
  .delete(deleteSingleDevice);

router
  .route("/:id/session-type")
  .patch(updateDeviceSessionTypeValidation, updateDeviceSessionType);

router.route("/:id/start-time").patch(startTime);
router.route("/:id/end-time").post(endTime);
router.route("/:id/reset").put(resetSingleDevice);

export default router;
