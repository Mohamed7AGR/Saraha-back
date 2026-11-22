import { Router } from "express";
import * as userService from "./user.service.js";
import { decrypt, successResponse, tokenEnum } from "../../common/index.js";
import { authMiddleware } from "../../common/middleware/index.js";
import { roleEnum } from "../../common/enum/index.js";
import { authorizationMiddleware } from "../../common/middleware/authorization.js";
import { validation } from "../../common/middleware/validation.js";
import { userSchema } from "./user.validation.js";
export const userController = Router();

let access=tokenEnum.access;
let refresh=tokenEnum.refresh;

userController.get("/profile", authMiddleware({ role: roleEnum.user, tokenType: access }), async (req, res, next) => {
    let profile = await userService.profile(req.user._id);
    profile.phone = decrypt(profile.phone);
    successResponse(res, 200, profile, req.t("user.profile.fetched"));

  
});
userController.get(
    "/profile/:userId",
    authMiddleware({ tokenType: tokenEnum.access }),
    validation(userSchema),
    async (req, res, next) => {
      try {
        let user = await userService.getUserById(req.validate.params.userId, req.t);
        successResponse(res, 200, user, req.t("user.profile.fetched"));
      } catch (error) {
        next(error);
      }
    },
  );

userController.get("/admin/profile", authMiddleware({ role: roleEnum.admin, tokenType: access }), authorizationMiddleware([roleEnum.admin]), async (req, res, next) => {
    let profile = await userService.profile(req.user._id);
    profile.phone = decrypt(profile.phone);
    successResponse(res, 200, profile, req.t("user.profile.fetched"));

  
});

userController.put("/profile", authMiddleware({ }), async (req, res, next) => {
    let data=req.body;
    let updatedUser = await userService.updateProfile(req.user._id, data);
    successResponse(res, 200, updatedUser, req.t("user.profile.updated"));
});
