import { Router } from "express";
import * as authService from "./auth.service.js";
import { roleEnum, successResponse, tokenEnum } from "../../common/index.js";
import { authMiddleware, validation } from "../../common/middleware/index.js";
import { loginSchema, signupSchema } from "./auth.validation.js";

export const authController = Router();

//signup
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

//login
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

//rotate token
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

//login with google
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

//logout
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

//forgot password
authController.post("/forgotPassword", async (req, res, next) => {
  try {
    let user = await authService.forgotPassword(req.body, req.t);
    successResponse(res, 200, user, req.t("forgot.password.otp.sent"));
  } catch (error) {
    next(error);
  }
});

//verify forgot password
authController.post("/verifyForgotPassword", async (req, res, next) => {
  try {
    let user = await authService.verifyForgotPassword(req.body, req.t);
    successResponse(res, 200, user, req.t("forgot.password.otp.verified"));
  } catch (error) {
    next(error);
  }
});

//reset password
authController.post("/resetPassword", async (req, res, next) => {
  try {
    let user = await authService.resetPassword(req.body, req.t);
    successResponse(res, 200, user, req.t("password.reset.success"));
  } catch (error) {
    next(error);
  }
});

//confirm email
authController.post("/confirmEmail", async (req, res, next) => {
  try {
    let user = await authService.confirmEmail(req.body, req.t);
    successResponse(res, 200, user, req.t("email.confirmed"));
  } catch (error) {
    next(error);
  }
});

//resend otp
authController.post("/resendOtp", async (req, res, next) => {
  try {
    let user = await authService.resendOtp(req.body, req.t);
    successResponse(res, 200, user, req.t("otp.resend"));
  } catch (error) {
    next(error);
  }
});

