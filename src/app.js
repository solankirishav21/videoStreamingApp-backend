import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Routes Import
import userRouter from "./routes/user.routes.js";
import healthcheckRouter from "./routes/healthCheck.routes.js";
import videoRouter from "./routes/videos.routes.js";
import communityPostRouter from "./routes/communityPost.routes.js";
import likeRouter from "./routes/like.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/healthCheck", healthcheckRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/communityPost", communityPostRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/vi/subscription", subscriptionRouter);

export { app };
