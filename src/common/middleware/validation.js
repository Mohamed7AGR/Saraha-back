
export const validation = (schema) => {
    return (req, res, next) => {
      const result = schema(req.lang).safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
        files: req.files,
        headers: req.headers,
        file: req.file,
      });
      if (!result.success) return next(result.error);
      req.validate = result.data;
      next();
    };
  };