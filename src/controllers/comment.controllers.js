import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
    const videoObjectID = new mongoose.Types.ObjectId(videoId);

    const comments = await Comment.aggregate([
        {
            $match: {
                video: videoObjectID,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            },
        },
        {
            $unwind: "$ownerDetails",
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                "owner._id": "$ownerDetails._id",
                "owner.name": "$ownerDetails.name",
                "owner.email": "$ownerDetails.email",
            },
        },
        {
            $skip: (parseInt(page) - 1) * parseInt(limit),
        },
        {
            $limit: parseInt(limit),
        },
    ]);
    if (!comments.length) {
        throw new ApiError(404, "no comments found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
    if (!req.user) {
        throw new ApiError(401, "User needs to be logged in");
    }
    if (!content) {
        throw new ApiError(400, "Content for comment should be present");
    }

    const addComment = await Comment.create({
        content,
        owner: req.user?._id,
        video: videoId,
    });
    if (!addComment) {
        throw new ApiError(
            500,
            "Something went wrong while adding the comment"
        );
    }
    return res
        .status(201)
        .json(new ApiResponse(200, addComment, "Comment added succesfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid video id");
    }
    if (!req.user) {
        throw new ApiError(401, "User needs to be logged in");
    }
    if (!content) {
        throw new ApiError(400, "Content for comment should be present");
    }
    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user?.id,
        },
        {
            $set: {
                content,
            },
        },
        { new: true }
    );
    if (!updatedComment) {
        throw new ApiError(
            500,
            "Something went wrong while updating ypur comment"
        );
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, updateComment, "Comment updated successfully")
        );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid video id");
    }
    if (!req.user) {
        throw new ApiError(401, "User needs to be logged in");
    }
    if (!content) {
        throw new ApiError(400, "Content for comment should be present");
    }
    const deleteComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user?._id,
    });
    if (!deleteComment) {
        throw new ApiError(
            500,
            "Something went wrong while deleting the comment"
        );
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, deleteComment, "Comment deleted successfully")
        );
});

export { getVideoComments, addComment, updateComment, deleteComment };
