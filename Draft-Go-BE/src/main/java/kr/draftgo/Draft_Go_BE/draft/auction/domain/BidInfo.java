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
    private Long teamId;
    private int price;
    private Integer remainingSeconds; // 남은 시간 (초)

    public boolean exists() {
        return teamId != null;
    }
}
