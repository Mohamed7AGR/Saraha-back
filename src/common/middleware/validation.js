export const validation = (schema) => {
    return async (req, res, next) => {
        let { success, data, error } = schema.safeParse(req.body);
        if (!success) {
            throw error;
        }
        req.validate = data;
        next();
    }
}