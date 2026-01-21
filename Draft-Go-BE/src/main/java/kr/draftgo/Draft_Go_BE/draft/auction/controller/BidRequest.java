package kr.draftgo.Draft_Go_BE.draft.auction.controller;

public record BidRequest(
        Long teamId,
        int price) {
}
