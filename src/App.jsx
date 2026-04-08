import { Route, Routes } from "react-router-dom";

import Home from "./pages/home/Home";

import Login from "./pages/auth/Login/Login";
import SystemLogin from "./pages/auth/Login/SystemLogin";
import Signup from "./pages/auth/Signup/Signup";
import Find from "./pages/auth/Find/Find";

import Community from "./pages/community/Community";

import MyPage from "./pages/mypage/MyPage";

import MapPage from "./pages/map/MapPage";

function App() {
  return (
    <Routes>
      {/* 로그인 관련 */}
      <Route path="/" element={<Login />} />
      <Route path="/oauth/*" element={<Login />} />{" "}
      <Route path="/login" element={<SystemLogin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/find" element={<Find />} />
      {/* 홈 관련 */}
      <Route path="/home" element={<Home />} />
      {/* 커뮤니티 관련 */}
      <Route path="/community" element={<Community />} />
      {/* 마이페이지 관련 */}
      <Route path="/mypage" element={<MyPage />} />
      {/* 지도 관련 */}
      <Route path="/map" element={<MapPage />} />
    </Routes>
  );
}

export default App;
