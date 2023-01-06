import mongoose, { Schema, model } from 'mongoose';

const { ObjectId } = mongoose.Schema;

const orderSchema = new Schema(
  {
    products: [{ type: ObjectId, ref: "Product" }],
    payment: {},
    buyer: { type: ObjectId, ref: "User" },
    status: {
      type: String,
      default: "Not processed",
      enum: ["Not processed", "Processing", "Shipped", "Delivered", "Canceled"],
    },
  },
  {
    timestamps: true,
  }
);

export default model("Order", orderSchema);
