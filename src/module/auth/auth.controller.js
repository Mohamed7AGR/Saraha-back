import { Router } from "express";
import * as authService from "./auth.service.js";
import { roleEnum, successResponse, tokenEnum } from "../../common/index.js";
import { authMiddleware, validation } from "../../common/middleware/index.js";
import { loginSchema, signupSchema } from "./auth.validation.js";

export const authController = Router();

authController.post(
  "/signup",
  validation(signupSchema),
  async (req, res, next) => {
    try {
      let user = await authService.signup(req.validate.body, req.t);
      successResponse(res, 201, user, req.t("signup.success"));
    } catch (error) {
      next(error);
    }
  },
);

authController.post(
  "/login",
  validation(loginSchema),
  async (req, res, next) => {
    try {
      let user = await authService.login(req.validate.body, req.t);
      successResponse(res, 200, user, req.t("login.success"));
    } catch (error) {
      next(error);
    }
  },
);

authController.post(
  "/rotate-token",
  authMiddleware({ tokenType: tokenEnum.refresh }),
  async (req, res, next) => {
    try {
      let token = await authService.rotateToken(req.user, req.payload, req.t);
      successResponse(res, 200, token, req.t("token.rotated"));
    } catch (error) {
      next(error);
    }
  },
);

authController.post("/loginWithGmail", async (req, res, next) => {
  try {
    let { accessToken, refreshToken, status } = await authService.googleLogin(
      req.body,
      req.t,
    );
    successResponse(
      res,
      status,
      { accessToken, refreshToken },
      status === 200 ? req.t("login.success") : req.t("signup.success"),
    );
  } catch (error) {
    next(error);
  }
});

authController.post(
  "/logout",
  authMiddleware({ tokenType: tokenEnum.refresh }), 
  async (req, res, next) => {
    try {
      let data = await authService.logout(req.payload, req.t,req.body);
      successResponse(res, 200, data, req.t("logout.success"));
    } catch (error) {
      next(error);
    }
  },
);
authController.post("/confirmEmail", async (req, res, next) => {
  try {
    let user = await authService.confirmEmail(req.body, req.t);
    successResponse(res, 200, user, req.t("email.confirmed"));
  } catch (error) {
    next(error);
  }
});