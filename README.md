# Ping Chat 💬

### Real-Time Messaging. Seamless Connections. Smarter Conversations.

**Ping Chat** is a modern, full-stack real-time messaging application designed to make communication simple, fast, and engaging. It brings together private messaging, group conversations, media sharing, AI-powered assistance, and calling features in one intuitive platform.

Built with the MERN stack and modern web technologies, Ping focuses on real-time communication, secure authentication, responsive design, and a smooth user experience.

<p align="center">
  <a href="https://ping-chat-omega.vercel.app"><strong>🚀 Live Demo</strong></a>
  &nbsp; · &nbsp;
  <a href="https://github.com/its-subhas/Ping-Chat"><strong>📂 Source Code</strong></a>
</p>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Application Architecture](#-application-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Authentication and Security](#-authentication-and-security)
- [Real-Time Communication](#-real-time-communication)
- [AI Integration](#-ai-integration)
- [API Structure](#-api-structure)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🌟 Overview

Ping Chat is designed to provide users with a seamless communication experience through real-time messaging and interactive features.

Whether users want to communicate privately, participate in group conversations, share images, or interact with AI-powered features, Ping brings these capabilities together in a single application.

The project follows a client-server architecture, separating the React frontend from the Node.js and Express backend.

**Project Highlights:**

- Full-stack web application.
- Real-time communication using Socket.IO.
- Secure authentication with JWT and session management.
- Google OAuth authentication.
- Private and group messaging.
- Image sharing with Cloudinary.
- Gemini AI integration.
- Online user status and typing indicators.
- Audio and video calling interface.
- Responsive and modern user interface.

---

## ✨ Features

### 🔐 Authentication & Account Management

- User registration and login.
- Google Sign-In and Sign-Up using OAuth 2.0.
- JWT-based authentication.
- Short-lived access tokens.
- Refresh token rotation.
- Server-side session management.
- Secure HTTP-only authentication cookies.
- Protected API routes.
- Logout and session revocation.
- User profile management.
- Profile picture uploads.
- Customizable user bio.

### 💬 Real-Time Messaging

- Instant one-to-one messaging.
- Real-time message delivery using Socket.IO.
- Send and receive messages without refreshing the page.
- Image sharing.
- Message timestamps.
- Message deletion.
- Unread message counts.
- Per-user unseen message tracking.
- Persistent message history.
- Automatic message updates.

### 👥 Group Conversations

- Create group conversations.
- Group messaging.
- Group information interface.
- Group member management interface.
- Dedicated group conversation experience.

### 🟢 Online Status & Typing Indicators

- Real-time online user tracking.
- Online and offline status.
- Typing indicators.
- Instant status updates through Socket.IO.
- Live communication events.

### 🤖 AI-Powered Features

- Gemini AI integration.
- AI-powered assistant chat.
- AI auto-reply functionality.
- Intelligent conversational responses.
- Dedicated AI chat experience.

### 📞 Audio & Video Calling

- Audio calling interface.
- Video calling interface.
- Incoming call handling.
- Call controls.
- Mute and unmute controls.
- Video on/off controls.
- Speaker controls.
- Call termination interface.

*The actual calling experience depends on the completed signaling and media implementation.*

### 👤 User Profiles

- View user profiles.
- Update personal information.
- Change profile pictures.
- Update bio information.
- Profile information management.

### 🎨 User Interface & Experience

- Modern and clean interface.
- Responsive layouts.
- Mobile-friendly design.
- Smooth navigation.
- Emoji picker integration.
- Interactive chat interface.
- Toast notifications.
- Loading states.
- User and group information panels.

---

## 🛠️ Technology Stack

Ping Chat uses modern technologies across the frontend and backend.

### Frontend

| Technology | Purpose |
|---|---|
| React.js | Component-based UI development |
| Vite | Frontend build tool |
| Tailwind CSS | Styling and responsive design |
| Redux Toolkit | Global state management |
| React Router DOM | Client-side routing |
| Axios | HTTP requests |
| Socket.IO Client | Real-time communication |
| Emoji Picker React | Emoji selection |
| React Hot Toast | Notifications |
| Google Outfit | Typography |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| MongoDB | Database |
| Mongoose | Database modeling |
| Socket.IO | Real-time server communication |
| JSON Web Token | Authentication |
| bcrypt | Password hashing |
| Cookie Parser | Cookie handling |
| CORS | Cross-origin resource sharing |
| Cloudinary | Image storage |
| Google OAuth 2.0 | Google authentication |
| Google Gemini | AI integration |

### Deployment & Development

| Technology | Purpose |
|---|---|
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Git | Version control |
| GitHub | Source code hosting |
| Nodemon | Backend development |

---

## 🏗️ Application Architecture

Ping Chat follows a client-server architecture.

```text
                 ┌─────────────────────┐
                 │      User           │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   React Frontend    │
                 │   Vite + Tailwind   │
                 │   Redux Toolkit     │
                 └──────────┬──────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
        ┌───────────────┐       ┌────────────────┐
        │ REST API      │       │ Socket.IO      │
        │ Axios         │       │ Real-Time      │
        └───────┬───────┘       └───────┬────────┘
                │                       │
                └───────────┬───────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  Express Backend    │
                 │  Node.js            │
                 └──────────┬──────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
         ┌─────────┐  ┌───────────┐  ┌───────────┐
         │ MongoDB │  │Cloudinary │  │ Gemini AI │
         └─────────┘  └───────────┘  └───────────┘
```

### How It Works

1. Users interact with the React frontend.
2. Axios communicates with the Express REST API.
3. The backend validates requests and handles authentication.
4. MongoDB stores user, session, and messaging data.
5. Socket.IO handles real-time events and communication.
6. Cloudinary manages uploaded profile pictures and media.
7. Gemini AI powers the AI-related functionality.

---

## 📁 Project Structure

```text
Ping-Chat/
│
├── Ping Chat/
│   │
│   ├── Ping-Client/
│   │   ├── public/
│   │   │
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── redux/
│   │   │   ├── lib/
│   │   │   ├── App.jsx
│   │   │   └── main.jsx
│   │   │
│   │   ├── .env
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   └── Ping-Server/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── socket/
│       ├── .env
│       ├── package.json
│       └── server.js
│
└── README.md
```

*The structure above represents the main architectural organization; individual filenames may differ in the repository.*

---

## 🚀 Getting Started

Follow these instructions to run Ping Chat locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Git](https://git-scm.com/)

You will also need accounts or API credentials for Cloudinary and Google OAuth. Gemini credentials are required if you want to use the AI features.

### 1. Clone the Repository

```bash
git clone https://github.com/its-subhas/Ping-Chat.git
```

```bash
cd Ping-Chat
```

### 2. Navigate to the Project

```bash
cd "Ping Chat"
```

### 3. Setup the Backend

```bash
cd Ping-Server
npm install
```

Create a `.env` file in the backend directory and configure the required environment variables.

### 4. Setup the Frontend

Open another terminal:

```bash
cd "Ping-Chat/Ping Chat/Ping-Client"
npm install
```

Create a `.env` file in the frontend directory.

### 5. Start the Backend

From the `Ping-Server` directory:

```bash
npm run server
```

Use the development script defined in your backend `package.json` if its name differs.

### 6. Start the Frontend

From the `Ping-Client` directory:

```bash
npm run dev
```

### 7. Open the Application

```text
http://localhost:5173
```

The frontend and backend should now be running.

---

## 🔑 Environment Variables

Ping Chat uses environment variables to configure its frontend, backend, database, authentication, and third-party integrations.

### Frontend Configuration

Create `.env` inside `Ping-Client`:

```env
VITE_BACKEND_URL=http://localhost:7000
```

For production, set this to your deployed backend URL.

### Backend Configuration

Create `.env` inside `Ping-Server`:

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

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_google_redirect_uri

GEMINI_API_KEY=your_gemini_api_key
```

**Important:**

- These are configuration examples. Match the variable names with the actual names referenced in your backend source code.
- Never expose backend secrets in frontend environment variables.
- Never commit `.env` files to GitHub.
- Generate strong, unique JWT secrets.
- Configure the Google OAuth authorized redirect URI to match your backend callback route.
- Configure production cookie settings appropriately for cross-origin HTTPS deployments.

---

## 🔒 Authentication and Security

Security is an important part of Ping Chat.

### JWT Authentication

The application uses two types of JWT tokens:

| Token | Purpose |
|---|---|
| Access Token | Authorizes protected requests |
| Refresh Token | Obtains a new access token |

### Session Management

- Access tokens have a short lifetime.
- Refresh tokens have a longer lifetime.
- Refresh tokens are associated with server-side sessions.
- Refresh token rotation helps prevent reuse of old refresh tokens.
- Sessions can be revoked during logout.
- Expired and revoked sessions are rejected.

### Cookie Security

Authentication cookies use security-related settings such as:

- HTTP-only cookies.
- Secure cookies in production.
- Appropriate SameSite configuration.
- Cookie expiration.
- Restricted access through server-side validation.

### Password Security

- Password validation.
- Password hashing.
- Protected authentication routes.
- Server-side input validation.

---

## ⚡ Real-Time Communication

Ping Chat uses Socket.IO to provide real-time communication between connected users.

The socket connection supports events such as:

| Event | Description |
|---|---|
| `getOnlineUsers` | Updates online user information |
| `userTyping` | Notifies the recipient that a user is typing |
| `userStopTyping` | Notifies the recipient that typing has stopped |
| `isTyping` | Delivers typing status updates |

Real-time communication helps provide an interactive messaging experience without requiring users to refresh the application.

---

## 🤖 AI Integration

Ping Chat integrates Google Gemini to provide AI-powered functionality.

The AI experience includes:

- AI assistant conversations.
- Automated AI replies.
- Intelligent response generation.
- Dedicated AI interaction within the chat application.

The AI functionality is designed to complement regular messaging rather than interfere with private or group conversations.

---

## 🔌 API Structure

The backend exposes REST API endpoints for authentication, user management, and messaging.

### Authentication Routes

Base path: `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register a new user |
| POST | `/login` | Authenticate a user |
| POST | `/google` | Initiate Google authentication |
| GET/POST | `/google/callback` | Handle Google OAuth callback |
| PUT | `/update-profile` | Update user profile |
| GET | `/check` | Check authentication status |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Logout and revoke session |

### Messaging Routes

Base path: `/api/messages`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | Retrieve available users |
| GET | `/get/:userId` | Retrieve conversation messages |
| POST | `/send/:userId` | Send a message |
 
*The messaging endpoints are representative of the current application routes. Check the backend route definitions for the complete endpoint list and exact HTTP methods.*

---

## ☁️ Deployment

Ping Chat is deployed using separate frontend and backend hosting services.

### Frontend — Vercel

The React frontend is hosted on Vercel.

Live Application:

https://ping-chat-omega.vercel.app

Frontend environment variable:

```env
VITE_BACKEND_URL=https://your-backend-url
```

### Backend — Render

The Node.js and Express backend is hosted on Render.

Backend environment configuration should include:

- Production client URL.
- MongoDB connection string.
- JWT secrets.
- Cloudinary credentials.
- Google OAuth credentials.
- AI API credentials.
- Production environment settings.

### Production Configuration Checklist

- [ ] Frontend points to the deployed backend.
- [ ] Backend allows the production frontend origin.
- [ ] CORS credentials are enabled.
- [ ] Authentication cookies are configured for cross-origin HTTPS requests.
- [ ] Google OAuth redirect URI is correct.
- [ ] MongoDB connection is working.
- [ ] Cloudinary credentials are configured.
- [ ] All required environment variables are added.
- [ ] Sensitive credentials are excluded from Git.

---

## 📸 Screenshots

Screenshots of the application will help visitors understand the user interface and features.

Add your actual screenshots in a `screenshots` folder and update the paths below.

### Authentication

```md
![Login Page](screenshots/login.png)
```

### Main Chat Interface

```md
![Chat Interface](screenshots/chat.png)
```

### Group Conversations

```md
![Group Chat](screenshots/group-chat.png)
```

### User Profile

```md
![User Profile](screenshots/profile.png)
```

### Audio & Video Calls

```md
![Calling Interface](screenshots/calls.png)
```

### AI Assistant

```md
![AI Assistant](screenshots/ai-assistant.png)
```

---

## 🔮 Future Improvements

Potential improvements for Ping Chat include:

- End-to-end encryption.
- Message editing.
- Voice messages.
- File and document sharing.
- Message reactions.
- Message search.
- Push notifications.
- Read receipts.
- Advanced group administration.
- Improved audio and video calling.
- Screen sharing.
- Better session and device management.
- Progressive Web App support.

---

## 🤝 Contributing

Contributions, suggestions, and feedback are welcome!

If you would like to contribute:

1. Fork the repository.
2. Create a new branch.

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Commit your changes.

```bash
git commit -m "Add: your feature"
```

5. Push your branch.

```bash
git push origin feature/your-feature
```

6. Open a Pull Request.

Please ensure your changes are tested before submitting a pull request.

---

## 📄 License

No explicit open-source license has been specified here. Please check the repository's license before reusing or distributing the source code.

---

## 👨‍💻 Author

**Subhas Biswas**

Full Stack Web Developer

Passionate about building modern web applications, scalable backend systems, and interactive user experiences.

- **GitHub:** [@its-subhas](https://github.com/its-subhas)
- **LinkedIn:** [@its-subhas](https://www.linkedin.com/in/its-subhas/)
- **Portfolio:** [Visit Portfolio](https://portfolio-six-mu-ouahii5xq6.vercel.app/)

---

<p align="center">
  **Built with ❤️ by Subhas Biswas**
  
  <br/>
  
  **Ping Chat — Stay Connected. Stay in Sync.**
</p>
