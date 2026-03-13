import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // ✅ use centralized api

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ================= REGISTER ================= */

  const handleRegister = async (username, password) => {
    try {
      setLoading(true);

      const res = await api.post("/register", {
        userName: username,
        password,
      });

      navigate("/auth");
      return res.data.message;
    } catch (err) {
      throw err?.response?.data?.message || "Registration failed";
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGIN ================= */

  const handleLogin = async (username, password) => {
    try {
      setLoading(true);

      const res = await api.post("/login", {
        userName: username, // ✅ backend expects userName
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/home"); // home/dashboard
    } catch (err) {
      throw err?.response?.data?.message || "Login failed";
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGOUT ================= */

  const logout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    navigate("/auth");
  };

  /* ================= GET HISTORY ================= */

  const getHistoryOfUser = async () => {
    try {
      const res = await api.get("/history");

      return res.data;
    } catch (err) {
      console.error("History fetch error:", err);
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        setUserData,
        loading,
        handleRegister,
        handleLogin,
        logout,
        getHistoryOfUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
