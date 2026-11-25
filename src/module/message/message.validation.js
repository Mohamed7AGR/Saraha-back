import * as z from "zod";
import { generalFildes as gf } from "../../common/index.js";
import { getMessage } from "../../message/index.js";
import { filterTypeEnum } from "../../common/enum/index.js";

export const createMessageSchema = (lang) =>
  z
    .object({
      body: z
        .object({
          receverId: gf.userId(lang),
          senderId: gf.userId(lang).optional(),
          content: z.string().min(5).max(5000).optional(),
        })
        .strict(),
      files: z.array(gf.file(lang)).optional(),
    })
    .superRefine(({ body, files }, ctx, t) => {
      if (!body.content && (!files || files.length < 1)) {
        ctx.addIssue({
          code: "custom",
          message: getMessage(lang, "message.contentOrFilesRequired"),
          path: ["body"],
        });
      }
    });

export const getMessagesSchema = (lang) =>
  z.object({
    query: z.object({
      page: z.coerce.number({
        error: () => getMessage(lang, "query.page.invalid"),
      }).int().positive().default(1),
      limit: z.coerce.number({
        error: () => getMessage(lang, "query.limit.invalid"),
      }).int().positive().default(10),
      type: z.enum({
        error: () => getMessage(lang, "query.type.invalid"),
      }).default(filterTypeEnum.ALL),
    }),
  });
  export const deleteMessageSchema = (lang) =>
    z.object({
      params: z.strictObject({
        messageId: gf.userId(lang),
      }),
    });