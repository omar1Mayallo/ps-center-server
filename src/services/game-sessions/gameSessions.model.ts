import mongoose, {Document, Schema, Types} from "mongoose";

export enum SessionTypes {
  DUO = "DUO",
  MULTI = "MULTI",
}

export interface GameSessionDocument extends Document {
  _id: Types.ObjectId;
  device: Types.ObjectId;
  type: SessionTypes;
  estimatedTimeInHours: number;
  gamePrice: number;
  sessionPrice: number;
}

const gameSessionSchema = new mongoose.Schema<GameSessionDocument>(
  {
    device: {
      type: Schema.Types.ObjectId,
      ref: "Device",
      required: [true, "Session must belong to a certain device"],
    },
    type: {
      type: String,
      enum: Object.values(SessionTypes),
      required: [true, "Session must have a type"],
    },
    estimatedTimeInHours: {
      type: Number,
      set: (val: number) => Math.round(val * 100) / 100,
    },
    gamePrice: {
      type: Number,
      set: (val: number) => Math.round(val * 100) / 100,
    },
    sessionPrice: {
      type: Number,
      set: (val: number) => Math.round(val * 100) / 100,
    },
  },
  {timestamps: true}
);

const Session = mongoose.model<GameSessionDocument>(
  "Session",
  gameSessionSchema
);

export default Session;
