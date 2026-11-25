import * as z from "zod";
import { langEnum } from "../enum/index.js";
import { arMessage } from "../../message/ar.js";
import { enMessage } from "../../message/en.js";
import { Types } from "mongoose";

export default {
  password: (lang) =>
    z
      .string()
      .min(
        8,
        lang === langEnum.arabic
          ? arMessage["password.min"]
          : enMessage["password.min"],
      ),
  userId: (lang) =>
    z
      .string()
      .length(
        24,
        lang === langEnum.arabic
          ? arMessage["userId.length"]
          : enMessage["userId.length"],
      )
      .refine(
        (data) => {
          return Types.ObjectId.isValid(data);
        },
        {
          message: "invalid user Id",
          path: ["userId"],
        },
      ),
  file:(lang) => z.strictObject({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number(),
    path: z.string(),
    buffer: z.instanceof(Buffer).optional(),
    destination: z.string().optional(),
    filename: z.string().optional(),
  }),
  paginationQuery: (lang) =>
    z.strictObject({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(10),
    }),
};
