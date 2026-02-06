import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import { readyAllLeaders, addTestMembers } from "../../api/admin";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";

const AdminPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { toasts, showToast, removeToast } = useToast();

    const [draftId, setDraftId] = useState("");
    const [testUserCount, setTestUserCount] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    // admin이 아니면 접근 제한
    if (!user || user.role !== "ADMIN") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)]">
                <div className="rounded-lg bg-[var(--color-card-bg)] p-8 text-center shadow-lg">
                    <h1 className="mb-4 text-2xl font-bold text-red-500">접근 권한 없음</h1>
                    <p className="mb-6 text-gray-300">관리자만 접근할 수 있는 페이지입니다.</p>
                    <button
                        onClick={() => navigate("/")}
                        className="rounded bg-[var(--color-primary)] px-6 py-2 font-bold text-black transition-all hover:bg-[var(--color-hextech-gold-dark)]"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    // 팀장 준비 완료 처리
    const handleReadyAllLeaders = async () => {
        if (!draftId) {
            showToast("드래프트 ID를 입력해주세요.", "error");
            return;
        }

        setIsLoading(true);
        try {
            const response = await readyAllLeaders(draftId);
            showToast(response.message || "팀장 준비 완료 처리 성공!", "success");
        } catch (error) {
            console.error("팀장 준비 완료 실패:", error);
            showToast(
                error.response?.data?.message || "팀장 준비 완료 처리에 실패했습니다.",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    // 테스트 유저 추가
    const handleAddTestMembers = async () => {
        if (!draftId) {
            showToast("드래프트 ID를 입력해주세요.", "error");
            return;
        }

        if (testUserCount < 1 || testUserCount > 30) {
            showToast("테스트 유저 수는 1~30명 사이여야 합니다.", "error");
            return;
        }

        setIsLoading(true);
        try {
            const response = await addTestMembers(draftId, testUserCount);
            showToast(response.message || "테스트 유저 추가 성공!", "success");
        } catch (error) {
            console.error("테스트 유저 추가 실패:", error);
            showToast(
                error.response?.data?.message || "테스트 유저 추가에 실패했습니다.",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] p-8">
            <div className="mx-auto max-w-4xl">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-[var(--color-primary)]">관리자 페이지</h1>
                    <p className="text-gray-400">드래프트 관리 기능을 사용할 수 있습니다.</p>
                </div>

                {/* 드래프트 ID 입력 */}
                <div className="mb-8 rounded-lg bg-[var(--color-card-bg)] p-6 shadow-lg">
                    <label className="mb-2 block text-sm font-bold text-gray-300">드래프트 ID</label>
                    <input
                        type="number"
                        value={draftId}
                        onChange={(e) => setDraftId(e.target.value)}
                        placeholder="드래프트 ID를 입력하세요"
                        className="w-full rounded border border-gray-600 bg-[var(--color-bg-primary)] px-4 py-3 text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:outline-none"
                    />
                </div>

                {/* 기능 카드 */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* 팀장 준비 완료 */}
                    <div className="rounded-lg bg-[var(--color-card-bg)] p-6 shadow-lg">
                        <h2 className="mb-4 text-xl font-bold text-white">팀장 자동 준비 완료</h2>
                        <p className="mb-6 text-sm text-gray-400">
                            해당 드래프트의 모든 팀장을 준비 완료 상태로 변경합니다.
                        </p>
                        <button
                            onClick={handleReadyAllLeaders}
                            disabled={isLoading || !draftId}
                            className="w-full rounded bg-[var(--color-primary)] px-6 py-3 font-bold text-black transition-all hover:bg-[var(--color-hextech-gold-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? "처리 중..." : "팀장 준비 완료"}
                        </button>
                    </div>

                    {/* 테스트 유저 추가 */}
                    <div className="rounded-lg bg-[var(--color-card-bg)] p-6 shadow-lg">
                        <h2 className="mb-4 text-xl font-bold text-white">테스트 유저 추가</h2>
                        <p className="mb-4 text-sm text-gray-400">
                            드래프트 로비에 테스트 유저(test1 ~ testN)를 추가합니다. (1~30명, 중복 X)
                        </p>
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold text-gray-300">인원 수</label>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={testUserCount}
                                onChange={(e) => setTestUserCount(parseInt(e.target.value) || 1)}
                                className="w-full rounded border border-gray-600 bg-[var(--color-bg-primary)] px-4 py-2 text-white focus:border-[var(--color-primary)] focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={handleAddTestMembers}
                            disabled={isLoading || !draftId}
                            className="w-full rounded bg-[var(--color-primary)] px-6 py-3 font-bold text-black transition-all hover:bg-[var(--color-hextech-gold-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? "처리 중..." : "테스트 유저 추가"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Toast 알림 */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default AdminPage;
