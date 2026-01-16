import { Routes, Route } from "react-router-dom";
import { MainLayout } from "../components/layout";
import HomePage from "../pages/Home";
import LoginPage from "../pages/Login";
import MyPage from "../pages/My";
import { ROUTES } from "../constants/routes";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.MY} element={<MyPage />} />
      </Route>
    </Routes>
  );
}
