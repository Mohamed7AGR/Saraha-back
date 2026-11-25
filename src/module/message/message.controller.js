import { Router } from "express";
import * as messageService from "./message.service.js";
import { successResponse } from "../../common/index.js";
import { validation } from "../../common/middleware/validation.js";
import {
  createMessageSchema,
  getMessagesSchema,
  deleteMessageSchema,
} from "./message.validation.js";
import {
  fileTypes,
  multerMiddleware,
  processFiles,
} from "../../common/middleware/multer.js";
import { optionalAuth, authMiddleware } from "../../common/middleware/index.js";
import { tokenEnum } from "../../common/enum/index.js";

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
messageController.get(
  "/",
  authMiddleware({ tokenType: tokenEnum.access }),
  validation(getMessagesSchema),
  async (req, res, next) => {
    try {
      let data = await messageService.getMessages(req.user, req.validate.query, req.t);
      successResponse(res, 200, data, req.t("messages.fetched"));
    } catch (error) {
      next(error);
    }
  },
);
//delete message
messageController.delete(
  "/:messageId",
  authMiddleware({ tokenType: tokenEnum.access }),
  validation(deleteMessageSchema),
  async (req, res, next) => {
    try {
      let data = await messageService.deleteMessage(req.user, req.validate.params, req.t);
      successResponse(res, 200, data, req.t("messages.deleted"));
    } catch (error) {
      next(error);
    }
  },
);