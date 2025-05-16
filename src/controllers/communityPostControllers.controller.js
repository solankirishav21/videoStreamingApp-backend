import mongoose, { isValidObjectId } from "mongoose";
import { CommunityPost } from "../models/communityPost.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createCommunityPost = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const ownerId = req.user?._id;

    if (!content) {
        throw new ApiError(400, "Community Post Content is required");
    }
    const newCommunityPost = await CommunityPost.create({
        content,
        owner: ownerId,
    });
    if (!newCommunityPost) {
        throw new ApiError(500, "Something went wrong while creating the post");
    }
    return res
        .status(201)
        .json(
            new ApiResponse(201, newCommunityPost, "Post created successfully")
        );
});

const getCommunityPost = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    const communityPosts = await CommunityPost.find({
        owner: userId,
    }).sort({ createdAt: -1 });
    if (!communityPosts || communityPosts.length === 0) {
        throw new ApiError(404, "No post found");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, communityPosts, "Post fetched successfully")
        );
});

const updateCommunityPost = asyncHandler(async (req, res) => {
    const { communityPostId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!isValidObjectId(communityPostId)) {
        throw new ApiError(400, "Invalid post ID");
    }

    if (!content) {
        throw new ApiError(400, "Post content is required to update");
    }

    const post = await CommunityPost.findById(communityPostId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (post.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only update your own posts");
    }

    const updatedPost = await CommunityPost.findByIdAndUpdate(
        communityPostId,
        { $set: { content } },
        { new: true }
    );
    if (!updatedPost) {
        throw new ApiError(500, "Something went wrong while updating the post");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPost, "Post updated successfully"));
});

const deleteCommunityPost = asyncHandler(async (req, res) => {
    const { communityPostId } = req.params;
    const userId = req.user?._id;
    if (!isValidObjectId(communityPostId)) {
        throw new ApiError(400, "Invalid post id");
    }
    const communityPost = await CommunityPost.findById(communityPostId);
    if (!communityPost) {
        throw new ApiError(404, "Post not found");
    }
    if (communityPost.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only delete your own posts");
    }
    const deletedPost = await CommunityPost.findByIdAndDelete(communityPostId);
    if (!deletedPost) {
        throw new ApiError(500, "Something went wrong while deleting the post");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, deletedPost, "Post deleted successfully"));
});

export {
    createCommunityPost,
    getCommunityPost,
    updateCommunityPost,
    deleteCommunityPost,
};
