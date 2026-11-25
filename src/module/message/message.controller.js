import { Router } from "express";
import * as messageService from "./message.service.js";
import { successResponse } from "../../common/index.js";
import { validation } from "../../common/middleware/validation.js";
import { createMessageSchema } from "./message.validation.js";
import {
  fileTypes,
  multerMiddleware,
  processFiles,
} from "../../common/middleware/multer.js";
import { optionalAuth } from "../../common/middleware/index.js";

export const messageController = Router();

//create message
messageController.post(
  "/",
  optionalAuth(),
  multerMiddleware({
    storageFolder: "messages",
    types: fileTypes.image,
  }).array("attachments"),
  processFiles({
    storageFolder: "messages",
    types: fileTypes.image,
    required: false,
  }),
  validation(createMessageSchema),

  async (req, res, next) => {
    try {
      const data = await messageService.createMessage(
        req.validate.body,
        req.validate.files || req.files || [],
        req.user,
        req.t,
      );
      successResponse(res, 201, data, req.t("messages.created"));
    } catch (error) {
      next(error);
    }
  },
);

//get messages

//delete message
