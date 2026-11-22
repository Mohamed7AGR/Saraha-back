import jwt from "jsonwebtoken";
import configService from "../../config/config.service.js";
import { tokenEnum } from "../enum/token.enum.js";
import { roleEnum } from "../enum/index.js";
import { getCache } from "../service/cacheService.js";
import { userRevokeKey } from "../service/cacheKey.js";
import { unauthorizedExeption } from "../utils/index.js";
import userRepo from "../../db/repo/user.repo.js";
export const getSecret = (role, tokenType) => {
  const secrets = getRoleSecret(role);
  return tokenType === tokenEnum.refresh ? secrets.refresh : secrets.access;
};

export const getRoleSecret = (role) => {
  let secret;
  switch (role) {
    case roleEnum.admin:
      secret = {
        access: configService.JWT_ADMIN_ACCESS_SECRET,
        refresh: configService.JWT_ADMIN_REFRESH_SECRET,
      };
      break;
    case roleEnum.user:
      secret = {
        access: configService.JWT_USER_ACCESS_SECRET,
        refresh: configService.JWT_USER_REFRESH_SECRET,
      };
      break;
    default:
      throw new Error("Invalid role");
  }
  return secret;
};

export const generateToken = (payload, options = {}, role = roleEnum.user) => {
  const jti = crypto.randomUUID();
  const secret = getRoleSecret(role);

  const tokenPayload = { ...payload, role, jti };

  const accessToken = jwt.sign(tokenPayload, secret.access, {
    expiresIn: configService.JWT_EXPIRES_IN,
    ...options,
  });

  const refreshToken = jwt.sign(tokenPayload, secret.refresh, {
    expiresIn: configService.JWT_REFRESH_EXPIRES_IN,
    ...options,
  });

  return { accessToken, refreshToken, jti };
};

export const verifyToken = async (
  token,
  role = roleEnum.user,
  tokenType = tokenEnum.access,
  t,
) => {
  let { aud, sub, jti, iat } = jwt.decode(token);
  let secret = getSecret(role, tokenType);
  let isRevoked = await getCache({ key: userRevokeKey({ userId: sub, jti }) });
  if (isRevoked) unauthorizedExeption(t("token.revoked"));
  let user = await userRepo.findById({
    id: sub,
    t,
    projection: { changenCredentailAt: 1 },
  });
  let changenCredentailAtSec = Math.ceil(user.changenCredentailAt.getTime() / 1000)??0;
  if (changenCredentailAtSec  > iat) {
    unauthorizedExeption(t("user.credentail.expired"));
  }
  return jwt.verify(token, secret);
};
