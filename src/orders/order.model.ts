import mongoose, {Document, Schema, Types} from "mongoose";

export interface OrderItem {
  snack: Types.ObjectId;
  price: number;
  quantity: number;
}
export interface OrderDocument extends Document {
  _id: Types.ObjectId;
  orderItems: OrderItem[];
  orderPrice: number;
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
  },
  {timestamps: true}
);
const Order = mongoose.model<OrderDocument>("Order", orderSchema);

export default Order;
