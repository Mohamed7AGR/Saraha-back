import * as z from "zod";
import { generalFildes as gf } from "../../common/index.js";
import { getMessage } from "../../message/index.js";

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
