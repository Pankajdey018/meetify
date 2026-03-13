import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Authentication from "./pages/Authentication.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import VideoMeetComponent from "./pages/VideoMeet.jsx";
import HomeComponent from "./pages/home.jsx";
import History from "./pages/history.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path='/meet/:meetingCode' element={<VideoMeetComponent />} />
          <Route path='/home' element={<HomeComponent />} />
          <Route path='/history' element={<History />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;