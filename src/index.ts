import {
  uncaughtException,
  unhandledRejection,
} from "./middlewares/error/errors";
//______UNCAUGHT_EXCEPTIONS______//
process.on("uncaughtException", uncaughtException);
import app from "./app";
import env from "./config/env";
import connectToDB from "./config/db";

//______DB_CONNECTING______//
connectToDB();

//______SERVER______//
const PORT = env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `App Running on PORT:${PORT} in ${env.NODE_ENV.toUpperCase()} mode`
  );
});

//______UNHANDLED_REJECTIONS______//
//@desc unhandled promises rejections (outside express app [inside express we have global error handling], ex: connectToDB)
process.on("unhandledRejection", unhandledRejection);

export default server;
