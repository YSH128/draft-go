## 1. 인증 및 멤버 (Auth & Member)

### [POST] 회원가입

* **URL:** `/api/v1/members/signup`
* **Req:** `username`, `password`, `gameName`, `tagLine`
* **Res:** `201 Created`

### [POST] 로그인

* **URL:** `/api/v1/members/login`
* **Req:** `username`, `password`
* **Res:** `accessToken`, `refreshToken` (Cookie)

### [POST] 토큰 재발급

* **URL:** `/api/v1/members/reissue`
* **Req:** `refreshToken`
* **Res:** `accessToken`, `refreshToken` (Cookie)

### [GET] 내 정보 조회
* **URL:** `/api/v1/members/me`
* **Res:** `memberId`, `username`, `gameName`, `tagLine`, `rank`, `leaguePoints`, `wins`, `losses`

### [POST] 로그아웃
* **URL:** `/api/v1/members/logout`
* **Req:** `accessToken`, `refreshToken` (Cookie)
* **Res:** `200 OK`
---

## 2. 메인 화면 (Main Discovery)

### [GET] 인기 드래프트 목록 조회

* **URL:** `/api/v1/drafts`
* **Res:** `List<DraftSummary>` (ID, 제목, 참여자 수, 방장 닉네임)

### [GET] 드래프트 상세 모달 조회

* **URL:** `/api/v1/drafts/{draftId}`
* **Res:**
* `draftId`, `title`, `creatorInfo`
* `leaders`: `List<MemberTierInfo>` (티어_이름)
* `members`: `List<MemberTierInfo>` (티어_이름)


---

## 3. 로비 관리 (Lobby Management)

### [POST] 드래프트 방 생성

* **URL:** `/api/v1/drafts`
* **Req:** `title`, `maxTeamCount`
* **Res:** `draftId`, `teamMemberCode`, `teamLeaderCode`

### [POST] 드래프트 방 입장

* **URL:** `/api/v1/drafts/join`
* **Req:** `draftCode`
* **Res:** `draftId`

### [GET] 로비 정보 새로고침

* **URL:** `/api/v1/drafts/{draftId}/refresh`
* **Res:**
* `draftId`, `title`, `maxTeamCount`, `status` (LOBBY, DRAFT, COMPLETE)
* `leaders`: `List<LeaderDetail>` (ID, 이름, 포지션, 준비여부)
* `members`: `List<MemberDetail>` (ID, 이름, 포지션)
* `observers`: `List<UserSummary>`
* `codes`: `{ teamMemberCode, teamLeaderCode }`
* `draftSnapshot`: `null` (추후 개발)

### [POST] 역할 변경 (Admin 전용)

* **URL:** `/api/v1/drafts/{draftId}/change-role`
* **Req:** `targetUserId`, `role` (LEADER, MEMBER)

### [POST] 포지션 변경

* **URL:** `/api/v1/drafts/{draftId}/change-position`
* **Req:** `targetUserId`, `position` (TOP, JUNGLE, MID, BOT, SUP, OBSERVER)

### [DELETE] 참가자 강제 퇴장 (Admin 전용)

* **URL:** `/api/v1/drafts/{draftId}/kick/{userId}`

### [POST] 준비 완료 토글 (Leader 전용)

* **URL:** `/api/v1/drafts/{draftId}/ready`
* **Req:** `isReady` (boolean)

### [POST] 드래프트 시작 (Admin 전용)

* **URL:** `/api/v1/drafts/{draftId}/start`

---

## 4. 사용자 데이터 (Member Data)

### [GET] 라이엇 계정 정보 조회

* **URL:** `/api/v1/members?gameName={gameName}&tagLine={tagLine}`
* **Res:** - `tier`, `rank`, `winRate`
* `mostChampions`: `List<String>`
* `position`: `{ main, sub }`
* `stats`: `{ wins, losses }`



### [GET] 특정 멤버 상세 조회

* **URL:** `/api/v1/members/{memberId}`
* **Res:** (상동)

---