import {RequestHandler} from "express";
import asyncHandler from "express-async-handler";
import {BAD_REQUEST, CREATED, NOT_FOUND, NO_CONTENT, OK} from "http-status";
import mongoose from "mongoose";
import {ParamIsMongoIdDto} from "../../middlewares/validation/validators";
import APIError from "../../utils/ApiError";
import Device from "../devices/device.model";
import Snack, {SnackDocument} from "../snacks/snack.model";
import {AddSnackToOrderBodyDto, CreateOrderBodyDto} from "./order.dto";
import Order, {OrderItem, OrderStatus, OrderTypes} from "./order.model";
import CRUDController from "../../utils/CrudController";

// ORDERS_CRUD_INSTANCE
const CRUDOrder = new CRUDController(Order, {
  path: "orderItems.snack",
  select: "name",
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

// ---------------------------------
// @desc    Delete All Orders
// @route   DELETE  /orders
// @access  Private("OWNER")
// ---------------------------------
const deleteAllOrders = CRUDOrder.deleteAll;

// ---------------------------------
// @desc    Get All Orders
// @route   GET  /orders
// @access  Private("OWNER")
// ---------------------------------
const getAllOrders = CRUDOrder.getAll;

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
    let orderType = OrderTypes.OUT_DEVICE;
    let device = null;
    let orderStatus = OrderStatus.DONE;

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
      orderType = OrderTypes.IN_DEVICE;
      orderStatus = OrderStatus.IN_PROGRESS;
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
      status: orderStatus,
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
  if (order.status === OrderStatus.DONE) {
    return next(new APIError(`This order already DONE`, BAD_REQUEST));
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

const getOrderMonthlyProfits: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const profits = await Order.aggregate([
      {
        $group: {
          _id: {
            month: {$month: "$createdAt"},
            year: {$year: "$createdAt"},
            type: "$type",
          },
          value: {$sum: "$orderPrice"},
        },
      },
    ]);
    res.status(OK).json({
      status: "success",
      data: {
        profits,
      },
    });
  }
);

const getOrdersTypesPercentage: RequestHandler = asyncHandler(
  async (req, res, next) => {
    /*
    1. **$group** stage (Grouping by Order Type):
      - `_id: "$type"`: Groups the documents by the `type` field, which represents the order type (`IN_DEVICE` or `OUT_DEVICE`).
      - `count: { $sum: 1 }`: Calculates the count of documents for each order type. The `$sum` operator increments the count by 1 for each document.

    2. **$group** stage (Calculating Total and Creating Array of Order Type Counts):
      - `_id: null`: Groups all the documents together without any specific grouping criteria.
      - `total: { $sum: "$count" }`: Calculates the total count by summing up the `count` field from the previous grouping stage.
      - `orderTypes`: Creates an array of order type counts using the `$push` operator. Each element in the array contains the order type (`_id`) and its corresponding count.

    3. **$project** stage (Calculating Percentages and Formatting the Output):
      - `_id: 0`: Excludes the `_id` field from the output.
      - `InDevicepercentage`: Calculates the percentage for the `IN_DEVICE` order type.
        - `{ $arrayElemAt: ["$orderTypes.count", 0] }`: Retrieves the count of the `IN_DEVICE` order type from the `orderTypes` array.
        - `{ $divide: [...] }`: Divides the count of `IN_DEVICE` order type by the `total` count to get the fraction.
        - `{ $multiply: [..., 100] }`: Multiplies the fraction by 100 to get the percentage.
      - `OutDevicepercentage`: Calculates the percentage for the `OUT_DEVICE` order type using a similar approach.
    */
    const percentage = await Order.aggregate([
      {
        $group: {
          _id: "$type",
          count: {$sum: 1},
        },
      },

      {
        $group: {
          _id: null,
          total: {$sum: "$count"},
          orderTypes: {
            $push: {
              type: "$_id",
              count: "$count",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          InDevicePercentage: {
            $multiply: [
              {$divide: [{$arrayElemAt: ["$orderTypes.count", 0]}, "$total"]},
              100,
            ],
          },
          OutDevicePercentage: {
            $multiply: [
              {$divide: [{$arrayElemAt: ["$orderTypes.count", 1]}, "$total"]},
              100,
            ],
          },
        },
      },
    ]);
    res.status(OK).json({
      status: "success",
      data: {
        percentage,
      },
    });
  }
);

export {
  addNewSnackToOrder,
  createOrder,
  deleteSingleOrder,
  getAllOrders,
  deleteAllOrders,
  getSingleOrder,
  getOrderMonthlyProfits,
  getOrdersTypesPercentage,
};
