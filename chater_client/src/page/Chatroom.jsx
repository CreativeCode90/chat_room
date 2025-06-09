import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "./Chatroom.css";
import { io } from "socket.io-client";

// const socket = io.connect("http://localhost:3001");
const socket = io.connect("https://chat-room-nj2t.onrender.com");
// coding 
export default function Chatroom() {
  const { username, roomId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null); // 👈 scroll reference
  const [copybar, setCopybar] = useState(false);
  const inputRef = useRef(null);

  const getNeonColor = (name) => {
    const neonColors = [
      "#39ff14",
      "#f0f",
      "#0ff",
      "#ff3131",
      "#fcf803",
      "#FF00FF",
      "#00FFFF",
      "#FF1493",
      "#7CFC00",
      "#FF4500",
      "#00FF7F",
      "#7FFF00",
      "#FF69B4",
      "#DA70D6",
      "#00CED1",
      "#FFFF00",
      "#ADFF2F",
      "#FF8C00",
      "#00FA9A",
      "#BA55D3",
      "#40E0D0",
      "#FFD700",
      "#00BFFF",
      "#F08080",
      "#FF6347",
      "#C71585",
      "#8A2BE2",
      "#20B2AA",
      "#FF7F50",
      "#F0E68C",
      "#B0E0E6",
      "#E6E6FA",
      "#FFE4E1",
      "#98FB98",
      "#AFEEEE",
      "#87CEEB",
      "#FFB6C1",
      "#FFA07A",
      "#E0FFFF",
      "#DDA0DD",
      "#66CDAA",
      "#BDB76B",
      "#9932CC",
      "#FFDEAD",
      "#F5DEB3",
      "#F5F5DC",
      "#FFFACD",
      "#FFC0CB",
      "#ADD8E6",
      "#90EE90",
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return neonColors[Math.abs(hash) % neonColors.length];
  };

  useEffect(() => {
    const CurrentJoinUser = {
      joinUser: username,
      joinRoomId: roomId,
    };
    socket.emit("Join_room", { CurrentJoinUser });
  }, [username, roomId]);

  useEffect(() => {
    socket.on("joined_room_participates_update", (data) => {
      if (data.roomId === roomId) {
        setParticipants(data.participate);
      }
    });

    socket.on("get_msg", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("joined_room_participates_update");
      socket.off("get_msg");
    };
  }, [roomId]);

  // 👇 Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const Sendmessage = () => {
    const MessageSender = {
      sender: username,
      text: message,
      sendAt: new Date().toLocaleTimeString(),
    };
    socket.emit("send_message", { MessageSender, roomId });
    setMessage("");
    inputRef.current?.focus(); // 👈 Focus input again
  };
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("https://chat-room-nj2t.onrender.com/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    // Send the file URL via socket
    const message = {
      sender: username,
      text: data.fileUrl, // URL of uploaded file
      type: file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : "audio",
      sendAt: new Date().toLocaleTimeString(),
    };

    socket.emit("send_message", { MessageSender: message, roomId });
  };

  return (
    <div className="chatroom">
      <div className="wrapper">
        <div className="actionbar">
          <div className="userbarlist">
            <div className="root_user">
              <p className="User_title">
                you <b className="root_user_titlebatch">{username}</b>
              </p>
            </div>
            <p className="optbatch">Other Participates</p>
            <ul className="t_list">
              {participants
                .filter((user) => user !== username)
                .map((user, index) => (
                  <li key={index}>
                    <p className="User_title">other</p>
                    <b
                      className="other_user_name"
                      style={{
                        color: getNeonColor(user),
                        textShadow: `0 0 0px ${getNeonColor(
                          user
                        )}, 0 0 0px ${getNeonColor(user)}`,
                      }}
                    >
                      {user}
                    </b>
                  </li>
                ))}
            </ul>
          </div>
          <div className="chatbook">
            <div className="chatwrapper">
              {messages.map((msg, idx) => (
                <div className="chat" key={idx}>
                  <div className="chatbyuser">
                    <p>{msg.sender === username ? "you" : "other"}</p>
                    <b
                      className="chatbyusername"
                      style={{
                        color: getNeonColor(msg.sender),
                        textShadow: `0 0 0px ${getNeonColor(
                          msg.sender
                        )}, 0 0 0px ${getNeonColor(msg.sender)}`,
                      }}
                    >
                      {msg.sender}
                    </b>
                  </div>
                  <div className="chattext">
                    {msg.type === "image" ? (
                      <img src={msg.text} alt="shared" width="200" />
                    ) : msg.type === "video" ? (
                      <video src={msg.text} controls width="250" />
                    ) : msg.type === "audio" ? (
                      <audio src={msg.text} controls />
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} /> {/* 👈 Auto-scroll target */}
            </div>
          </div>
        </div>

        <div className="chatbot">
          <button
            className="chatbutton"
            id="optionbar"
            onClick={() => setCopybar(!copybar)}
          >
            RoomCode
          </button>
          <div
            className={copybar ? "roomcodecontainer" : "roomcodecontainerclose"}
          >
            <p>Copy Room Code.</p>
            <p className="coid">{roomId}</p>
            <button
              className="chatbutton"
              onClick={() => {
                navigator.clipboard.writeText(roomId);
                setCopybar(!copybar);
              }}
            >
              Copy Code
            </button>
          </div>
          <button className="chatbutton">^</button>
          <div className="abar">
            <label htmlFor="uplodeimage">
              <img src="/icon/image-gallery.png" />
              <input
                type="file"
                id="uplodeimage"
                name="uplodeimage"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
            </label>
            <label htmlFor="uplodeivideo">
              <img src="/icon/video.png" />
              <input
                type="file"
                id="uplodeivideo"
                name="uplodeivideo"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
            </label>
            <label htmlFor="uplodeaudio">
              <img src="/icon/equalizer.png" />
              <input
                type="file"
                id="uplodeaudio"
                name="uplodeaudio"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
            </label>
          </div>
          <input
            placeholder="Enter Your Message ..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            id="messenger"
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && message.trim() !== "") {
                Sendmessage();
              }
            }}
          />
          <button className="chatbutton" onClick={Sendmessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
