import express from "express";
import {allowedTo, isAuth} from "../middlewares/auth";
import {
  createOrder,
  getAllOrders,
  getSingleOrder,
  deleteSingleOrder,
  addNewSnackToOrder,
} from "./order.controller";
import {paramIsMongoIdValidation} from "../middlewares/validation/validators";
import {createOrderValidation, addSnackToOrderValidation} from "./order.dto";

const router = express.Router();

router.use(isAuth);
// router.use(allowedTo("OWNER"));

router.route("/").get(getAllOrders);

router.route("/").post(createOrderValidation, createOrder);

router.use("/:id", paramIsMongoIdValidation);
router.route("/:id").get(getSingleOrder).delete(deleteSingleOrder);

router
  .route("/:id/add-item")
  .patch(addSnackToOrderValidation, addNewSnackToOrder);

export default router;
