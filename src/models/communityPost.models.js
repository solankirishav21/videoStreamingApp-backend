import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const communityPostSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        content: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

communityPostSchema.plugin(mongooseAggregatePaginate);

export const CommunityPost = mongoose.model(
    "CommunityPost",
    communityPostSchema
);
