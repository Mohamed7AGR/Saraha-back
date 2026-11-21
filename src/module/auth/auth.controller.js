import { Router } from "express";
import * as authService from "./auth.service.js";
import { badRequestExeption, successResponse, tokenEnum } from "../../common/index.js";
import { authMiddleware, validation } from "../../common/middleware/index.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { langEnum } from "../../common/enum/index.js";
import { arMessage } from "../../message/ar.js";
import { enMessage } from "../../message/en.js";
export const authController = Router();

authController.post("/signup", validation(signupSchema), async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || langEnum.english;

    let user = await authService.signup(req.validate.body, lang);
    successResponse(res, 201, user, lang === langEnum.arabic ? arMessage["signup.success"] : enMessage["signup.success"]);
  } catch (error) {
    next(error);
  }
});


authController.post("/login", validation(loginSchema), async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || langEnum.english;
    const messages = lang === langEnum.arabic ? arMessage : enMessage;

    let user = await authService.login(req.validate.body);
    successResponse(res, 200, user, messages["login.success"]);
  } catch (error) {
    next(error);
  }
});

authController.post(
  "/rotate-token",
  authMiddleware({ tokenType: tokenEnum.refresh }),
  async (req, res, next) => {
    try {
      let token = await authService.rotateToken(req.user,req.payload);
      successResponse(res, 200, token, "Token rotated successfully");
    } catch (error) {
      next(error);
    }
  },
);


authController.post("/loginWithGmail", async (req, res, next) => {
  let { accessToken, refreshToken, status } = await authService.googleLogin(req.body);
  successResponse(res, status, { accessToken, refreshToken }, status === 200 ? "User logged in successfully" : "User created successfully");
});