import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId,
    });
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike?._id);
        return res
            .status(200)
            .json(
                new ApiResponse(200, existingLike, "Video unliked successfully")
            );
    }
    const newLike = await Like.create({
        video: videoId,
        likedBy: userId,
    });

    if (!newLike) {
        throw new ApiError(500, "Something went wrong while liking the video");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, newLike, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user?._id;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId,
    });
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike?._id);
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    existingLike,
                    "Comment unliked successfully"
                )
            );
    }
    const newLike = await Like.create({
        comment: commentId,
        likedBy: userId,
    });

    if (!newLike) {
        throw new ApiError(
            500,
            "Something went wrong while liking the comment"
        );
    }

    return res
        .status(201)
        .json(new ApiResponse(201, newLike, "Comment liked successfully"));
});

const toggleCommunityPostLike = asyncHandler(async (req, res) => {
    const { communityPostId } = req.params;
    const userId = req.user?._id;
    if (!isValidObjectId(communityPostId)) {
        throw new ApiError(400, "Invalid post id");
    }
    const existingLike = await Like.findOne({
        communityPost: communityPostId,
        likedBy: userId,
    });
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike?._id);
        return res
            .status(200)
            .json(
                new ApiResponse(200, existingLike, "Post unliked successfully")
            );
    }
    const newLike = await Like.create({
        communityPost: communityPostId,
        likedBy: userId,
    });

    if (!newLike) {
        throw new ApiError(
            500,
            "Something went wrong while liking the comment"
        );
    }

    return res
        .status(201)
        .json(new ApiResponse(201, newLike, "Post liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const likedVideos = await Like.find({
        likedBy: userId,
        video: { $exists: true },
    }).populate("video", "_id title url");
    res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export {
    toggleCommentLike,
    toggleCommunityPostLike,
    toggleVideoLike,
    getLikedVideos,
};
