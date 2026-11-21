import * as z from "zod";
export const loginSchema = z.strictObject({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const signupSchema = loginSchema.extend({
  fullName: z.string().min(5, "Full name must be at least 5 characters long").includes(" ", "Full name must contain a space"),
  phone: z.string(),
  confirmPassword: z.string(),
  gender: z.int(),
  role: z.int(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});
