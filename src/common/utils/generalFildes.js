import * as z from "zod";
import { langEnum } from "../enum/index.js";
import { arMessage } from "../../message/ar.js";
import { enMessage } from "../../message/en.js";

export default {
    password: (lang) =>
        z.string().min(
          8,
          lang === langEnum.arabic
            ? arMessage["password.min"]
            : enMessage["password.min"],
        ),
  userId: (lang) =>
        z.string().length(
          24,
          lang === langEnum.arabic
            ? arMessage["userId.length"]
            : enMessage["userId.length"],
        ),
};
