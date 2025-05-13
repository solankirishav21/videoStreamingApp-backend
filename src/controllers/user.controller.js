import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - empty fileds
    // check if user already exist
    // check from images , avatar
    // upload them to clodinary
    // create user object - create an db entry
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { fullName, email, userName, password } = req.body;
    // console.log("email", email);
    // console.log("fullName", fullName);
    // console.log("userName", userName);
    if (
        [fullName, email, userName, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fileds are required");
    }

    const existingUser = User.findOne({
        $or: [{ userName }, { email }],
    });
    if (existingUser) {
        throw new ApiError(409, "User with email or username already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required!");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar is required!");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while creating the new user"
        );
    }
    return res
        .staus(201)
        .json(
            new ApiResponse(200, createdUser, "User Registered Successfully")
        );
});

export { registerUser };
