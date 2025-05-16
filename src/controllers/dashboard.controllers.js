import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const totalVideos = await Video.countDocuments({ owner: userId });
    if (totalVideos === null || totalVideos === undefined) {
        throw new ApiError(
            500,
            "Something went wrong while displaying total videos"
        );
    }
    const totalSubscriber = await Subscription.countDocuments({
        channel: userId,
    });
    if (totalSubscriber === null || totalSubscriber === undefined) {
        throw new ApiError(
            500,
            "Something went wrong while displaying total subscriber"
        );
    }
    const totalVideoLikes = await Like.countDocuments({
        video: {
            $in: await Video.find({ owner: userId }).distinct("_id"),
        },
    });
    if (totalVideoLikes === null || totalVideoLikes === undefined) {
        throw new ApiError(
            500,
            "Something went wrong while displaying total likes on video"
        );
    }
    const totalCommentLikes = await Like.countDocuments({
        video: {
            $in: await Comment.find({ owner: userId }).distinct("_id"),
        },
    });
    if (totalCommentLikes === null || totalCommentLikes === undefined) {
        throw new ApiError(
            500,
            "Something went wrong while displaying total likes on comments"
        );
    }
    const totalPostLikes = await Like.countDocuments({
        video: {
            $in: await CommunityPost.find({ owner: userId }).distinct("_id"),
        },
    });
    if (totalPostLikes === null || totalPostLikes === undefined) {
        throw new ApiError(
            500,
            "Something went wrong while displaying total likes on post"
        );
    }
    const totalViews = await Video.aggregate([
        { $match: { owner: userId } },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }, // Sum up the `views` field
            },
        },
    ]);
    if (totalViews === null || totalViews === undefined) {
        throw new ApiError(
            500,
            "Something went wrong while fetching total views"
        );
    }
    res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalCommentLikes,
                totalPostLikes,
                totalSubscriber,
                totalVideoLikes,
                totalViews: totalViews[0]?.totalViews || 0,
            },
            "Channel Stats Fetched Succesfully"
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const videos = await Video.find({
        owner: userId,
    }).sort({ createdAt: -1 });
    if (!videos || videos.length === 0) {
        throw new ApiError(404, "No videos found for this channel");
    }
    res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    );
});

export { getChannelStats, getChannelVideos };
