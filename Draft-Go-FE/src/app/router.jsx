import { Routes, Route } from "react-router-dom";
import { MainLayout } from "../components/layout";
import HomePage from "../pages/Home";
import LoginPage from "../pages/Login";
import SignupPage from "../pages/Signup";
import ProfilePage from "../pages/Profile";
import ResultPage from "../pages/DraftResult";
import DraftPage from "../pages/Draft";
import { ROUTES } from "../constants/routes";
import Index from "../pages/DesignSystemPreview/index.jsx";
import DraftLobby from "../pages/DraftLobby/index.jsx";

export default function AppRouter() {
  return (
    <Routes>
      {/* MainLayout 사용 페이지 */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.RESULT} element={<ResultPage />} />
        <Route path={ROUTES.DESIGN_PREVIEW} element={<Index />} />
        <Route path={ROUTES.DRAFT_LOBBY} element={<DraftLobby />} />
        <Route path={ROUTES.DRAFT_ROOM} element={<DraftLobby />} />
      </Route>

      {/* 자체 레이아웃 사용 페이지 */}
      <Route path={ROUTES.DRAFT} element={<DraftPage />} />
    </Routes>
  );
}
