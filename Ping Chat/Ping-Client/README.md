# Ping Chat – Frontend

The frontend of **Ping Chat**, a real-time messaging application built with React, Vite, Tailwind CSS, Redux Toolkit, and Socket.IO.

It provides a responsive interface for private messaging, online presence, typing indicators, read receipts, audio/video calling, Google sign-in, and Gemini-powered features.

## Live Application

- **Live Application:** https://ping-chat-omega.vercel.app
- **Backend:** https://ping-server-0q6n.onrender.com
- **GitHub Repository:** https://github.com/its-subhas/Ping-Chat

## Features

### Authentication

- Email and password signup/login
- Google sign-in
- JWT-based authentication
- Access token refresh
- Secure cookie-based authentication

### Private Messaging

- Send and receive text messages
- Share images
- Online/offline user status
- Real-time typing indicators
- Message seen/read status
- Unread message counts
- Delete messages
- User profile information

### Audio and Video Calling

- Audio calls
- Video calls
- Incoming call interface
- Accept and reject calls
- Microphone mute controls
- Camera on/off controls
- WebRTC-based communication

### Gemini Integration

- Gemini Assistant Chat
- AI-powered automatic replies
- Context-aware conversations
- Image-aware assistant interactions

### Profile Management

- Update profile information
- Change profile picture
- Edit biography

### Group Chat Status

Group Chat is currently hidden from the home screen and is not available in the frontend user interface. Group messaging is not implemented in the backend.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Development and build tool |
| Tailwind CSS | Styling |
| Redux Toolkit | State management |
| React Router | Client-side routing |
| Axios | HTTP requests |
| Socket.IO Client | Real-time communication |
| WebRTC | Audio/video communication |
| React Hot Toast | Notifications |

## Project Structure

```text
Ping-Client/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   ├── store/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

This is a high-level overview of the frontend structure.

## Getting Started

### Prerequisites

- Node.js
- npm
- Running Ping Chat backend

### 1. Clone the repository

```bash
git clone https://github.com/its-subhas/Ping-Chat.git
```

### 2. Navigate to the frontend directory

```bash
cd "Ping Chat/Ping-Client"
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the `Ping-Client` directory:

```env
VITE_BACKEND_URL=http://localhost:7000
```

For production, use your deployed backend URL.

### 5. Start the development server

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

### 6. Build for production

```bash
npm run build
```

### 7. Preview the production build

```bash
npm run preview
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_BACKEND_URL` | Backend URL used for Socket.IO connections |

**Important:**
- Vite exposes variables prefixed with `VITE_` to the browser.
- Never put private API secrets, JWT secrets, or database credentials in frontend environment variables.
- Axios HTTP requests use the `/api` path. The production deployment uses a Vercel rewrite to forward these requests to the backend.
- For local development, configure an API proxy if required to forward `/api` requests to your local backend.

## Backend Communication

The frontend communicates with the backend using:

- **Axios:** REST API requests
- **Socket.IO Client:** Online presence, messages, typing indicators, and call signaling
- **WebRTC:** Peer-to-peer audio/video communication

The Axios client uses credentials to support HTTP-only authentication cookies.

## Deployment

The frontend is deployed on Vercel.

1. Import the GitHub repository into Vercel.
2. Set the root directory to `Ping Chat/Ping-Client`.
3. Configure `VITE_BACKEND_URL` with your deployed backend URL.
4. Use `npm run build` as the build command.
5. Deploy the project.

Ensure the production API rewrite points to the correct backend URL and that the backend CORS configuration allows your deployed frontend origin.

## Related Links

- **Live Application:** https://ping-chat-omega.vercel.app
- **GitHub Repository:** https://github.com/its-subhas/Ping-Chat
- **Backend README:** [Ping-Server](../Ping-Server/README.md)
- **Root README:** [Ping Chat](../../README.md)
