import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background-dark text-slate-100 flex flex-col">
      <Header />
      <main className="relative mx-auto w-full max-w-[1920px] flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
