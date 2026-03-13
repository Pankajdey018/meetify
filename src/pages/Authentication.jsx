import * as React from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Box,
  Typography,
  Snackbar,
  Paper,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";

const theme = createTheme({
  palette: {
    background: {
      default: "#f5f7fb",
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
  },
});

export default function Authentication() {
  const [userName, setUserName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [formState, setFormState] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      if (formState === 0) {
        await handleLogin(userName, password);
      } else {
        const msg = await handleRegister(userName, password);
        setMessage(msg);
        setOpen(true);

        setFormState(0);
        setUserName("");
        setPassword("");
      }
    } catch (err) {
      setError(err || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.default",
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: "100%",
            maxWidth: 420,
            p: 4,
            borderRadius: 3,
          }}
        >
          <Box
            component="form"
            onSubmit={handleAuth}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar
              sx={{
                mb: 1,
                bgcolor: "primary.main",
                width: 48,
                height: 48,
              }}
            >
              <LockOutlinedIcon />
            </Avatar>

            <Typography variant="h5" fontWeight={600}>
              {formState === 0 ? "Welcome back" : "Create your account"}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              {formState === 0
                ? "Sign in to continue"
                : "Create an account to start meeting"}
            </Typography>

            {/* TOGGLE BUTTONS */}
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Button
                size="small"
                variant={formState === 0 ? "contained" : "outlined"}
                onClick={() => setFormState(0)}
              >
                Sign In
              </Button>

              <Button
                size="small"
                variant={formState === 1 ? "contained" : "outlined"}
                onClick={() => setFormState(1)}
              >
                Sign Up
              </Button>
            </Box>

            <Box sx={{ width: "100%" }}>
              <TextField
                fullWidth
                label="Username"
                margin="normal"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, py: 1.2 }}
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : formState === 0
                  ? "Sign In"
                  : "Create Account"}
              </Button>
            </Box>
          </Box>
        </Paper>

        <Snackbar
          open={open}
          autoHideDuration={4000}
          message={message}
          onClose={() => setOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
}