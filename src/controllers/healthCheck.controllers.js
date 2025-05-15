import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    try {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { status: "ok" },
                    "Endpoind working Successfully, Health Check Successful!"
                )
            );
    } catch (error) {
        throw new ApiError(500, "Health Check Failed! Something Went Wrong");
    }
});

export { healthcheck };
