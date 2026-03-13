import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  Card,
  Box,
  CardContent,
  Button,
  Typography,
  IconButton,
  Stack,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VideoCallIcon from "@mui/icons-material/VideoCall";

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);

  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const copyMeetingLink = (code) => {
    const link = `${window.location.origin}/meet/${code}`;
    navigator.clipboard.writeText(link);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px",
      }}
    >
      {/* HEADER */}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" fontWeight={600}>
          Meeting History
        </Typography>

        <IconButton onClick={() => routeTo("/home")}>
          <HomeIcon />
        </IconButton>
      </Stack>

      {/* MEETINGS */}

      {meetings.length === 0 ? (
        <Typography>No meeting history found</Typography>
      ) : (
        meetings.map((e, i) => (
          <Card
            key={i}
            sx={{
              mb: 3,
              borderRadius: "14px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ md: "center" }}
                spacing={2}
              >
                {/* INFO */}

                <Box>
                  <Typography variant="h6">
                    Meeting Code: {e.meetingCode}
                  </Typography>

                  <Typography color="text.secondary">
                    Date: {formatDate(e.createdAt)}
                  </Typography>
                </Box>

                {/* ACTIONS */}

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<VideoCallIcon />}
                    onClick={() => routeTo(`/meet/${e.meetingCode}`)}
                  >
                    Rejoin
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => copyMeetingLink(e.meetingCode)}
                  >
                    Copy Link
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}