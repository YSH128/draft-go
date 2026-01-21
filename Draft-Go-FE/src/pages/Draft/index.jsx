import { useState, useEffect, useCallback } from "react";
import DraftLayout from "./components/DraftLayout";
import { TeamSidebarSection, AuctionSection, ChatSection } from "./sections";

// 목업 데이터
const MOCK_TEAMS = [
  {
    id: "team-alpha",
    name: "Team Alpha",
    captain: "캡틴",
    points: 420,
    roster: {
      jungle: {
        name: "Canyon",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBDtUYhnw_RMBpfNit8ep1sCZNFdDa7irbBukb5_r6TJj9gBdx6UvkPXzKQsJYyxf_OMiaKqK3t16uxh6X4NofgzIeFvHOGm0RrcxPvppQI7wW4zeLycgs-HRy4jfAniS7NEHwi3hclPYijznF4jOQ6AYhMsrwPuK4mC-D3xMgvHPTEC_yuhbYjjmQUiqYAuDFXpalk12xUb283az8wb3uVQSOfRU0t9rNDgYai5d139AoRhOyUZ9_t4VBjhwRPSfz7ficyRv_moXQ",
      },
    },
  },
  {
    id: "team-delta",
    name: "Team Delta",
    captain: "캡틴",
    points: 800,
    roster: {},
  },
  {
    id: "team-omega",
    name: "Team Omega",
    captain: "캡틴",
    points: 150,
    roster: {
      top: {
        name: "Zeus",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAAHaa0vUGiD04xPspuOZgKAzWb-WD_llpDK3uRHlEjEZPdm6YMjtjHDWrrAVkpfhNgo5h6zbS_WowLOC3QVjhG9fevkYQoMtWShFwM-eNmsfSMC2mO84tB3J8JnBjFoNcuwMhtrY0KqW0jLqKa6FMdhHJjZQQVC6humhSlcIlpB1RFQbGXQ-VNFeLnT-hmP6SE6K1f4OPsuI8LySfpHhRsO00x-ijfp1-Ed8jPuqRFAQoTyPBPgIoga0e6C64p0BECfSVSaeAnils",
      },
      jungle: {
        name: "Oner",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCy3gQVbu0BbQnkC_pIpwEJCJBr-xZFeTr2dLh3mwMLqg7xbQ9hRcoU4Da3GY5ZGu96cGakhgCjtKFebZkxvsjDjIVWuQB_QWlOevXCvChfKxE96fa5V4MpwLR3Pfgfq2Q5wQ3R4m1s3WnXYw0UxyltGHL6I0JNHmuq8Z412yjMuE9ZmOEFUnX3ANYjCf8aoTWCPPevCBrD3iM70_B_ql8I-oIhGVcJUheS14h665-qDkNBIT5CHgei_d7nl4gtTKMwbin_8qlE7H4",
      },
    },
  },
];

const MOCK_CURRENT_PLAYER = {
  id: "player-current",
  name: "Challenger Player",
  imageUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBXaW-3NUg7lTWLPOMLpeFh4fFkst_ea6g7lSPyVCJ-QmfelJo2Q_-F62cu0OJGGAghUcfvLOZ02R6PFGZEYhaos_cIYg7QzM_J4vlfxlD9rRTEx7Mg3_mYSeeYUF7yCI1pFNkSNDWobHsm_QSMyh5qOROnwhz894z0EuoKBE4lBZORX3kzyFgk2KxRI1kLc5aJi2XFi4uHaoLd56m9JyQrMel3-lyAt7hb-jgc72T4M18gKs0laYfMlq3lJpVKJpNa9mrrLkuYBcc",
  tier: "Challenger",
  positions: ["Top", "Jungle"],
  mostChampions: [
    {
      name: "Aatrox",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDlet6lImZKuX18MIRBIUM-THKtrrtA9azVi31BN-6CFdMI3JKoO5K2ZT2E6X_LdqG_I7qsOTrJ5LtTY3YwMFOrgu5C0Z7dhIT-43jiFtJvbcjb7cARx7KBTTz_yS4IqFvYKpCw9-vII-O5o7vGmfFgfmLsXHeIwLUom8axkIg3q6nynDy4DlAMuCDaD4PTY6uEVcj0w4pyQvhTD2pMr9OFCeSZMMNLAkK9gcVqy2u3M3iwNXq7QSSEkZf4Kso-zdH9Ed24ntve83E",
    },
    {
      name: "Renekton",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDJezZcoAQxJhe7Ct7UjN87v5bSMaF4pfnDYT_Ah_zkR2vvlQG4FAnOR9L6dmapD2mpJSYM0zZsEZGmYYx1U2Ew0eDf564wccFbvZBXLAd4y4qGmsx3BkdUNaDsxtAkAX_cJ_FohRqFJDsiRdxIwKDx3xArU3jr8Cqjr5J5_W5emEejf4BSwX3mBqaSbXrg9omOpBGX5OzCBRGDMoXxcgdYCeAwed3M4x5Cvf0mJtuFnTgwnaJ9BMVGUt4bwlNaITXY3gCbzhqDLnc",
    },
    {
      name: "Jayce",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC6WVGTLkuZWXkBYSQYZhsLsFzIcrQTq7dC1d1Jhut8zpX6KJ828FOcdUxyaRQVP5GmMT7ege7PDB1Mg4LjvWcxQYPlsOjZ1o3EeU-zwY8Zpg1xQxr76eZ87MG-RzM1ls5aPElvSgH34ykuXwaBte4_wtK9FwswYCI7bVajAvY6BrE_zeeA-oZnNpewlXoCXRg7N03L6ELfdaMyEbnDKBQjoN94PzU4EVOcFrdapwcm3OkjqtURe8rzE25LQW_85rdgsx7wattEd7w",
    },
  ],
};

const MOCK_QUEUE = [
  {
    id: "p1",
    name: "Player_01",
    tier: "Diamond",
    position: "Mid",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBDtUYhnw_RMBpfNit8ep1sCZNFdDa7irbBukb5_r6TJj9gBdx6UvkPXzKQsJYyxf_OMiaKqK3t16uxh6X4NofgzIeFvHOGm0RrcxPvppQI7wW4zeLycgs-HRy4jfAniS7NEHwi3hclPYijznF4jOQ6AYhMsrwPuK4mC-D3xMgvHPTEC_yuhbYjjmQUiqYAuDFXpalk12xUb283az8wb3uVQSOfRU0t9rNDgYai5d139AoRhOyUZ9_t4VBjhwRPSfz7ficyRv_moXQ",
  },
  {
    id: "p2",
    name: "Player_02",
    tier: "Master",
    position: "Support",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAHaa0vUGiD04xPspuOZgKAzWb-WD_llpDK3uRHlEjEZPdm6YMjtjHDWrrAVkpfhNgo5h6zbS_WowLOC3QVjhG9fevkYQoMtWShFwM-eNmsfSMC2mO84tB3J8JnBjFoNcuwMhtrY0KqW0jLqKa6FMdhHJjZQQVC6humhSlcIlpB1RFQbGXQ-VNFeLnT-hmP6SE6K1f4OPsuI8LySfpHhRsO00x-ijfp1-Ed8jPuqRFAQoTyPBPgIoga0e6C64p0BECfSVSaeAnils",
  },
  {
    id: "p3",
    name: "Player_03",
    tier: "Emerald",
    position: "Jungle",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCy3gQVbu0BbQnkC_pIpwEJCJBr-xZFeTr2dLh3mwMLqg7xbQ9hRcoU4Da3GY5ZGu96cGakhgCjtKFebZkxvsjDjIVWuQB_QWlOevXCvChfKxE96fa5V4MpwLR3Pfgfq2Q5wQ3R4m1s3WnXYw0UxyltGHL6I0JNHmuq8Z412yjMuE9ZmOEFUnX3ANYjCf8aoTWCPPevCBrD3iM70_B_ql8I-oIhGVcJUheS14h665-qDkNBIT5CHgei_d7nl4gtTKMwbin_8qlE7H4",
  },
  {
    id: "p4",
    name: "Player_04",
    tier: "Diamond",
    position: "Adc",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAjSZaJUwAExse-oH8JC2mLgU1Q07fHcCK8eJFl_vHMCA8307eI8iGk15PCx5kv0SijbmasZBBxELAVcaqHFediwmwoQkLEIXIwS4Lz9_fDyopxZyvYllcGu9ypc3-nM6Oo1karnOEb4i2bNLmq7ZzXwwgwmIJSnYz0CKSlxQObn7h8q2qjF-ON0IgaPNKhkv_g-JT3hYhlADqRb-HgAkBJbhin0SaJ7qDrKfjdpGwPLkfHZgJNf1R4J1N_yV__qkNKTAgtfEfmbPg",
  },
  {
    id: "p5",
    name: "Player_05",
    tier: "Diamond",
    position: "Top",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDlet6lImZKuX18MIRBIUM-THKtrrtA9azVi31BN-6CFdMI3JKoO5K2ZT2E6X_LdqG_I7qsOTrJ5LtTY3YwMFOrgu5C0Z7dhIT-43jiFtJvbcjb7cARx7KBTTz_yS4IqFvYKpCw9-vII-O5o7vGmfFgfmLsXHeIwLUom8axkIg3q6nynDy4DlAMuCDaD4PTY6uEVcj0w4pyQvhTD2pMr9OFCeSZMMNLAkK9gcVqy2u3M3iwNXq7QSSEkZf4Kso-zdH9Ed24ntve83E",
  },
  {
    id: "p6",
    name: "Player_06",
    tier: "Emerald",
    position: "Mid",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJezZcoAQxJhe7Ct7UjN87v5bSMaF4pfnDYT_Ah_zkR2vvlQG4FAnOR9L6dmapD2mpJSYM0zZsEZGmYYx1U2Ew0eDf564wccFbvZBXLAd4y4qGmsx3BkdUNaDsxtAkAX_cJ_FohRqFJDsiRdxIwKDx3xArU3jr8Cqjr5J5_W5emEejf4BSwX3mBqaSbXrg9omOpBGX5OzCBRGDMoXxcgdYCeAwed3M4x5Cvf0mJtuFnTgwnaJ9BMVGUt4bwlNaITXY3gCbzhqDLnc",
  },
  {
    id: "p7",
    name: "Player_07",
    tier: "Platinum",
    position: "Support",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBDtUYhnw_RMBpfNit8ep1sCZNFdDa7irbBukb5_r6TJj9gBdx6UvkPXzKQsJYyxf_OMiaKqK3t16uxh6X4NofgzIeFvHOGm0RrcxPvppQI7wW4zeLycgs-HRy4jfAniS7NEHwi3hclPYijznF4jOQ6AYhMsrwPuK4mC-D3xMgvHPTEC_yuhbYjjmQUiqYAuDFXpalk12xUb283az8wb3uVQSOfRU0t9rNDgYai5d139AoRhOyUZ9_t4VBjhwRPSfz7ficyRv_moXQ",
  },
  {
    id: "p8",
    name: "Player_08",
    tier: "Master",
    position: "Top",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBDtUYhnw_RMBpfNit8ep1sCZNFdDa7irbBukb5_r6TJj9gBdx6UvkPXzKQsJYyxf_OMiaKqK3t16uxh6X4NofgzIeFvHOGm0RrcxPvppQI7wW4zeLycgs-HRy4jfAniS7NEHwi3hclPYijznF4jOQ6AYhMsrwPuK4mC-D3xMgvHPTEC_yuhbYjjmQUiqYAuDFXpalk12xUb283az8wb3uVQSOfRU0t9rNDgYai5d139AoRhOyUZ9_t4VBjhwRPSfz7ficyRv_moXQ",
  },
  {
    id: "p9",
    name: "Player_09",
    tier: "Diamond",
    position: "Jungle",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAHaa0vUGiD04xPspuOZgKAzWb-WD_llpDK3uRHlEjEZPdm6YMjtjHDWrrAVkpfhNgo5h6zbS_WowLOC3QVjhG9fevkYQoMtWShFwM-eNmsfSMC2mO84tB3J8JnBjFoNcuwMhtrY0KqW0jLqKa6FMdhHJjZQQVC6humhSlcIlpB1RFQbGXQ-VNFeLnT-hmP6SE6K1f4OPsuI8LySfpHhRsO00x-ijfp1-Ed8jPuqRFAQoTyPBPgIoga0e6C64p0BECfSVSaeAnils",
  },
  {
    id: "p10",
    name: "Player_10",
    tier: "Diamond",
    position: "Support",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBDtUYhnw_RMBpfNit8ep1sCZNFdDa7irbBukb5_r6TJj9gBdx6UvkPXzKQsJYyxf_OMiaKqK3t16uxh6X4NofgzIeFvHOGm0RrcxPvppQI7wW4zeLycgs-HRy4jfAniS7NEHwi3hclPYijznF4jOQ6AYhMsrwPuK4mC-D3xMgvHPTEC_yuhbYjjmQUiqYAuDFXpalk12xUb283az8wb3uVQSOfRU0t9rNDgYai5d139AoRhOyUZ9_t4VBjhwRPSfz7ficyRv_moXQ",
  },
  {
    id: "p11",
    name: "Player_11",
    tier: "Grandmaster",
    position: "Top",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAHaa0vUGiD04xPspuOZgKAzWb-WD_llpDK3uRHlEjEZPdm6YMjtjHDWrrAVkpfhNgo5h6zbS_WowLOC3QVjhG9fevkYQoMtWShFwM-eNmsfSMC2mO84tB3J8JnBjFoNcuwMhtrY0KqW0jLqKa6FMdhHJjZQQVC6humhSlcIlpB1RFQbGXQ-VNFeLnT-hmP6SE6K1f4OPsuI8LySfpHhRsO00x-ijfp1-Ed8jPuqRFAQoTyPBPgIoga0e6C64p0BECfSVSaeAnils",
  },
  {
    id: "p12",
    name: "Player_12",
    tier: "Challenger",
    position: "Mid",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCy3gQVbu0BbQnkC_pIpwEJCJBr-xZFeTr2dLh3mwMLqg7xbQ9hRcoU4Da3GY5ZGu96cGakhgCjtKFebZkxvsjDjIVWuQB_QWlOevXCvChfKxE96fa5V4MpwLR3Pfgfq2Q5wQ3R4m1s3WnXYw0UxyltGHL6I0JNHmuq8Z412yjMuE9ZmOEFUnX3ANYjCf8aoTWCPPevCBrD3iM70_B_ql8I-oIhGVcJUheS14h665-qDkNBIT5CHgei_d7nl4gtTKMwbin_8qlE7H4",
  },
];

const MOCK_PASSED_QUEUE = [
  {
    id: "passed1",
    name: "Zed Master",
    tier: "Emerald",
    position: "Mid",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBDtUYhnw_RMBpfNit8ep1sCZNFdDa7irbBukb5_r6TJj9gBdx6UvkPXzKQsJYyxf_OMiaKqK3t16uxh6X4NofgzIeFvHOGm0RrcxPvppQI7wW4zeLycgs-HRy4jfAniS7NEHwi3hclPYijznF4jOQ6AYhMsrwPuK4mC-D3xMgvHPTEC_yuhbYjjmQUiqYAuDFXpalk12xUb283az8wb3uVQSOfRU0t9rNDgYai5d139AoRhOyUZ9_t4VBjhwRPSfz7ficyRv_moXQ",
  },
  {
    id: "passed2",
    name: "Forest Guard",
    tier: "Platinum",
    position: "Support",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAHaa0vUGiD04xPspuOZgKAzWb-WD_llpDK3uRHlEjEZPdm6YMjtjHDWrrAVkpfhNgo5h6zbS_WowLOC3QVjhG9fevkYQoMtWShFwM-eNmsfSMC2mO84tB3J8JnBjFoNcuwMhtrY0KqW0jLqKa6FMdhHJjZQQVC6humhSlcIlpB1RFQbGXQ-VNFeLnT-hmP6SE6K1f4OPsuI8LySfpHhRsO00x-ijfp1-Ed8jPuqRFAQoTyPBPgIoga0e6C64p0BECfSVSaeAnils",
  },
  {
    id: "passed3",
    name: "River King",
    tier: "Diamond",
    position: "Top",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBDtUYhnw_RMBpfNit8ep1sCZNFdDa7irbBukb5_r6TJj9gBdx6UvkPXzKQsJYyxf_OMiaKqK3t16uxh6X4NofgzIeFvHOGm0RrcxPvppQI7wW4zeLycgs-HRy4jfAniS7NEHwi3hclPYijznF4jOQ6AYhMsrwPuK4mC-D3xMgvHPTEC_yuhbYjjmQUiqYAuDFXpalk12xUb283az8wb3uVQSOfRU0t9rNDgYai5d139AoRhOyUZ9_t4VBjhwRPSfz7ficyRv_moXQ",
  },
  {
    id: "passed4",
    name: "Shadow Step",
    tier: "Emerald",
    position: "Jungle",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJezZcoAQxJhe7Ct7UjN87v5bSMaF4pfnDYT_Ah_zkR2vvlQG4FAnOR9L6dmapD2mpJSYM0zZsEZGmYYx1U2Ew0eDf564wccFbvZBXLAd4y4qGmsx3BkdUNaDsxtAkAX_cJ_FohRqFJDsiRdxIwKDx3xArU3jr8Cqjr5J5_W5emEejf4BSwX3mBqaSbXrg9omOpBGX5OzCBRGDMoXxcgdYCeAwed3M4x5Cvf0mJtuFnTgwnaJ9BMVGUt4bwlNaITXY3gCbzhqDLnc",
  },
];

const MOCK_MESSAGES = [
  {
    type: "system",
    content: "드래프트가 시작되었습니다. 첫 번째 선수가 공개되었습니다.",
  },
  {
    type: "user",
    sender: "Blue Alpha",
    color: "blue",
    content: "이번 선수는 무조건 가져갑니다. 챌린저 미드 픽!",
  },
  {
    type: "user",
    sender: "Green Delta",
    color: "gold",
    content: "현재 가격 240P 입찰합니다.",
  },
  {
    type: "user",
    sender: "User_1029",
    color: "default",
    content: "저 팀 캡틴 진짜 빡세네 ㅋㅋ",
  },
];

export default function DraftPage() {
  const [teams] = useState(MOCK_TEAMS);
  const [currentPlayer] = useState(MOCK_CURRENT_PLAYER);
  const [currentBid, setCurrentBid] = useState(240);
  const [timeLeft, setTimeLeft] = useState(10);
  const [queue] = useState(MOCK_QUEUE);
  const [passedQueue] = useState(MOCK_PASSED_QUEUE);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [activeTeamId] = useState("team-delta");

  const BID_INCREMENT = 20;
  const ROUND_MS = 30_000;

  // 입찰 핸들러
  const handleBid = useCallback(() => {
    setTimeLeft(30);
    setCurrentBid((prevBid) => {
      const nextBid = prevBid + BID_INCREMENT;
      setMessages((prevMsgs) => [
        ...prevMsgs,
        {
          type: "user",
          sender: "나",
          color: "gold",
          content: `${nextBid}P 입찰!`,
        },
      ]);
      return nextBid;
    });
  }, []);

  // 채팅 메시지 전송 핸들러
  const handleSendMessage = useCallback((content) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        sender: "나",
        color: "gold",
        content,
      },
    ]);
  }, []);

  // 단축키 처리(B키 입찰)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "b" || e.key === "B") {
        // 입력 중일 때는 무시
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
          return;
        }
        handleBid();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleBid]);

  useEffect(() => {
    let endAt = Date.now() + ROUND_MS;

    const timer = setInterval(() => {
      const leftMs = endAt - Date.now();
      const leftSec = Math.max(0, Math.ceil(leftMs / 1000));
      setTimeLeft(leftSec);

      if (leftMs <= 0) {
        endAt = Date.now() + ROUND_MS; // 다음 라운드
        // TODO: 다음 선수 로직
      }
    }, 250);

    return () => clearInterval(timer);
  }, []);

  return (
    <DraftLayout>
      <TeamSidebarSection
        teams={teams}
        activeTeamId={activeTeamId}
        myTeamId="team-delta"
      />

      <AuctionSection
        player={currentPlayer}
        currentBid={currentBid}
        timeLeft={timeLeft}
        bidIncrement={BID_INCREMENT}
        onBid={handleBid}
        queue={queue}
        passedQueue={passedQueue}
      />

      <ChatSection
        messages={messages}
        viewerCount={2400}
        onSendMessage={handleSendMessage}
      />
    </DraftLayout>
  );
}
