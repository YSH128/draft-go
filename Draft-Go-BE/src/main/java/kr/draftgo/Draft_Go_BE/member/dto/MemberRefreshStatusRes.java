package kr.draftgo.Draft_Go_BE.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class MemberRefreshStatusRes {
    private boolean isRefreshing;
    private long remainingCooldownSeconds;
}
