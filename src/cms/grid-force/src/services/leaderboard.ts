import ENDPOINTS, { fetchData } from "./endpoints";
import type { Leaderboard } from "../../models/leaderboard";

export const getGameLeaderboard = async (gameId: string) => {
    try{
        const response = await fetchData(`${ENDPOINTS.leaderboard}/${gameId}`, {}, "GET");
        const leaderboard: Leaderboard[] = response.data.map((entry: any) => ({
            rank: entry.rank,
            player_id: entry.player_id,
            username: entry.player_username,
            score: entry.score,
            updated_at: entry.updated_at,
        }));
        return leaderboard;
    } catch (error) {
        console.error("Error fetching game leaderboard:", error);
        throw error;
    }
}