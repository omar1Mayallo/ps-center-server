import express from "express";
import {allowedTo, isAuth} from "../../middlewares/auth";
import {paramIsMongoIdValidation} from "../../middlewares/validation/validators";
import {
  createUser,
  deleteSingleUser,
  getAllUsers,
  getLoggedUser,
  getSingleUser,
  updateUserRole,
} from "./user.controller";
import {createUserValidation, updateUserRoleValidation} from "./uses.dto";

const router = express.Router();

router.use(isAuth);

router.route("/my-profile").get(getLoggedUser);

router.use(allowedTo("OWNER"));

router.route("/").get(getAllUsers);

router.route("/").post(createUserValidation, createUser);

router.use("/:id", paramIsMongoIdValidation);
router.route("/:id").get(getSingleUser).delete(deleteSingleUser);
router.route("/:id/role").patch(updateUserRoleValidation, updateUserRole);

export default router;
