import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
app.use(cors());
const server = http.createServer(app);

const activeUsers = {}; // Stores information about currently connected users
const activeRooms = {}; // Stores information about active chat rooms

const io = new Server(server, {
  cors: {
    origin: "https://chatterroom.onrender.com",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // console.log("User connected:", socket.id);

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
    const roomId = newRoomData.CreateNewMetting.roomid;

    if (!activeRooms[roomId]) {
      activeRooms[roomId] = {
        roomId,
        creater: newRoomData.CreateNewMetting.creater,
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

    const participants = activeRooms[roomId].participates;

    if (!participants.includes(username)) {
      participants.push(username);
    }

    socket.join(roomId);

    io.to(roomId).emit("joined_room_participates_update", {
      roomId: roomId,
      participate: participants,
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
});

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("✅ Created uploads directory");
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

app.use("/uploads", express.static("uploads")); // serve uploaded files

// Upload route
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `http://localhost:3001/uploads/${req.file.filename}`;
  res.json({ fileUrl });
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
