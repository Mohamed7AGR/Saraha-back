import ms from "ms";

import {
  comparePassword,
  unauthorizedExeption,
  conflictExeption,
  hashPassword,
  encrypt,
  providerEnum,
  //decrypt,
} from "../../common/index.js";
import { generateToken } from "../../common/security/index.js";
import { OAuth2Client } from "google-auth-library";
import configService from "../../config/config.service.js";
import userRepo from "../../db/repo/user.repo.js";

const client = new OAuth2Client();

export const signup = async (data) => {
  let isExists = await userRepo.findOne({ filter: { email: data.email } });

  if (isExists) conflictExeption("Email already exists");
  data.password = await hashPassword({ plainText: data.password });
  data.phone = encrypt(data.phone);
  let user = await userRepo.create({ data });
  let { accessToken, refreshToken } = generateToken({ sub: user._id });
  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const login = async ({ email, password }) => {
  let user = await userRepo.findOne({
    filter: { email },
    projection: { email: 1, password: 1, role: 1 },
    options: { lean: true },
  });

  if (!user) unauthorizedExeption("Invalid email or password");

  let matchPassword = await comparePassword({
    plainText: password,
    encrypted: user.password,
  });

  if (!matchPassword) unauthorizedExeption("Invalid email or password");

  let { accessToken, refreshToken } = generateToken(
    { sub: user._id },
    {},
    user.role,
  );

  return { ...user, accessToken, refreshToken };
};

export const rotateToken = async (user, payload) => {
  let accessIat = payload.iat * 1000;
  let accessExp = ms(configService.JWT_EXPIRES_IN);
  let accessExpAt = accessIat + accessExp;
  if (Date.now() < accessExpAt) {
    unauthorizedExeption("Token still valid");
  }
  let { accessToken, refreshToken } = generateToken({ sub: user._id });
  return { accessToken, refreshToken };
};

export const googleLogin = async (data) => {
  const ticket = await client.verifyIdToken({
    idToken: data.idToken,
    audience: configService.Google_Client_ID,
  });
  const payload = ticket.getPayload();
  console.log(payload);
  let { email, name, email_verified, picture } = payload;
  if (!email_verified) unauthorizedExeption("Email not verified");
  let user = await userRepo.findOne({ filter: { email } });
  let status=200;
  if (!user) {
    user = await userRepo.create({
      data: { email, fullName:name, image: picture, provider: providerEnum.google },
    });
    status=201;
  }
  const tokens = generateToken({ sub: user._id }, {}, user.role);
return { ...tokens, status };
};
