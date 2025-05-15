import ffmpeg from "fluent-ffmpeg";

export const getVideoDuration = (videoPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                reject("Error extracting video duration");
            } else {
                resolve(metadata.format.duration);
            }
        });
    });
};
