import {RequestHandler} from "express";
import expressAsyncHandler from "express-async-handler";
import {OK} from "http-status";
import Order from "./orders/order.model";
import Session from "./game-sessions/gameSessions.model";
import Device from "./devices/device.model";
import Snack from "./snacks/snack.model";
import User from "./users/user.model";

const getDocsCount: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const ordersCount = await Order.countDocuments();
    const sessionsCount = await Session.countDocuments();
    const devicesCount = await Device.countDocuments();
    const snacksCount = await Snack.countDocuments();
    const usersCount = await User.countDocuments();

    res.status(OK).json({
      status: "success",
      data: {
        ordersCount,
        sessionsCount,
        devicesCount,
        snacksCount,
        usersCount,
      },
    });
  }
);
export default getDocsCount;
