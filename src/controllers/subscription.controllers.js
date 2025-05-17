import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user?._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id");
    }
    if (subscriberId.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }
    const existingSubscriber = await Subscription.findOne({
        channel: channelId,
        subscriber: subscriberId,
    });
    if (existingSubscriber) {
        await Subscription.findByIdAndDelete(existingSubscriber?._id);
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Channel Unsubscribed"));
    }
    const newSubscriber = await Subscription.create({
        channel: channelId,
        subscriber: subscriberId,
    });
    if (!newSubscriber) {
        throw new ApiError(
            500,
            "Something went wrong while subscribing the channel"
        );
    }
    return res
        .status(201)
        .json(new ApiResponse(201, newSubscriber, "Channel Subscribed"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id");
    }
    const subscriberDocs = await Subscription.find({
        channel: channelId,
    }).populate("subscriber", "name _id email");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                subscriber: subscriberDocs,
                subscriberCount: subscriberDocs.length,
            },
            "Subscriber fetched successfully"
        )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    const subscribedChannels = await Subscription.find({
        subscriber: subscriberId,
    }).populate("channel", "_id name email");
    if (!subscribedChannels || subscribedChannels.length === 0) {
        throw new ApiError(404, "No channels found");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                channel: subscribedChannels,
                channelCount: subscribedChannels.length,
            },
            "Subscribed channel fetched successfully"
        )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
