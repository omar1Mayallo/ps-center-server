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

const router = express.Router();

router.use(isAuth);
router.use(allowedTo("OWNER"));

router.route("/").get(getAllSnacks);

router.route("/").post(createSnackValidation, createSnack);

router.use("/:id", paramIsMongoIdValidation);
router
  .route("/:id")
  .get(getSingleSnack)
  .put(updateSnackValidation, updateSingleSnack)
  .delete(deleteSingleSnack);

export default router;
