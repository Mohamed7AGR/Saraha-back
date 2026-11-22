import { notFoundExeption } from "../../common/index.js";
import userRepo from "../../db/repo/user.repo.js";

export const profile = async (userId, t) => {
  let user = await userRepo.findById({ id: userId });
  if (!user) notFoundExeption(t("user.notFound"));
  return user;
};

export const updateProfile = async (userId, data, t) => {
  let user = await userRepo.findByIdAndUpdate({ id: userId, update: data });
  if (!user) notFoundExeption(t("user.notFound"));
  return user;
};

export const getUserById = async (userId, t) => {
  let user = await userRepo.findById({
    id: userId,
    projection: { firstName: 1, lastName: 1, email: 1, phone: 1, gender: 1 },
  });
  if (!user) notFoundExeption(t("user.notFound"));
  return user;
};