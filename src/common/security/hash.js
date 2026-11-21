import { hash, compare } from "bcrypt";
import configService from "../../config/config.service.js";
export const hashPassword = async ({ plainText }) => {
  return await hash(plainText, configService.SALT_ROUNDS);
};
export const comparePassword = async ({ plainText, encrypted }) => {
  return await compare(plainText, encrypted);
};
