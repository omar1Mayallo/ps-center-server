import mongoose, {Document, Schema, Types} from "mongoose";

export interface SnackDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  buyingPrice: number;
  sellingPrice: number;
  quantity: number;
  sold: number;
}

const snackSchema = new Schema<SnackDocument>(
  {
    name: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "Snack name is required"],
    },
    buyingPrice: {
      type: Number,
      required: [true, "Snack buying price is required"],
    },
    sellingPrice: {
      type: Number,
      required: [true, "Snack selling price is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Snack quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
  },
  {timestamps: true}
);
const Snack = mongoose.model<SnackDocument>("Snack", snackSchema);

export default Snack;
