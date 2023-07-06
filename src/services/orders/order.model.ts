import mongoose, {Document, Schema, Types} from "mongoose";

export enum OrderTypes {
  IN_DEVICE = "IN_DEVICE",
  OUT_DEVICE = "OUT_DEVICE",
}

export enum OrderStatus {
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export interface OrderItem {
  snack: Types.ObjectId;
  price: number;
  quantity: number;
}

export interface OrderDocument extends Document {
  _id: Types.ObjectId;
  orderItems: OrderItem[];
  orderPrice: number;
  type: OrderTypes;
  status: OrderStatus;
}

const orderSchema = new Schema<OrderDocument>(
  {
    orderItems: [
      {
        snack: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Snack",
        },
        price: Number,
        quantity: Number,
      },
    ],
    orderPrice: {
      type: Number,
    },
    type: {
      type: String,
      enum: Object.values(OrderTypes),
      required: [true, "Order must have a type"],
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      required: [true, "Order must have a status"],
    },
  },
  {timestamps: true}
);

orderSchema.pre<OrderDocument>("find", function (next) {
  this.populate({path: "orderItems.snack", select: "name"});
  next();
});

const Order = mongoose.model<OrderDocument>("Order", orderSchema);

export default Order;
