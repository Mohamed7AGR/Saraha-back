import { notFoundExeption } from "../../common/index.js";
import userRepo from "../../db/repo/user.repo.js";

export const profile = async (userId) => {
    let user = await userRepo.findById({ id: userId });
    
    if (!user) notFoundExeption("User not found");
  return user;
};

export const updateProfile = async (userId, data) => {
    let user = await userRepo.findByIdAndUpdate({ id: userId, update: data });
    if (!user) notFoundExeption("User not found");
    return user;
};

