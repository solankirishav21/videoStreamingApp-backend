import { Router } from "express";
import {
    loginUser,
    logOutUser,
    registerUser,
    refreshAccessToken,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifytJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

// Secured Routes

router.route("/logout").post(verifytJWT, logOutUser);
router.route("/refreshAccessToken").post(refreshAccessToken);

export default router;
