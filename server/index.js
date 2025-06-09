import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: [
    "https://chatterclientapp.onrender.com",
    "http://localhost:5173"
  ]
}));

// Serve static files from the Vite React build
app.use(express.static(path.join(__dirname, "../chater_client/dist")));

// Handle client-side routing (React Router)
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../chater_client/dist", "index.html"));
});

// Create a new socket.io server
const io = new Server(server, {
  cors: {
    origin: [
      "https://chatterclientapp.onrender.com",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"],
  },
});

// In-memory storage
const activeUsers = {};
const activeRooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user_login", (userData) => {
    console.log("User logged in:", userData.username);
    activeUsers[socket.id] = {
      username: userData.username,
      userId: socket.id,
      loggedInAt: new Date(),
    };
    socket.emit("room_list", Object.values(activeRooms));
  });

  socket.on("join_new_room", (newRoomData) => {
    const roomId = newRoomData.CreateNewMeeting.roomid;  // fixed typo here
    const creater = newRoomData.CreateNewMeeting.creater;

    if (!activeRooms[roomId]) {
      activeRooms[roomId] = {
        roomId,
        creater,
        participates: [],
        createdAt: new Date(),
      };
      io.emit("room_list", Object.values(activeRooms));
    }
  });

  socket.on("Join_room", (joinData) => {
    const roomId = joinData.CurrentJoinUser.joinRoomId;
    const username = joinData.CurrentJoinUser.joinUser;

    if (!activeRooms[roomId]) return;

    const participates = activeRooms[roomId].participates;
    if (!participates.includes(username)) {
      participates.push(username);
    }

    socket.join(roomId);

    io.to(roomId).emit("joined_room_participates_update", {
      roomId,
      participates,
    });
  });

  socket.on("send_message", (data) => {
    const roomId = data.roomId;
    if (roomId) {
      io.to(roomId).emit("get_msg", data.MessageSender);
    } else {
      io.emit("get_msg", data.MessageSender);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete activeUsers[socket.id];
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
