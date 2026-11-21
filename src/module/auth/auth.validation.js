import * as z from "zod";
import { langEnum } from "../../common/enum/index.js";
import { genderEnum, roleEnum, generalFildes } from "../../common/index.js";
import { arMessage } from "../../message/ar.js";
import { enMessage } from "../../message/en.js";

export const loginSchema = (lang) => {
  return z.object({
    body: z.strictObject({
      email: z.email({
        pattern:
          /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i,
        message:
          lang === langEnum.arabic
            ? arMessage["email.invalid"]
            : enMessage["email.invalid"],
      }),
      password: generalFildes.password(lang),
    }),
  });
};

export const signupSchema = (lang) =>
  z
    .object({
      body: loginSchema(lang).shape.body.extend({
        fullName: z
          .string()
          .min(5, lang === langEnum.arabic ? arMessage["fullName.min"] : enMessage["fullName.min"])
          .includes(" ", lang === langEnum.arabic ? arMessage["fullName.space"] : enMessage["fullName.space"]),
        phone: z.e164({
          pattern: /^01[0-25][\d]{8}$/,
          message: lang === langEnum.arabic ? arMessage["phone.invalid"] : enMessage["phone.invalid"],
        }),
        confirmPassword: z.string(),
        gender: z.enum(genderEnum),
        role: z.enum(roleEnum),
      }),
    })
    .refine((data) => data.body.password === data.body.confirmPassword, {
      path: ["body", "confirmPassword"],
      message: lang === langEnum.arabic ? arMessage["confirmPassword.invalid"] : enMessage["confirmPassword.invalid"],
    });
