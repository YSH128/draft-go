package kr.draftgo.Draft_Go_BE.draft.auction.domain;

import lombok.ToString;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Getter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class BidInfo implements Serializable {
    // 현재 입찰 정보를 나타냅니다.
    // teamId가 null인 경우, 아직 입찰이 없는 상태를 의미합니다.
    // 이 정보는 Redis의 bid 키에 저장됩니다.

    private Long teamId;
    private int price;

    public boolean exists() {
        return teamId != null;
    }
}
