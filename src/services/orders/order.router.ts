import express from "express";
import {allowedTo, isAuth} from "../../middlewares/auth";
import {
  createOrder,
  getAllOrders,
  getSingleOrder,
  deleteSingleOrder,
  addNewSnackToOrder,
  deleteAllOrders,
  getOrderMonthlyProfits,
  getOrdersTypesPercentage,
} from "./order.controller";
import {paramIsMongoIdValidation} from "../../middlewares/validation/validators";
import {createOrderValidation, addSnackToOrderValidation} from "./order.dto";
import {UserRoles} from "../users/user.model";

const router = express.Router();

router.use(isAuth);
router.use(allowedTo(UserRoles.OWNER, UserRoles.ADMIN));

router
  .route("/")
  .get(getAllOrders)
  .delete(allowedTo(UserRoles.OWNER), deleteAllOrders);

router.get(
  "/monthly-profits",
  allowedTo(UserRoles.OWNER),
  getOrderMonthlyProfits
);

router.get(
  "/types-percentage",
  allowedTo(UserRoles.OWNER),
  getOrdersTypesPercentage
);

router.route("/").post(createOrderValidation, createOrder);

router.use("/:id", paramIsMongoIdValidation);
router.route("/:id").get(getSingleOrder).delete(deleteSingleOrder);

router
  .route("/:id/add-item")
  .patch(addSnackToOrderValidation, addNewSnackToOrder);

export default router;
