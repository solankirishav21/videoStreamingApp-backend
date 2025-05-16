import { Router } from "express";
import {
    createCommunityPost,
    getCommunityPost,
    updateCommunityPost,
    deleteCommunityPost,
} from "../controllers/communityPostControllers.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createCommunityPost);
router.route("/user/:userId").get(getCommunityPost);
router
    .route("/:communityPostID")
    .patch(updateCommunityPost)
    .delete(deleteCommunityPost);

export default router;
