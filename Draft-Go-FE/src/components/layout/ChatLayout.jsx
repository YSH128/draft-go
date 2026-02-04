import { Outlet } from "react-router-dom";

/**
 * 채팅 페이지 전용 레이아웃
 * 헤더와 푸터 없이 전체 화면을 사용
 * 로비, 드래프트, 결과 페이지에서 사용
 */
export default function ChatLayout() {
  return (
    <div className="h-screen bg-background-dark text-slate-100">
      <Outlet />
    </div>
  );
}
