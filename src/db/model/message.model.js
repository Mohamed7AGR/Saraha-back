import mongoose, { Schema, Types } from "mongoose";

export const messageSchema = new Schema(
  {
    receverId: {
      type: Types.ObjectId,
      required: true,
    },
    senderId: {
      type: Types.ObjectId,
    },
    attachments: {
      type: [String],
    },
    content: {
      type: String,
      minlength: [5, "Message must be at least 5 characters long"],
      maxlength: [5000, "Message must be at most 5000 characters long"],
      required: function () {
        return this.attachments.length < 1;
      },
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    autoIndex: true,
  },
);

export const messageModel = mongoose.model("message", messageSchema);

