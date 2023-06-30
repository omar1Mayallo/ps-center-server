import {RequestHandler} from "express";
import asyncHandler from "express-async-handler";
import {BAD_REQUEST, CREATED, NOT_FOUND, NO_CONTENT, OK} from "http-status";
import mongoose from "mongoose";
import {ParamIsMongoIdDto} from "../../middlewares/validation/validators";
import APIError from "../../utils/ApiError";
import Device from "../devices/device.model";
import Snack, {SnackDocument} from "../snacks/snack.model";
import {AddSnackToOrderBodyDto, CreateOrderBodyDto} from "./order.dto";
import Order, {OrderItem} from "./order.model";
import CRUDController from "../../utils/CrudController";

// ORDERS_CRUD_INSTANCE
const CRUDOrder = new CRUDController(Order, {
  path: "orderItems.snack",
  select: "name sellingPrice quantityInStock",
});

// ---------------------------------
// @desc    Get Single Order
// @route   GET  /orders/:id
// @access  Private("OWNER")
// ---------------------------------
const getSingleOrder = CRUDOrder.getOne;

// ---------------------------------
// @desc    Delete Single Order
// @route   DELETE  /orders/:id
// @access  Private("OWNER")
// ---------------------------------
const deleteSingleOrder = CRUDOrder.deleteOne;

// @Refactoring Update Snack(qty--, sold++) After Ordering
async function updateSnackAfterOrdering(
  snack: SnackDocument,
  quantity?: number
) {
  snack.quantityInStock -= quantity || 1;
  snack.sold += quantity || 1;
  await snack.save();
}
// ---------------------------------
// @desc    Create Order
// @route   POST  /orders
// @access  Private("OWNER")
// ---------------------------------
const createOrder: RequestHandler<unknown, unknown, CreateOrderBodyDto> =
  asyncHandler(async (req, res, next) => {
    const {snackId, quantity, deviceId} = req.body;

    // [1]_VALIDATE_REQ.BODY_INPUTS
    if (!snackId || !quantity) {
      return next(new APIError(`Please add snack and quantity`, BAD_REQUEST));
    }

    // [2]_FIND&VALIDATE_SNACK
    const snack = await Snack.findById(snackId);
    if (!snack) {
      return next(
        new APIError(`There is no snack match this id : ${snackId}`, NOT_FOUND)
      );
    }
    if (snack.quantityInStock <= 0) {
      return next(new APIError(`This snack is out of stock now`, BAD_REQUEST));
    }

    // [3]_VALIDATE_QUANTITY_ENTERED
    if (quantity > snack.quantityInStock) {
      return next(
        new APIError(
          `Quantity entered is more than available quantity`,
          BAD_REQUEST
        )
      );
    }

    // [4]_FOR_CREATE_ORDER_LOGIC
    let orderType = "OUT_DEVICE";
    let device = null;

    // (A)_FROM_DEVICE
    if (deviceId) {
      // a)_FIND&VALIDATE_DEVICE
      device = await Device.findById(deviceId);
      if (!device) {
        return next(
          new APIError(`There is no device with id ${deviceId}`, BAD_REQUEST)
        );
      }
      if (device.isEmpty || !device.startTime) {
        return next(new APIError(`This device is Empty Now`, BAD_REQUEST));
      }
      if (device.order) {
        return next(
          new APIError(`This device already has progressed order`, BAD_REQUEST)
        );
      }
      // b)_PUT_ORDER_TYPE_FROM_DEVICE
      orderType = "IN_DEVICE";
    }

    // (B)_CREATE_ORDER
    const orderItem: OrderItem = {
      snack: snack._id,
      price: snack.sellingPrice,
      quantity,
    };
    const order = await Order.create({
      orderItems: [orderItem],
      orderPrice: snack.sellingPrice * quantity,
      type: orderType,
    });

    // (C)_AFTER_CREATING_ORDER
    // a)_UPDATE_SNACK(quantityInStock, sold)
    await updateSnackAfterOrdering(snack, quantity);

    // b)_UPDATE_DEVICE(order)
    if (device) {
      device.order = order._id;
      await device.save();
    }

    res.status(CREATED).json({
      status: "success",
      data: {
        order,
      },
    });
  });

// ---------------------------------
// @desc    Add New Snack To Specific Order
// @route   PATCH  /orders/:id/add-item
// @access  Private("OWNER")
// ---------------------------------
const addNewSnackToOrder: RequestHandler<
  ParamIsMongoIdDto,
  unknown,
  AddSnackToOrderBodyDto
> = asyncHandler(async (req, res, next) => {
  const {id} = req.params;
  const {snackId, quantity} = req.body;

  // [1]_VALIDATE_REQ.BODY_INPUTS
  if (!snackId) {
    return next(new APIError(`Please enter a snack id`, BAD_REQUEST));
  }

  // [2]_FIND&VALIDATE_ORDER
  const order = await Order.findById(id);
  if (!order) {
    return next(
      new APIError(`There is no order match this id : ${id}`, NOT_FOUND)
    );
  }

  // [3]_FIND&VALIDATE_SNACK
  const snack = await Snack.findById(snackId);
  if (!snack) {
    return next(
      new APIError(`There is no snack match this id : ${snackId}`, NOT_FOUND)
    );
  }

  // [4]_ADD_NEW_ORDER_ITEM_LOGIC
  // (A) If snack orderItem is already exist in orderItems[] =>> qty++
  const snackIdx = order.orderItems.findIndex(
    (item) => item.snack.toString() === snackId
  );
  if (snackIdx !== -1) {
    const orderItem = order.orderItems[snackIdx];
    // a) BEFORE we update snack orderItem qty++ , CHECK if available snack.quantityInStock
    if (snack.quantityInStock > 0) {
      orderItem.quantity += 1;
      order.orderItems[snackIdx] = orderItem;

      // b) AFTER update snack orderItem qty++, UPDATE snack(quantityInStock, sold)
      await updateSnackAfterOrdering(snack);
    } else {
      return next(new APIError(`Maximum quantity can you added`, BAD_REQUEST));
    }
  }
  // (B) If snack orderItem is not exist in orderItems[] =>> push it
  else {
    // a) VALIDATE_ENTERED_QUANTITY
    if (!quantity) {
      return next(new APIError(`Please enter a quantity`, BAD_REQUEST));
    }
    if (quantity > snack.quantityInStock) {
      return next(
        new APIError(
          `Quantity is more than the available snack quantity`,
          NOT_FOUND
        )
      );
    }

    // b) PUSH a new orderItem to orderItems[]
    const newOrderItem: OrderItem = {
      snack: new mongoose.Types.ObjectId(snackId),
      price: snack.sellingPrice,
      quantity,
    };
    order.orderItems.push(newOrderItem);

    // c) AFTER push snack orderItem, UPDATE snack(quantityInStock, sold)
    await updateSnackAfterOrdering(snack);
  }

  // [5]_RE_CALC_ORDER_PRICE
  let itemsPrice = 0;
  order.orderItems.forEach(
    ({price, quantity}) => (itemsPrice += price * quantity)
  );
  order.orderPrice = itemsPrice;

  // [6]_AFTER_ALL_UPDATES_SAVING_ORDER
  await order.save();

  res.status(OK).json({
    status: "success",
    data: {
      order,
    },
  });
});

// ---------------------------------
// @desc    Get All Orders
// @route   GET  /orders
// @access  Private("OWNER")
// ---------------------------------
const getAllOrders: RequestHandler = asyncHandler(async (req, res, next) => {
  const docs = await Order.find()
    .sort("-createdAt")
    .populate({
      path: "orderItems.snack",
      select: "name sellingPrice quantityInStock",
    })
    .select("-__v");
  res.status(OK).json({
    status: "success",
    results: docs.length,
    data: {
      docs,
    },
  });
});

export {
  addNewSnackToOrder,
  createOrder,
  deleteSingleOrder,
  getAllOrders,
  getSingleOrder,
};
