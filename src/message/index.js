import { arMessage } from "./ar.js";
import { enMessage } from "./en.js";
import { langEnum } from "../common/enum/index.js";

const messages = {
  [langEnum.arabic]: arMessage,
  [langEnum.english]: enMessage,
};

export const getMessage = (lang, key, params = {}) => {
  const dict = messages[lang] || messages[langEnum.english];
  let text = dict[key] || messages[langEnum.english][key] || key;

  Object.entries(params).forEach(([k, v]) => {
    text = text.replaceAll(`{{${k}}}`, String(v));
  });
  return text;
};