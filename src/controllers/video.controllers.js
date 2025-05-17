import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { getVideoDuration } from "../utils/ffmpeg.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);

    if (
        isNaN(pageNumber) ||
        isNaN(pageLimit) ||
        pageNumber < 1 ||
        pageLimit < 1
    ) {
        throw new ApiError(400, "Invalid pagination parameters");
    }

    let searchConditions = {};

    if (query) {
        searchConditions = {
            $or: [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
            ],
        };
    }

    if (userId && isValidObjectId(userId)) {
        searchConditions.owner = userId;
    }

    const sortOrder = sortType === "asc" ? 1 : -1;

    const videos = await Video.find(searchConditions)
        .sort({ [sortBy || "createdAt"]: sortOrder })
        .skip((pageNumber - 1) * pageLimit)
        .limit(pageLimit);

    const totalVideos = await Video.countDocuments(searchConditions);

    const totalPages = Math.ceil(totalVideos / pageLimit);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                pagination: {
                    page: pageNumber,
                    limit: pageLimit,
                    totalPages,
                    totalVideos,
                },
            },
            "Videos retrieved successfully"
        )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        throw new ApiError(400, "Title should not be empty");
    }
    if (!description) {
        throw new ApiError(400, "Description should not be empty");
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if (!videoLocalPath) {
        throw new ApiError(400, "Video File is required");
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }
    try {
        const duration = await getVideoDuration(videoLocalPath);
        const videoFile = await uploadOnCloudinary(videoLocalPath);

        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!videoFile) {
            throw new ApiError(400, "Video File is required");
        }
        if (!thumbnail) {
            throw new ApiError(400, "Thumbnail is required");
        }
        const video = await Video.create({
            owner: req.user?._id,
            title,
            description,
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            duration,
        });
        if (!video) {
            throw new ApiError(
                500,
                "Something went wrong while uploading the video"
            );
        }
        return res
            .status(201)
            .json(new ApiResponse(201, video, "Video Published Successfully"));
    } catch (error) {
        if (videoFile?.public_id) {
            await uploadOnCloudinary.deleteResource(videoFile.public_id);
        }
        if (thumbnail?.public_id) {
            await uploadOnCloudinary.deleteResource(thumbnail.public_id);
        }
        throw new ApiError(500, error?.message || "Error uploading video");
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }
    const video = await Video.findById(videoId).populate("owner", "name email");
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video Fetched Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }
    const { title, description } = req.body;
    if (!(title && description)) {
        throw new ApiError(400, "Title and Description is required");
    }
    let updateData = { title, description };
    if (req?.files) {
        const thumbnailLocalPath = req.file.path;

        if (!thumbnailLocalPath) {
            throw new ApiError(400, "Thumbnail file is missing");
        }
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if (!thumbnail.url) {
            throw new ApiError(400, "Error while uploading thumbnail");
        }
        updateData.thumbnail = thumbnail.url;
    }
    const updatedVideoDetails = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateData,
        },
        { new: true, runValidators: true }
    );
    if (!updatedVideoDetails) {
        throw new ApiError(404, "Video not found");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedVideoDetails,
                "Video Details Updated Successfully"
            )
        );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (req.user._id.toString() !== video.owner.toString()) {
        throw new ApiError(403, "You are not authorized to access this video");
    }

    try {
        // Delete from cloudinary
        const videoPublicId = video.videoFile.split("/").pop().split(".")[0];
        const thumbnailPublicId = video.thumbnail
            .split("/")
            .pop()
            .split(".")[0];

        await Promise.all([
            uploadOnCloudinary.deleteResource(videoPublicId),
            uploadOnCloudinary.deleteResource(thumbnailPublicId),
        ]);
    } catch (error) {
        console.error("Error while deleting the video from cloudinary", error);
        throw new ApiError(500, "Video could not be deleted from cloudinary");
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);
    if (!deletedVideo) {
        throw new ApiError(500, "Error deleting video from database");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedVideo, "Video Deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video does not exist");
    }
    if (req.user._id.toString() !== video.owner.toString()) {
        throw new ApiError(403, "You are not authorized to access this video");
    }
    video.isPublished = !video.isPublished;
    await video.save();
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video publish status toggled successfully"
            )
        );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
