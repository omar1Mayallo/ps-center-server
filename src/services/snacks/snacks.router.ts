import express from "express";
import {allowedTo, isAuth} from "../../middlewares/auth";
import {paramIsMongoIdValidation} from "../../middlewares/validation/validators";
import {
  createSnack,
  getAllSnacks,
  getSingleSnack,
  updateSingleSnack,
  deleteSingleSnack,
} from "./snack.controller";
import {createSnackValidation, updateSnackValidation} from "./snack.dto";
import {UserRoles} from "../users/user.model";

const router = express.Router();

router.use(isAuth);

router.route("/").get(getAllSnacks);

router.use(allowedTo(UserRoles.OWNER));
router.route("/").post(createSnackValidation, createSnack);
router.use("/:id", paramIsMongoIdValidation);
router
  .route("/:id")
  .get(getSingleSnack)
  .put(updateSnackValidation, updateSingleSnack)
  .delete(deleteSingleSnack);

export default router;
