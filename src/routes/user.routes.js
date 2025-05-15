import { Router } from "express";
import {
    loginUser,
    logOutUser,
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
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
router.route("/changePassword").post(verifytJWT, changeCurrentPassword);
router.route("/currentUser").post(verifytJWT, getCurrentUser);
router.route("/updateAccount").patch(verifytJWT, updateAccountDetails);
router
    .route("/changeAvatar")
    .patch(verifytJWT, upload.single("avatar"), updateUserAvatar);
router
    .route("/changeCoverImage")
    .patch(verifytJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/c/:userName").get(verifytJWT, getUserChannelProfile);
router.route("/watchHistory").get(verifytJWT, getWatchHistory);

export default router;
