import {RequestHandler} from "express";
import asyncHandler from "express-async-handler";
import {BAD_REQUEST, CREATED, NOT_FOUND, NO_CONTENT, OK} from "http-status";
import APIError from "../utils/ApiError";
import {ParamIsMongoIdDto} from "../middlewares/validation/validators";
import Order, {OrderItem} from "./order.model";
import Snack from "../snacks/snack.model";
import Device from "../devices/device.model";

// ---------------------------------
// @desc    Create Order
// @route   POST  /orders
// @access  Private("OWNER")
// ---------------------------------
const createOrder: RequestHandler<unknown, unknown /*,CreateSnackBodyDto*/> =
  asyncHandler(async (req, res, next) => {
    const {snackId, quantity, deviceId} = req.body;
    // [1]_CHECK_POSSIBLE_ERRORS
    // a)User_Entered_Missing_Data
    if (!snackId || !quantity) {
      return next(new APIError(`Please add snack and quantity`, BAD_REQUEST));
    }
    const snack = await Snack.findById(snackId);
    // b)Snack_Not_Found
    if (!snack) {
      return next(
        new APIError(`There is no snack match this id : ${snackId}`, NOT_FOUND)
      );
    }
    // c)Is_Valid_Entered_Qty
    if (quantity > snack.quantityInStock || snack.quantityInStock <= 0) {
      return next(
        new APIError(
          `Invalid quantity, snack is out of stock or quantity is more than available snack quantity`,
          BAD_REQUEST
        )
      );
    }

    // [2]_CREATE_ORDER_LOGIC
    // 1) For Creating Order generally
    const orderItem: OrderItem = {
      snack: snack._id,
      price: snack.sellingPrice,
      quantity: quantity,
    };

    const order = await Order.create({
      orderItems: [orderItem],
      orderPrice: snack.sellingPrice * quantity,
    });

    // [3]_UPDATE_SNACK ==> quantityInStock(decrease) - sold(increase)
    const bulkOption = order.orderItems.map(({snack, quantity}) => ({
      updateOne: {
        filter: {_id: snack},
        update: {
          $inc: {quantityInStock: -quantity, sold: +quantity},
        },
      },
    }));
    // bulkWrite[https://www.mongodb.com/docs/manual/reference/method/db.collection.bulkWrite/][https://stackoverflow.com/questions/59730402/how-does-the-bulkwrite-operation-in-mongodb-work]
    await Snack.bulkWrite(bulkOption);

    // 2) For Creating Order From Specific Device
    if (deviceId) {
      const device = await Device.findById(deviceId);
      // CHECK_POSSIBLE_ERRORS
      // a) Device Not Found
      if (!device) {
        return next(
          new APIError(`There is no device with id ${deviceId}`, BAD_REQUEST)
        );
      }
      // b) Device Empty Now
      if (device.isEmpty || !device.startTime) {
        return next(new APIError(`This device is Empty Now`, BAD_REQUEST));
      }

      device.order = order._id;
      await device.save();

      res.status(CREATED).json({
        status: "success",
        data: {
          order,
          device,
        },
      });
    } else {
      res.status(CREATED).json({
        status: "success",
        data: {
          order,
        },
      });
    }
  });

// ---------------------------------
// @desc    Add New Snack To Specific Order
// @route   PATCH  /orders/:id/add-item
// @access  Private("OWNER")
// ---------------------------------
const addNewSnackToOrder: RequestHandler<ParamIsMongoIdDto> = asyncHandler(
  async (req, res, next) => {
    const {id} = req.params;
    const {snackId, quantity} = req.body;
    // [1]_CHECK_POSSIBLE_ERRORS
    // a)_Order_Not_Found
    const order = await Order.findById(id);
    if (!order) {
      return next(
        new APIError(`There is no order match this id : ${id}`, NOT_FOUND)
      );
    }
    // b)_Snack_Not_Found
    const snack = await Snack.findById(snackId);
    if (!snack) {
      return next(
        new APIError(`There is no snack match this id : ${snackId}`, NOT_FOUND)
      );
    }

    // [2] ADD_NEW_ORDER_ITEM_LOGIC
    // a) If snack order item is already exist in orderItems[] =>> qty++
    const snackIdx = order.orderItems.findIndex(
      (item) => item.snack.toString() === snackId
    );
    // findIndex !== -1 =>> item is not exist in orderItems[]
    if (snackIdx !== -1) {
      const orderItem = order.orderItems[snackIdx];
      // BEFORE we qty++
      // Check if available snack qty exist
      if (snack.quantityInStock > 0) {
        orderItem.quantity += 1;
        order.orderItems[snackIdx] = orderItem;
      }
      // throw err
      else {
        return next(
          new APIError(`Maximum quantity can you added`, BAD_REQUEST)
        );
      }
    }
    // b) If snack order item is not exist in orderItems[] =>> push it
    else {
      //_CHECK_POSSIBLE_ERRORS
      // Missing Qty
      if (!quantity) {
        return next(new APIError(`Please enter a quantity`, BAD_REQUEST));
      }
      // Qty entered > available snack qty
      if (quantity > snack.quantityInStock) {
        return next(
          new APIError(
            `Quantity is more than the available snack quantity`,
            NOT_FOUND
          )
        );
      }
      const newOrderItem = {
        snack: snackId,
        price: snack.sellingPrice,
        quantity,
      };
      order.orderItems.push(newOrderItem);
    }

    // [3]_RE_CALC_ORDER_PRICE
    let itemsPrice = 0;
    order.orderItems.forEach(
      ({price, quantity}) => (itemsPrice += price * quantity)
    );
    order.orderPrice = itemsPrice;

    // [4]_AFTER_ALL_UPDATES_SAVING_ORDER
    await order.save();

    // [5]_UPDATE_SNACK ==> quantityInStock(decrease) - sold(increase)
    const bulkOption = order.orderItems.map(({snack, quantity}) => ({
      updateOne: {
        filter: {_id: snack},
        update: {
          $inc: {quantityInStock: -quantity, sold: +quantity},
        },
      },
    }));

    // bulkWrite[https://www.mongodb.com/docs/manual/reference/method/db.collection.bulkWrite/][https://stackoverflow.com/questions/59730402/how-does-the-bulkwrite-operation-in-mongodb-work]
    await Snack.bulkWrite(bulkOption);

    res.status(OK).json({
      status: "success",
      data: {
        order,
      },
    });
  }
);

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

// ---------------------------------
// @desc    Get Single Order
// @route   GET  /orders/:id
// @access  Private("OWNER")
// ---------------------------------
const getSingleOrder: RequestHandler<ParamIsMongoIdDto> = asyncHandler(
  async (req, res, next) => {
    const {id} = req.params;
    const doc = await Order.findById(id)
      .populate({
        path: "orderItems.snack",
        select: "name sellingPrice quantityInStock",
      })
      .select("-__v");
    if (!doc) {
      return next(
        new APIError(`There is no Order match this id : ${id}`, NOT_FOUND)
      );
    }
    res.status(OK).json({
      status: "success",
      data: {
        doc,
      },
    });
  }
);

// ---------------------------------
// @desc    Delete Single Order
// @route   DELETE  /orders/:id
// @access  Private("OWNER")
// ---------------------------------
const deleteSingleOrder: RequestHandler<ParamIsMongoIdDto> = asyncHandler(
  async (req, res, next) => {
    const {id} = req.params;
    const doc = await Order.findByIdAndDelete(id);
    if (!doc) {
      return next(
        new APIError(`There is no Order match this id : ${id}`, NOT_FOUND)
      );
    }
    res.status(NO_CONTENT).json({
      status: "success",
    });
  }
);

export {
  createOrder,
  getAllOrders,
  getSingleOrder,
  deleteSingleOrder,
  addNewSnackToOrder,
};
