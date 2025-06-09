import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function Login() {
  const naivgate = useNavigate();
  const [name, setName] = useState("");
  const HandleLogin = () => {
    if (name.trim() != "") {
      setName("");
      naivgate(`/Home/${name}`);
    }else{
        alert("Enter your user name")
    }
  };
  return (
    <div className="home">
      <h2>Login Room</h2>
      <div className="login">
        <input
          placeholder="Enter your Name ..."
          className="commoninput"
          onChange={(e) => setName(e.target.value)}
        />
        <button id="join" onClick={HandleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}
