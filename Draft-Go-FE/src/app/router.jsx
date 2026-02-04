import { Routes, Route } from "react-router-dom";
import { MainLayout, ChatLayout } from "../components/layout";
import HomePage from "../pages/Home";
import LoginPage from "../pages/Login";
import SignupPage from "../pages/Signup";
import ProfilePage from "../pages/Profile";
import ResultPage from "../pages/DraftResult";
import DraftLobby from "../pages/DraftLobby";
import DraftPage from "../pages/Draft";
import { ROUTES } from "../constants/routes";
import Index from "../pages/DesignSystemPreview/index.jsx";

export default function AppRouter() {
  return (
    <Routes>
      {/* MainLayout 사용 페이지 (헤더 + 푸터) */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.DESIGN_PREVIEW} element={<Index />} />
      </Route>

      {/* ChatLayout 사용 페이지 (헤더/푸터 없음, 전체 화면) */}
      <Route element={<ChatLayout />}>
        <Route path={ROUTES.DRAFT_LOBBY} element={<DraftLobby />} />
        <Route path={ROUTES.DRAFT_ROOM} element={<DraftLobby />} />
        <Route path={ROUTES.RESULT} element={<ResultPage />} />
        <Route path={ROUTES.DRAFT} element={<DraftPage />} />
      </Route>
    </Routes>
  );
}
