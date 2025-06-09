import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "./Chatroom.css";
import { io } from "socket.io-client";

const socket = io.connect("https://chatter-server-xpoi.onrender.com");

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
                    <p>{msg.text}</p>
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
            {/* <img src="../../public/icon/image-gallery.png" alt="add image" />
            <img src="../../public/icon/video.png" alt="add video" />
            <img src="../../public/icon/equalizer.png" alt="add audio" /> */}
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
