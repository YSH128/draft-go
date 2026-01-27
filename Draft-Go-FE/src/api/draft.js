import { instance } from "../libs/axios";

export const getAuctionState = async (draftId) => {
  const response = await instance.get(`/auctions/${draftId}`);
  return response.data;
};

export const getDraftQueue = async (draftId) => {
  const response = await instance.get(`/auctions/${draftId}/queue`);
  return response.data;
};

export const getTeamInfos = async (draftId) => {
  const response = await instance.get(`/auctions/${draftId}/teams`);
  return response.data;
};

export const startAuction = async (draftId) => {
  const response = await instance.post(`/auctions/${draftId}/start`);
  return response.data;
};

export const placeBid = async (draftId, teamId, price) => {
  const response = await instance.post(`/auctions/${draftId}/bid`, {
    teamId,
    price,
  });
  return response.data;
};
