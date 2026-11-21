import { langEnum } from "../enum/index.js";

export const validation = (schema) => {
    return async (req, res, next) => {
        const lang = req.headers["accept-language"] || langEnum.english;
        let { success, data, error } = schema(lang).safeParse({
            body: req.body,
            params:req.params,
            query:req.query,
            headers:req.headers,
        });
        if (!success) {
            throw error;
        }
        req.validate = data;
        next();
    }
}