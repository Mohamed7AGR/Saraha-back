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
  ttlCache,
  existsCache,
  incrementCache,
} from "../../common/index.js";
import { generateToken } from "../../common/security/index.js";
import { OAuth2Client } from "google-auth-library";
import configService from "../../config/config.service.js";
import userRepo from "../../db/repo/user.repo.js";
import { logoutEnum } from "../../common/enum/logoutEnum.js";
import {
  otpBlockedKey,
  otpKey,
  otpTrailsKey,
  subjectOtpKey,
  userKeyBase,
  wrongOtpKey,
} from "../../common/service/cacheKey.js";
import { emailEvent } from "../../common/events/emailEvent.js";
import { emailEventEnum } from "../../common/enum/emailEventEnum.js";
import { tooManyRequests } from "../../common/utils/exeptions.js";
const client = new OAuth2Client();

//send otp
const sendOtp = async ({ user, subject, maxTrails = 3, blocked = 900 }, t) => {
  let userId = user._id.toString();

  const otp = crypto.randomInt(100000, 1000000).toString();
  let otpTrails = await getCache({
    key: otpTrailsKey({ userId, subject: emailEventEnum.SINGUP }),
  });
  let blockTtl = await ttlCache({
    key: otpBlockedKey({ userId, subject: emailEventEnum.SINGUP }),
  });

  if (blockTtl > 0) {
    const minutes = Math.ceil(blockTtl / 60);
    unauthorizedExeption(t("otp.blocked", { blocked: minutes }));
  }
  if (otpTrails > maxTrails) {
    await setCache({
      key: otpBlockedKey({ userId, subject: emailEventEnum.SINGUP }),
      value: 1,
      ttl: blocked,
    });
    tooManyRequests(t("otp.trails.exceeded"));
  }

  await setCache({
    key: subjectOtpKey({ userId, subject }),
    value: otp,
    ttl: 150,
  });

  const templates = {
    [emailEventEnum.SINGUP]: {
      title: "Welcome to Saraha",
      message: `Hi ${user.fullName}, your account has been created successfully.`,
      emailSubject: "Welcome to Saraha",
    },
    [emailEventEnum.FORGOT_PASSWORD]: {
      title: "Forgot Password",
      message: `Hi ${user.fullName}, use this OTP to reset your password.`,
      emailSubject: "Forgot Password",
    },
  };

  const content = templates[subject];
  if (!content) badRequestExeption(t("subject.invalid"));

  emailEvent.emit(subject, {
    to: user.email,
    title: content.title,
    message: content.message,
    otp,
    expiresIn: "10 minutes",
    subject: content.emailSubject,
  });
  await incrementCache({
    key: otpTrailsKey({ userId, subject }, { incr: 1 }),
  });
};

//signup
export const signup = async (data, t) => {
  let isExists = await userRepo.findOne({ filter: { email: data.email } });
  if (isExists) conflictExeption(t("email.alreadyExists"));
  data.password = await hashPassword({ plainText: data.password });
  data.phone = encrypt(data.phone);
  let user = await userRepo.create({ data });

  let { accessToken, refreshToken } = generateToken({ sub: user._id });
  await sendOtp({ user, subject: emailEventEnum.SINGUP }, t);
  return {
    user,
    accessToken,
    refreshToken,
  };
};

//login
export const login = async ({ email, password }, t) => {
  let user = await userRepo.findOne({
    filter: { email },
    projection: { email: 1, password: 1, role: 1, emailConfirmed: 1 },
    options: { lean: true },
  });

  if (!user) unauthorizedExeption(t("user.notFound"));

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

  return { ...user, accessToken, refreshToken };
};

//rotate token
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

//logout
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

//forgot password
export const forgotPassword = async ({ email }, t) => {
  let user = await userRepo.findOne({
    filter: {
      email,
      emailConfirmed: { $exists: true },
    },
  });
  if (!user) notFoundExeption(t("user.notFoundOrConfirmed"));

  await sendOtp({ user, subject: emailEventEnum.FORGOT_PASSWORD }, t);
};

//verify forgot password
export const verifyForgotPassword = async ({ email, otp }, t) => {
  let user = await userRepo.findOne({ filter: { email } });
  if (!user) notFoundExeption(t("user.notFound"));

  let userId = user._id.toString();
  let subject = emailEventEnum.FORGOT_PASSWORD;

  await verifyOtp({ userId, subject, otp }, t);

  await setCache({
    key: subjectOtpKey({ userId, subject }),
    value: otp,
    ttl: 150,
  });
  return user;
};

//reset password
export const resetPassword = async ({ email, newPassword, otp }, t) => {
  let user = await verifyForgotPassword({ email, otp }, t);
  user.password = await hashPassword({ plainText: newPassword });
  await user.save();
  await deleteCacheByPrefix({
    prefix: subjectOtpKey({
      userId: user._id.toString(),
      subject: emailEventEnum.FORGOT_PASSWORD,
    }),
  });
  return true;
};
//revoke token
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

//google login
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

//confirm email
export const confirmEmail = async ({ otp, email }, t) => {
  let user = await userRepo.findOne({ filter: { email } });
  if (!user) unauthorizedExeption(t("user.notFound"));

  let userId = user._id.toString();
  let subject = emailEventEnum.SINGUP;

  await verifyOtp({ userId, subject, otp }, t);

  user.emailConfirmed = true;
  await user.save();
  await deleteCacheByPrefix({
    prefix: subjectOtpKey({
      userId,
      subject,
    }),
  });
  return user;
};

//resend otp
export const resendOtp = async ({ email, subject }, t) => {
  if (!subject) badRequestExeption(t("subject.required"));
  if (subject !== emailEventEnum.SINGUP) {
    badRequestExeption(t("subject.invalid"));
  }
  let user = await userRepo.findOne({
    filter: {
      $and: [
        { email },
        {
          $or: [
            { emailConfirmed: { $exists: false } },
            { emailConfirmed: { $eq: null } },
          ],
        },
      ],
    },
  });

  if (!user) unauthorizedExeption(t("user.notFoundOrConfirmed"));

  let cachedOtp = await ttlCache({
    key: subjectOtpKey({ userId: user._id.toString(), subject }),
  });
  if (cachedOtp > 0) {
    conflictExeption(t("otp.stillValid"));
  }
  if (user.emailConfirmed) {
    forbiddenExeption(t("email.already.confirmed"));
  }
  await sendOtp({ user, subject }, t);
  return true;

  // return user;
};

//verify otp
const verifyOtp = async ({ userId, subject, otp }, t) => {
  let blockTtl = await ttlCache({
    key: otpBlockedKey({ userId, subject }),
  });
  if (blockTtl > 0) {
    const minutes = Math.ceil(blockTtl / 60);
    unauthorizedExeption(t("otp.wrong", { blocked: minutes }));
  }
  let wrongOtp = await getCache({
    key: wrongOtpKey({ userId, subject }),
  });

  if (wrongOtp >= 5) {
    await setCache({
      key: otpBlockedKey({ userId, subject }),
      value: 1,
      ttl: 900,
    });
    tooManyRequests(t("otp.wrong", { blocked: 900 / 60 }));
  }
  let cachedOtp = await getCache({
    key: subjectOtpKey({
      userId,
      subject,
    }),
  });

  if (!cachedOtp || String(cachedOtp) !== String(otp)) {
    await incrementCache({
      key: wrongOtpKey({ userId, subject }),
    });
    badRequestExeption(t("otp.invalid"));
  }
};
