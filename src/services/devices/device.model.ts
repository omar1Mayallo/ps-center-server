import mongoose, {Document, Schema, Types} from "mongoose";
import {SessionTypes} from "../game-sessions/gameSessions.model";

export interface DeviceDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  type: string;
  sessionType: SessionTypes;
  multiPricePerHour: number;
  duoPricePerHour: number;
  startTime: number | null;
  endTime: number | null;
  isEmpty: boolean;
  order: Types.ObjectId;
}

const deviceSchema = new Schema<DeviceDocument>(
  {
    name: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "Device name is required"],
      minlength: [3, "Device name minimum length 3 characters"],
      maxlength: [30, "Device name maximum length 30 characters"],
    },
    type: {
      type: String,
      trim: true,
      required: [true, "Device type is required"],
    },
    sessionType: {
      type: String,
      enum: Object.values(SessionTypes),
      default: SessionTypes.DUO,
    },
    multiPricePerHour: {
      type: Number,
      required: [true, "multiPricePerHour is required"],
    },
    duoPricePerHour: {
      type: Number,
      required: [true, "duoPricePerHour is required"],
    },
    startTime: {type: Number},
    endTime: {type: Number},
    isEmpty: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  {timestamps: true}
);

const Device = mongoose.model<DeviceDocument>("Device", deviceSchema);

export default Device;
