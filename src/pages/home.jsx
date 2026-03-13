import React, { useContext, useState } from "react";
import { Button, IconButton, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import api from "../services/api";
import "../styles/home.css";

function HomeComponent() {

  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [meetingCode, setMeetingCode] = useState("");

  /* ================= START MEETING ================= */

  const startMeeting = async () => {
    try {

      const res = await api.post("/create-meeting");

      navigate(`/meet/${res.data.meetingCode}`);

    } catch (err) {
      console.log(err);
    }
  };

  /* ================= JOIN MEETING ================= */

  const handleJoinVideoCall = () => {
    if (!meetingCode.trim()) return;

    navigate(`/meet/${meetingCode}`);
  };

  return (
    <div className="homeContainer">

      {/* ================= NAVBAR ================= */}

      <div className="navBar">

        <h2 className="logo">Meetify</h2>

        <div className="navActions">

          <IconButton
            onClick={() => navigate("/history")}
          >
            <RestoreIcon />
          </IconButton>

          <Button
            variant="outlined"
            onClick={logout}
          >
            Logout
          </Button>

        </div>

      </div>

      {/* ================= HERO SECTION ================= */}

      <div className="heroSection">

        <div className="leftPanel">

          <h1>
            Simple, reliable video calls
            <br />
            <span>for everyone</span>
          </h1>

          <p>
            Start or join a secure meeting instantly.
          </p>

          {/* START MEETING BUTTON */}

          <Button
            variant="contained"
            size="large"
            startIcon={<VideoCallIcon />}
            onClick={startMeeting}
            className="startButton"
          >
            Start New Meeting
          </Button>

          {/* JOIN MEETING */}

          <div className="joinSection">

            <TextField
              placeholder="Enter meeting code"
              variant="outlined"
              size="small"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
            />

            <Button
              variant="outlined"
              onClick={handleJoinVideoCall}
            >
              Join
            </Button>

          </div>

        </div>

        {/* RIGHT ILLUSTRATION */}

        <div className="rightPanel">
          <img
            src="/logo3.png"
            alt="Video meeting"
          />
        </div>

      </div>

    </div>
  );
}

export default HomeComponent;

