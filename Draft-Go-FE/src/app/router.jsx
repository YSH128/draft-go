import { Routes, Route } from "react-router-dom";
import { MainLayout } from "../components/layout";
import HomePage from "../pages/Home";
import LoginPage from "../pages/Login";
import SignupPage from "../pages/Signup";
import MyPage from "../pages/My";
import { ROUTES } from "../constants/routes";
import Index from "../pages/DesignSystemPreview/index.jsx";
import DraftLobby from "../pages/DraftLobby/index.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
        <Route path={ROUTES.MY} element={<MyPage />} />
        <Route path={ROUTES.DESIGN_PREVIEW} element={<Index />} />
        <Route path={ROUTES.DRAFT_LOBBY} element={<DraftLobby />} />
      </Route>
    </Routes>
  );
}
