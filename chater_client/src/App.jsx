import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./page/Home";
import Chatroom from "./page/Chatroom";
import Login from "./page/Login";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home/:username" element={<Home />} />
          <Route path="/chatroom/:username/:roomId" element={<Chatroom />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
