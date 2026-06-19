import type { GameVersion } from "../../models";
import type { Game } from "../../models/game";
import ENDPOINTS, { fetchData } from "./endpoints";

export const createGame = async (gameData: Game) => {
    try{
        const response = await fetchData(ENDPOINTS.games, gameData);
        return response;
    } catch (error) {
        console.error("Error creating game:", error);
        throw error;
    }
}

export const getGame: (gameId: string) => Promise<Game> = async (gameId: string) => {
    try{
        const response = await fetchData(`${ENDPOINTS.games}/${gameId}`, {}, "GET");
        const game: Game = {
            id: response.data.id,
            name: response.data.name,
            description: response.data.description,
            created_at: response.data.created_at,
        }
        return game;
    } catch (error) {
        console.error("Error fetching game:", error);
        throw error;
    }
}

export const getAllGames: () => Promise<Game[]> = async () => {
    try{
        const response = await fetchData(ENDPOINTS.games, {}, "GET");
        console.log("Games response:", response);
        const games: Game[] = response.data.data.map((gameData: any) => ({
            id: gameData.id,
            name: gameData.name,
            description: gameData.description,
            created_at: gameData.created_at,
        }));
        return games;
    } catch (error) {
        console.error("Error fetching games:", error);
        throw error;
    }
}

export const getGameVersions: (gameId: string) => Promise<any[]> = async (gameId: string) => {
    try{
        const response = await fetchData(`${ENDPOINTS.games}/${gameId}/versions`, {}, "GET");
        return response.data;
    } catch (error) {
        console.error("Error fetching game versions:", error);
        throw error;
    }
}

export const deleteGameVersion: (gameId: string, versionId: string) => Promise<any> = async (gameId: string, versionId: string) => {
    try{
        const response = await fetchData(`${ENDPOINTS.games}/${gameId}/versions/${versionId}`, {}, "DELETE");
        return response.data;
    } catch (error) {
        console.error("Error deleting game version:", error);
        throw error;
    }
}

export const addGameVersion: (versionData: GameVersion) => Promise<any> = async (versionData: GameVersion) => {
    try{
        await fetchData(`${ENDPOINTS.games}/${versionData.game_id}/versions`, versionData);
    } catch (error) {
        console.error("Error adding game version:", error);
        throw error;
    }
}

