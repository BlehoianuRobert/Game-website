import ENDPOINTS, { fetchData } from "./endpoints";

export const getMyGameProgress = async (gameId: string) => {
    try {
        const response = await fetchData(`${ENDPOINTS.progress}/${gameId}`, {}, "GET");
        return response.data;
    } catch (error) {
        console.error("Error fetching game progress:", error);
        throw error;
    }
};

export const getInventory = async () => {
    try {
        const response = await fetchData(ENDPOINTS.inventory, {}, "GET");
        return response.data;
    } catch (error) {
        console.error("Error fetching inventory:", error);
        throw error;
    }
};

export const getPlayerProfile = async (playerId: string) => {
    try {
        const response = await fetchData(`${ENDPOINTS.profiles}/${playerId}`, {}, "GET");
        return response.data;
    } catch (error) {
        console.error("Error fetching player profile:", error);
        throw error;
    }
};

export const getPlayers = async () => {
    try {
        const response = await fetchData(ENDPOINTS.players, {}, "GET");
        return response.data;
    } catch (error) {
        console.error("Error fetching players:", error);
        throw error;
    }
}
