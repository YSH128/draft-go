import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background-dark text-slate-100">
      <Header />
      <main className="relative mx-auto max-w-[1440px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
