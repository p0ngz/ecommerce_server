export const verifyApiKey = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    const err = new Error("Forbidden: Invalid API Key");
    err.status = 403;
    return next(err);
  }
  next();
};
