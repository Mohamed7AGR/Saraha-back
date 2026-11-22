import ms from "ms";
import crypto from "crypto";

import {
  comparePassword,
  badRequestExeption,
  unauthorizedExeption,
  conflictExeption,
  hashPassword,
  encrypt,
  providerEnum,
  setCache,
  userRevokeKey,
  deleteCache,
  deleteCacheByPrefix,
  //decrypt,
  getCache,
  forbiddenExeption,
} from "../../common/index.js";
import { generateToken } from "../../common/security/index.js";
import { OAuth2Client } from "google-auth-library";
import configService from "../../config/config.service.js";
import userRepo from "../../db/repo/user.repo.js";
import { logoutEnum } from "../../common/enum/logoutEnum.js";
import { otpKey, userKeyBase } from "../../common/service/cacheKey.js";
import { emailEvent } from "../../common/events/emailEvent.js";
import { emailEventEnum } from "../../common/enum/emailEventEnum.js";
const client = new OAuth2Client();

export const signup = async (data, t) => {
  let isExists = await userRepo.findOne({ filter: { email: data.email } });
  if (isExists) conflictExeption(t("email.alreadyExists"));
  data.password = await hashPassword({ plainText: data.password });
  data.phone = encrypt(data.phone);
  let user = await userRepo.create({ data });
  const otp = crypto.randomInt(100000, 1000000).toString();
  await setCache({
    key: otpKey({ userId: user._id.toString() }),
    value: otp,
    ttl: 600
  });
  emailEvent.emit(emailEventEnum.SINGUP, {
    to: data.email,
    title: "Welcome to Saraha",
    message: `Hi ${data.fullName}, your account has been created successfully.`,
    otp,
    expiresIn: "10 minutes",
  });
  let { accessToken, refreshToken } = generateToken({ sub: user._id });
  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const login = async ({ email, password }, t) => {
  let user = await userRepo.findOne({
    filter: { email },
    projection: { email: 1, password: 1, role: 1 },
    options: { lean: true },
  });

  if (!user) unauthorizedExeption(t("invalid.email.or.password"));
  if (!user.emailConfirmed) forbiddenExeption(t("email.not.confirmed"));

  let matchPassword = await comparePassword({
    plainText: password,
    encrypted: user.password,
  });

  if (!matchPassword) unauthorizedExeption(t("invalid.email.or.password"));

  let { accessToken, refreshToken } = generateToken(
    { sub: user._id },
    {},
    user.role,
  );
  // await sendEmail({
  //   to: user.email,
  //   subject: "Welcome to Saraha",
  //   html: "<h1>your login successfully</h1>",
  // });
  return { ...user, accessToken, refreshToken };
};

export const rotateToken = async (user, payload, t) => {
  let accessIat = payload.iat * 1000;
  let accessExp = ms(configService.JWT_EXPIRES_IN);
  let accessExpAt = accessIat + accessExp;
  if (Date.now() < accessExpAt) {
    unauthorizedExeption(t("token.still.valid"));
  }
  let { accessToken, refreshToken } = generateToken({ sub: user._id });
  await revokeToken(payload, t);
  return { accessToken, refreshToken };
};

export const logout = async (
  payload,
  t,
  { action = logoutEnum.DEVICE } = {},
) => {
  switch (action) {
    case logoutEnum.DEVICE:
      return await revokeToken(payload, t);
      break;

    default:
      await userRepo.updateOne({
        filter: { _id: payload.sub },
        update: { changenCredentailAt: new Date() },
      });
      await deleteCacheByPrefix({
        prefix: userKeyBase({ userId: payload.sub }),
      });
      return;
      break;
  }
};

const revokeToken = async (payload, t) => {
  let { jti, exp, sub } = payload;
  let nowInSec = Math.ceil(Date.now() / 1000);
  let ttl = exp - nowInSec;
  await setCache({
    key: userRevokeKey({ userId: sub, jti }),
    value: jti,
    ttl: ttl,
  });
  return { ...payload, ttl };
};

export const googleLogin = async (data, t) => {
  const ticket = await client.verifyIdToken({
    idToken: data.idToken,
    audience: configService.Google_Client_ID,
  });
  const payload = ticket.getPayload();
  console.log(payload);
  let { email, name, email_verified, picture } = payload;
  if (!email_verified) unauthorizedExeption(t("email.not.verified"));
  let user = await userRepo.findOne({ filter: { email } });
  let status = 200;
  if (!user) {
    user = await userRepo.create({
      data: {
        email,
        fullName: name,
        image: picture,
        provider: providerEnum.google,
      },
    });
    status = 201;
  }
  const tokens = generateToken({ sub: user._id }, {}, user.role);
  return { ...tokens, status };
};
export const confirmEmail = async ({otp,email},t) => {
  let user = await userRepo.findOne({ filter: { email } });
  if (!user) unauthorizedExeption(t("user.notFound"));
  let cachedOtp = await getCache({
    key: otpKey({ userId: user._id.toString() }),
  });
  if (!cachedOtp || String(cachedOtp) !== String(otp)) {
    badRequestExeption(t("otp.invalid"));
  }
user.emailConfirmed = true;
await user.save();
await deleteCache({
  keys: [otpKey({ userId: user._id.toString() })],
});
return user;
}