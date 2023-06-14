import mongoose from "mongoose";
import env from "./env";

export default function () {
  mongoose
    .connect(env.MONGO_URI, {dbName: env.DB_NAME})
    .then(() => console.log(`Database Connected ⚡`));
}
