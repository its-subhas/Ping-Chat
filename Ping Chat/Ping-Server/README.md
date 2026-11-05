# Ping Chat – Backend

The backend of **Ping Chat**, a real-time messaging application built with Node.js, Express, MongoDB, Socket.IO, Cloudinary, and Google Gemini.

It provides authentication, session management, messaging APIs, real-time communication, media uploads, and AI-powered features.

## Live Services

- **Frontend:** https://ping-chat-omega.vercel.app
- **Backend:** https://ping-server-0q6n.onrender.com
- **GitHub Repository:** https://github.com/its-subhas/Ping-Chat

## Features

### Authentication and Security

- User registration and login
- Google OAuth authentication
- Password hashing with bcrypt
- JWT access and refresh tokens
- Separate access and refresh token secrets
- HTTP-only authentication cookies
- Server-side session management
- Refresh token rotation
- Session revocation on logout
- Protected API routes

### Messaging

- Retrieve users and conversations
- Send text messages
- Send image messages
- Delete messages
- Mark messages as seen
- Track unread messages
- Store messages in MongoDB

### Real-Time Communication

- Socket.IO connection management
- Online user tracking
- Real-time message delivery
- Typing indicators
- Message seen notifications
- Audio/video call signaling
- WebRTC offer/answer exchange
- ICE candidate exchange

### Gemini Integration

- Gemini Assistant Chat
- AI-powered automatic replies
- Context-aware AI interactions
- Image-aware assistant interactions

### Media Storage

- Cloudinary image uploads
- Profile picture storage
- Message image storage

### Group Chat Status

Group messaging is not currently implemented in the backend. There are no group messaging APIs, group database models, or group persistence functionality.

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| MongoDB | Database |
| Mongoose | Database modeling |
| Socket.IO | Real-time communication |
| JSON Web Token | Authentication |
| bcryptjs | Password hashing |
| Cookie Parser | Cookie handling |
| Cloudinary | Image storage |
| Google Auth Library | Google OAuth |
| Google Gemini | AI integration |
| WebRTC | Audio/video communication |

## Project Structure

```text
Ping-Server/
├── config/
├── controllers/
│   ├── userController.js
│   ├── messageController.js
│   └── geminiController.js
├── middleware/
├── models/
├── routes/
├── lib/
│   ├── calls.js
│   └── cloudinary.js
├── .env
├── server.js
├── package.json
└── README.md
```

This is a high-level overview of the backend structure.

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB database
- Cloudinary account
- Google Gemini API key
- Google Cloud OAuth credentials (for Google sign-in)

### 1. Clone the repository

```bash
git clone https://github.com/its-subhas/Ping-Chat.git
```

### 2. Navigate to the backend directory

```bash
cd "Ping Chat/Ping-Server"
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the `Ping-Server` directory:

```env
PORT=7000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET_ACCESS_TOKEN=your_access_token_secret
JWT_SECRET_REFRESH_TOKEN=your_refresh_token_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GEMINI_API_KEY=your_gemini_api_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:7000/api/auth/google/callback
```

Replace all placeholder values with your actual credentials.

### 5. Start the development server

```bash
npm run dev
```

The backend normally runs at:

```text
http://localhost:7000
```

Use the production start script defined in `package.json` when deploying.

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `NODE_ENV` | Application environment |
| `CLIENT_URL` | Allowed frontend origin |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET_ACCESS_TOKEN` | Access token signing secret |
| `JWT_SECRET_REFRESH_TOKEN` | Refresh token signing secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Google OAuth callback URL |

**Important:**
- The application uses the `Ping` MongoDB database.
- Configure your MongoDB connection string according to the database setup.
- Keep all private credentials in the backend `.env` file.
- Never commit `.env` files to GitHub.

## API Reference

### Authentication

Base route: `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register a user |
| POST | `/login` | Login a user |
| POST | `/refresh` | Refresh access token |
| GET | `/check` | Check authentication |
| PUT | `/update-profile` | Update user profile |
| PUT | `/ai-auto-reply` | Update AI Auto-Reply setting |
| POST | `/logout` | Logout and revoke session |
| GET | `/google` | Start Google OAuth |
| GET | `/google/callback` | Handle Google OAuth callback |

### Messages

Base route: `/api/messages`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | Retrieve users |
| GET | `/:id` | Retrieve conversation messages |
| PUT | `/mark/:id` | Mark messages as seen |
| POST | `/send/:id` | Send a message |
| DELETE | `/delete/:messageId` | Delete a message |
| POST | `/gemini` | Gemini Assistant Chat |

### Status

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Root endpoint |
| GET | `/api/status` | Backend status |

## Socket.IO Events

Socket.IO handles real-time communication between connected users.

### Messaging and Presence

| Event | Description |
|---|---|
| `getOnlineUsers` | Update online users |
| `userTyping` | Notify that a user is typing |
| `userStopTyping` | Notify that a user stopped typing |
| `isTyping` | Receive typing status |
| `newMessage` | Receive a new message |
| `messageDeleted` | Notify message deletion |
| `messageSeen` | Notify message seen status |

### Audio and Video Calls

The call signaling implementation supports:

- Audio and video call offers
- Incoming call notifications
- Accepting and rejecting calls
- Ending calls
- WebRTC offer and answer exchange
- ICE candidate exchange
- Camera status updates

## Authentication Flow

Ping uses JWT-based authentication with separate access and refresh tokens.

1. A user signs in using email/password or Google OAuth.
2. The backend creates a session and issues access and refresh tokens.
3. Authentication tokens are stored in HTTP-only cookies.
4. Protected routes validate the access token and active session.
5. The refresh endpoint validates the refresh token and rotates tokens when required.
6. Logging out revokes the active session.

### Token Configuration

| Token | Configured Lifetime |
|---|---|
| Access token | 15 minutes |
| Refresh session | Up to 15 days |

Refresh sessions are managed on the server and can be revoked.

## Security

- Passwords are hashed using bcrypt.
- Access and refresh tokens use separate signing secrets.
- Refresh tokens are stored as hashes in the session database.
- Session expiration and revocation are checked by protected routes.
- HTTP-only cookies help prevent JavaScript access to authentication tokens.
- CORS is configured to allow the frontend origin with credentials.
- Logout revokes the active session.

**Socket.IO note:** The current socket connection identifies users through a `userId` handshake query parameter. This is separate from the HTTP protected-route authentication flow.

## Google OAuth Configuration

Configure your Google OAuth client in Google Cloud Console.

### Local Callback URL

```text
http://localhost:7000/api/auth/google/callback
```

### Production Callback URL

```text
https://ping-server-0q6n.onrender.com/api/auth/google/callback
```

The authorized redirect URI in Google Cloud Console must exactly match the value of `GOOGLE_REDIRECT_URI`.

## Deployment

The backend is deployed on Render.

1. Create a new Web Service on Render.
2. Connect the GitHub repository.
3. Set the root directory to `Ping Chat/Ping-Server`.
4. Set the build command to `npm install`.
5. Set the start command to the production start script in `package.json`.
6. Add all required environment variables.
7. Deploy the service.

Make sure the frontend's Vercel API rewrite points to the deployed backend URL.

## Implementation Notes

- MongoDB stores user information, messages, and authentication sessions.
- Cloudinary stores uploaded profile pictures and message images.
- Gemini Assistant Chat and AI Auto-Reply are separate features.
- Group messaging, group database models, and group APIs are not implemented.
- WebRTC currently uses Google's public STUN server. No TURN server is configured, so calls may not connect on some restrictive networks.
- The Socket.IO handshake currently identifies users through a `userId` query parameter.
- Configure production credentials through Render environment variables.

## Related Links

- **Live Application:** https://ping-chat-omega.vercel.app
- **GitHub Repository:** https://github.com/its-subhas/Ping-Chat
- **Frontend README:** [Ping-Client](../Ping-Client/README.md)
- **Root README:** [Ping Chat](../../README.md)
