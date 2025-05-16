# Vidflow

A full-featured backend clone of YouTube, designed with Node.js, Express, and MongoDB. This project supports user authentication, video streaming, playlists, comments, likes, subscriptions, and community posts to provide a comprehensive video platform backend.

---

## 🚀 Project Walkthrough

Vidflow is built to replicate core YouTube functionalities with a RESTful API structure. It uses a modular architecture separating controllers, routes, models, and middlewares for maintainability and scalability.

---

## 🔥 Key Features and Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `GET /api/users/refresh` - Refresh access token

### Videos
- `GET /api/videos` - Get all videos
- `POST /api/videos` - Upload a video
- `GET /api/videos/:id` - Get video by ID
- `PUT /api/videos/:id` - Update video details
- `DELETE /api/videos/:id` - Delete a video

### Comments
- `GET /api/comments/:videoId` - Get comments for a video
- `POST /api/comments` - Add a comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Likes
- `POST /api/likes/video/:videoId` - Like or unlike a video
- `POST /api/likes/comment/:commentId` - Like or unlike a comment

### Playlists
- `GET /api/playlists` - Get user playlists
- `POST /api/playlists` - Create a new playlist
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist

### Subscriptions
- `POST /api/subscriptions/:channelId` - Subscribe/unsubscribe to a channel

### Community Posts
- `GET /api/communityPosts` - Get community posts
- `POST /api/communityPosts` - Create a community post
- `PUT /api/communityPosts/:id` - Update community post
- `DELETE /api/communityPosts/:id` - Delete community post

### Health Check
- `GET /api/health` - Server status check

### Dashboard
- `GET /api/dashboard` - Get aggregated stats (videos, users, etc.)

---

## 🛠️ Tech Stack & Packages Used

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web framework for Node.js
- **MongoDB & Mongoose** - Database and ODM
- **jsonwebtoken (JWT)** - Authentication token management
- **bcrypt** - Password hashing
- **multer** - Handling file uploads (video files, images)
- **dotenv** - Environment variable management
- **cors** - Cross-Origin Resource Sharing
- **nodemon** - Development server auto-restart

---

## 🔗 Backend Model Diagram

Visualize the database models and relationships here:  
[Backend Model Diagram](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

---

## 💡 How to Run

1. Clone the repository  
```bash
git clone <repo-url>
cd <repo-folder>
```
2. Install dependencies
```bash
npm install
```
3. Create a .env file with your environment variables (MongoDB URI, JWT secret, etc.)
4. Run the server
```bash
   npm run dev
```
## ⚙️ Environment Variables

To run this project, you need to create a .env file in the root directory with the following variables:

```
PORT=                           # The port on which the server will run
MONGODB_URI=your_mongodb_connection_string   # MongoDB connection URI

CORS_ORIGIN=                     # Allowed CORS origin(s), e.g., "*" or specific domain

ACCESS_TOKEN_SECRET=your_access_token_secret      # Secret key for signing JWT access tokens
ACCESS_TOKEN_EXPIRY=1d              # Access token expiry time (e.g., 1d for 1 day)

REFRESH_TOKEN_SECRET=your_refresh_token_secret    # Secret key for signing JWT refresh tokens
REFRESH_TOKEN_EXPIRY=10d            # Refresh token expiry time (e.g., 10d for 10 days)

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name   # Cloudinary cloud name for media uploads
CLOUDINARY_API_KEY=your_cloudinary_api_key         # Cloudinary API key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret   # Cloudinary API secret
```


   
