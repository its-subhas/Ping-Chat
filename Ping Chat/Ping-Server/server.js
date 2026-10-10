import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Create Express App and HTTP Server
const app = express();
const server = http.createServer(app);

// Initialize socket.io server

export const io = new Server(server, {
  cors: { origin: "*" },
});

// Store online users

export const userSocketMap = {}; // userId and SocketId

// Socket.io connection handaler

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  console.log("User Connected: ", userId);

  if (userId) userSocketMap[userId] = socket.id;

  // Emit online users to all connected clients

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected: ", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware setup
app.use(express.static("public"));
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// Routes setup
app.get("/", (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Ping Server</title>
        <link rel="icon" type="image/svg+xml" href="/ping.svg" />
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            min-height: 100vh;
            min-height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: #0f0f17;
            color: #fff;
            font-family: Arial, sans-serif;
            overflow: hidden;
          }

          .status {
            width: min(100%, 650px);
            text-align: center;
            padding: clamp(24px, 6vw, 50px);
          }

          h1 {
            font-size: clamp(28px, 7vw, 48px);
            line-height: 1.1;
            margin-bottom: 14px;
            white-space: nowrap;
          }

          .description {
            color: #a1a1aa;
            font-size: clamp(13px, 3vw, 18px);
            white-space: nowrap;
          }

          .online {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            margin-top: 24px;
            color: #22c55e;
            font-size: clamp(14px, 3.5vw, 18px);
            font-weight: 600;
            white-space: nowrap;
          }

          .dot {
            flex-shrink: 0;
            width: clamp(9px, 2vw, 13px);
            height: clamp(9px, 2vw, 13px);
            border-radius: 50%;
            background: #22c55e;
            box-shadow: 0 0 14px #22c55e;
          }

          @media (max-width: 380px) {
            body {
              padding: 12px;
            }

            .status {
              padding: 20px 8px;
            }

            h1 {
              font-size: 25px;
            }

            .description {
              font-size: 11px;
            }

            .online {
              font-size: 13px;
              margin-top: 20px;
            }
          }
        </style>
      </head>

      <body>
        <main class="status">
          <h1>Ping Server</h1>
          <p class="description">Backend APIs are running successfully !</p>

          <div class="online">
            <span class="dot"></span>
            <span>Server is Live</span>
          </div>
        </main>
      </body>
    </html>
  `);
});

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    message: "Ping Server is running!",
  });
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to MongoDB
await connectDB();

// Running Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
