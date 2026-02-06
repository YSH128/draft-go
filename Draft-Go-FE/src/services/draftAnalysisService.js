import { analyzeDraft, checkAiHealth } from "../api/aiApi";

export const DraftAnalysisService = {
  /**
   * Request team roster analysis from AI server
   * @param {Object} rosterPayload - { myTeam: [...], enemyTeam: [...] }
   */
  analyzeTeamRoster: async (rosterPayload) => {
    return await analyzeDraft(rosterPayload);
  },

  /**
   * Check if AI server is running
   */
  checkServerStatus: async () => {
    try {
      const data = await checkAiHealth();
      return data.status === "ok";
    } catch (error) {
      console.error("AI Server is down:", error);
      return false;
    }
  },
};
