import {RequestHandler} from "express";
import asyncHandler from "express-async-handler";
import {OK} from "http-status";
import Order from "./orders/order.model";
import Session from "./game-sessions/gameSessions.model";
import Device from "./devices/device.model";
import Snack from "./snacks/snack.model";
import User from "./users/user.model";

const getDocsCount: RequestHandler = asyncHandler(async (req, res, next) => {
  const orders = await Order.countDocuments();
  const sessions = await Session.countDocuments();
  const devices = await Device.countDocuments();
  const snacks = await Snack.countDocuments();
  const users = await User.countDocuments();

  res.status(OK).json({
    status: "success",
    data: {
      orders,
      sessions,
      devices,
      snacks,
      users,
    },
  });
});
export default getDocsCount;
