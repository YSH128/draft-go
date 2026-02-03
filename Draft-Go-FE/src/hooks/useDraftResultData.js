import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getDraftResult } from "../api/draft";
import { adaptDraftResult } from "../api/draftAdapter";
import useAuthStore from "../stores/useAuthStore";

/**
 * 드래프트 결과 데이터를 페칭하고 가공하는 커스텀 훅
 * @returns {{
 *   teams: Array,
 *   isLoading: boolean,
 *   isError: boolean,
 *   error: Error | null,
 *   draftId: string | null,
 *   isValidId: boolean
 * }}
 */
export default function useDraftResultData() {
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get("draftId");
  const { user } = useAuthStore();

  const isValidId = !!draftId;

  const {
    data: teams = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["draftResult", draftId, user?.id],
    queryFn: async () => {
      const raw = await getDraftResult(draftId);
      return adaptDraftResult(raw, user?.id);
    },
    enabled: isValidId,
  });

  return {
    teams,
    isLoading,
    isError,
    error,
    draftId,
    isValidId,
  };
}
