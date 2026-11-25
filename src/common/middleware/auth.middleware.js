import userRepo from "../../db/repo/user.repo.js";
import jwt from "jsonwebtoken";

import { verifyToken, comparePassword } from "../security/index.js";
import {
  unauthorizedExeption,
  badRequestExeption,
  notFoundExeption,
} from "../utils/index.js";
import { tokenEnum, authEnum, roleEnum } from "../enum/index.js";

export const authMiddleware = ({
  role = roleEnum.user,
  tokenType = tokenEnum.access,
}, t) => {
  return async (req, res, next) => {
    let [prefix, token] = req.headers.authorization.split(" ");
    if (!token) unauthorizedExeption("invalid token");
    switch (prefix) {
      case authEnum.Basic:
        let [email, password] = Buffer.from(token, "base64")
          .toString("utf-8")
          .split(":");
        let user = await userRepo.findOne({ filter: { email } });
        if (!user) notFoundExeption("User not found");
        let matchPassword = await comparePassword({
          plainText: password,
          encrypted: user.password,
        });
        if (!matchPassword) unauthorizedExeption("invalid email or password");
        req.user = user;
        next();
        break;
      case authEnum.Bearer:
        const decoded = jwt.decode(token);
        const payload =await verifyToken(token, decoded.role, tokenType, req.t);
        req.user = await userRepo.findById({ id: payload.sub, t });
        req.payload = payload;
        next();
        break;
      default:
        badRequestExeption("invalid authentication method");
    }
  };
};
export const optionalAuth = ({ tokenType = tokenEnum.access } = {}) => {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization;

      if (!header) return next();

      const [prefix, token] = header.split(" ");

      if (!token || prefix !== authEnum.Bearer) return next();

      const decoded = jwt.decode(token);

      if (decoded?.role === undefined || decoded?.role === null) {
        return next();
      }

      const payload = await verifyToken(token, decoded.role, tokenType, req.t);
      req.user = await userRepo.findById({ id: payload.sub });

      return next();
    } catch (error) {
      return next(error);
    }
  };
};