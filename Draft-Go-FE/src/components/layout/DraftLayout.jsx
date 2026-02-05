import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { Icon } from "../ui";

/**
 * Draft 전용 레이아웃
 * - 전체 화면 사용 (h-screen)
 * - 최소 너비 설정으로 작은 화면에서 가로 스크롤 허용
 * - 메인 + 푸터 구조 (헤더는 ChatLayout에서 제거됨)
 */
export default function DraftLayout({ children }) {
  return (
    <div className="flex h-screen flex-col bg-background-dark font-display text-white">
      <main className="flex min-h-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
