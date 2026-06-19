import type { Item } from "../../models";
import ENDPOINTS, { fetchData } from "./endpoints";

export const getItem: (itemId: string) => Promise<Item> = async (itemId: string) => {
    try{
        const response = await fetchData(`${ENDPOINTS.items}/${itemId}`, {}, "GET");
        const item: Item = {
            id: response.data.id,
            game_id: response.data.game_id,
            name: response.data.name,
            description: response.data.description,
            rarity: response.data.rarity,
        };
        return item;
    } catch (error) {
        console.error("Error fetching item:", error);
        throw error;
    }
};

export const updateItem = async (itemId: string, itemData: Omit<Item, 'id' | 'game_id'>) => {
    try {
        const response = await fetchData(`${ENDPOINTS.items}/${itemId}`, itemData, 'PUT');
        return response;
    } catch (error) {
        console.error("Error updating item:", error);
        throw error;
    }
}

export const createItem = async (itemData: Omit<Item, 'id'>) => {
    try {
        const response = await fetchData(ENDPOINTS.items, itemData, 'POST');
        return response;
    } catch (error) {
        console.error("Error creating item:", error);
        throw error;
    }
}

export const getGameItems: (gameId: string) => Promise<Item[]> = async (gameId: string) => {
    try{
        const response = await fetchData(`${ENDPOINTS.items}?game_id=${gameId}`, {}, "GET");
        const items = response.data.data.map((itemData: any) => ({
            id: itemData.id,
            game_id: itemData.game_id,
            name: itemData.name,
            description: itemData.description,
            rarity: itemData.rarity,
        }));

        console.log("Parsed items:", items);
        return items; 
    } catch (error) {
        console.error("Error fetching game items:", error);
        throw error;
    }
};