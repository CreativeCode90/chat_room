import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io.connect("https://chatter-server-xpoi.onrender.com");

export default function Home() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [newroomList, setRoomList] = useState([]);
  const [roomCodeInput, setRoomCodeInput] = useState(""); // ✅ Input state

  const generateRandomRoomId = () => {
    return Math.random().toString(36).substring(2, 50).toUpperCase();
  };

  const roomId = generateRandomRoomId();

  const JoinNewMetting = () => {
    const CreateNewMetting = {
      creater: username,
      roomid: roomId,
      createdAt: new Date().toLocaleTimeString(),
    };
    socket.emit("join_new_room", { CreateNewMetting });
    navigate(`/chatroom/${username}/${roomId}`);
  };

  const JoinRoomByCode = () => {
    if (!roomCodeInput) return;

    const CurrentJoinUser = {
      joinUser: username,
      joinRoomId: roomCodeInput,
    };

    socket.emit("Join_room", { CurrentJoinUser });
    navigate(`/chatroom/${username}/${roomCodeInput}`);
  };

  useEffect(() => {
    if (username) {
      socket.emit("user_login", { username });
    }

    socket.on("room_list", (roomList) => {
      if (Array.isArray(roomList)) {
        setRoomList(roomList);
      }
    });

    return () => {
      socket.off("room_list");
    };
  }, [username]);

  const JoinRoom = (data) => {
    const _roomId = data.roomId;
    const CurrentJoinUser = {
      joinUser: username,
      joinRoomId: _roomId,
    };
    socket.emit("Join_room", { CurrentJoinUser });
    navigate(`/chatroom/${username}/${_roomId}`);
  };

  return (
    <div className="home">
      <h2>Welcome, {username}!</h2>
      <div className="action">
        <div className="col">
          <h3>Create New Room</h3>
          <div className="row">
            <button onClick={JoinNewMetting}>Create & Join</button>
          </div>
        </div>

        <div className="col">
          <h3>Join Existing Room</h3>
          <div className="row">
            <input
              placeholder="Enter Room Code..."
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value)}
            />
            <button onClick={JoinRoomByCode}>Join</button>
          </div>
        </div>

        {/* <div className="available-rooms">
          <h4>Available Rooms:</h4>
          <ul>
            {newroomList.map((room, i) => (
              <li key={i}>
                Creator: {room.creater} | Room ID: {room.roomId}{" "}
                <button onClick={() => JoinRoom(room)}>Join</button>
              </li>
            ))}
          </ul>
        </div> */}
      </div>
    </div>
  );
}
