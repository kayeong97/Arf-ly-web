import { Route, Routes } from "react-router-dom";

import Home from "./pages/home/Home";
import WeeklyActive from "./pages/home/WeeklyActive";
import WalkedResult from "./pages/home/WalkedResult";
import Camera from "./pages/home/Camera.jsx";
import DiseaseCheck from "./pages/home/DiseaseCheck.jsx";

import Login from "./pages/auth/Login/Login";
import SystemLogin from "./pages/auth/Login/SystemLogin";
import Signup from "./pages/auth/Signup/Signup";
import Find from "./pages/auth/Find/Find";

import Community from "./pages/community/Community";
import CommunityWrite from "./pages/community/CommunityWrite";
import CommunitySearch from "./pages/community/CommunitySearch";
import CommunityDetail from "./pages/community/CommunityDetail";
import CommunityEdit from "./pages/community/CommunityEdit";

import MyPage from "./pages/mypage/MyPage";
import IoTRegister from "./pages/mypage/IotRegisteration/IoTRegister.jsx";
import PetDetail from "./pages/mypage/PetDetail.jsx";
import UserProfile from "./pages/mypage/UserProfile.jsx";

import MapPage from "./pages/map/MapPage";
import PetRegister from "./pages/pet/PetRegister";

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
      {/* 주간 활동 리포트 관련 */}
      <Route path="/weeklyactive/:petId" element={<WeeklyActive />} />
      <Route path="/walkedresult" element={<WalkedResult />} />
      {/* 카메라 관련 */}
      <Route path="/camera" element={<Camera />} />
      <Route path="/diseasecheck" element={<DiseaseCheck />} />
      {/* 커뮤니티 관련 */}
      <Route path="/community" element={<Community />} />
      <Route path="/community/write" element={<CommunityWrite />} />
      <Route path="/community/search" element={<CommunitySearch />} />
      <Route path="/community/:postId" element={<CommunityDetail />} />
      <Route path="/community/:postId/edit" element={<CommunityEdit />} />
      {/* 마이페이지 관련 */}
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/pet/register" element={<PetRegister />} />
      <Route path="/iotregister" element={<IoTRegister />} />
      <Route path="/petdetail" element={<PetDetail />} />
      <Route path="/userprofile" element={<UserProfile />} />
      {/* 지도 관련 */}
      <Route path="/map" element={<MapPage />} />
    </Routes>
  );
}

export default App;
