import { Routes, Route } from "react-router-dom";
import { MainLayout } from "../components/layout";
import HomePage from "../pages/Home";
import LoginPage from "../pages/Login";
import MyPage from "../pages/My";
import DraftPage from "../pages/Draft";
import { ROUTES } from "../constants/routes";
import Index from "../pages/DesignSystemPreview/index.jsx";

export default function AppRouter() {
  return (
    <Routes>
      {/* MainLayout 사용 페이지 */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.MY} element={<MyPage />} />
        <Route path={ROUTES.DESIGN_PREVIEW} element={<Index />} />
      </Route>

      {/* 자체 레이아웃 사용 페이지 */}
      <Route path={ROUTES.DRAFT} element={<DraftPage />} />
    </Routes>
  );
}
