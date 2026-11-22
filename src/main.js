import express from "express";
import { connectDB } from "./db/connection.js";
import configService from "./config/config.service.js";
import { errorHandler, mailService } from "./common/index.js";
import { authController, userController } from "./module/index.js";
import cors from "cors";
import { languageMiddleware } from "./common/middleware/language.js";

let port = configService.PORT;
const app = express();
app.use(express.json(),cors());
app.use(languageMiddleware);
await connectDB();
//await mailService.sendEmail();

app.use("/auth", authController);
app.use("/user", userController);
app.use(errorHandler);

app.listen(port, () => {
});

export default app;
