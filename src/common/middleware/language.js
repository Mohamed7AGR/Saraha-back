import { langEnum } from "../enum/index.js";
import { getMessage } from "../../message/index.js";

export const languageMiddleware = (req, res, next) => {
  const header = (req.headers["accept-language"] || "").toLowerCase();
  req.lang = header.startsWith("ar") ? langEnum.arabic : langEnum.english;
  req.t = (key) => getMessage(req.lang, key);
  next();
};