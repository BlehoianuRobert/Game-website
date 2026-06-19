const API_URL = "http://localhost:8000/api/v1";
const ENDPOINTS = {
    login: `${API_URL}/auth/login`,
    signup: `${API_URL}/auth/register`,
    me: `${API_URL}/auth/me`,
    games: `${API_URL}/games`,
    items: `${API_URL}/items`,
    profiles: `${API_URL}/players`,
    leaderboard: `${API_URL}/leaderboard`,
    progress: `${API_URL}/players/me/progress`,
    inventory: `${API_URL}/players/me/inventory`,
    players: `${API_URL}/players`,
}

export const fetchData = async (endpoint: string, data: object, method: string = "POST") => {
    const response = await fetch(endpoint, {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: method !== "GET" ? JSON.stringify(data) : undefined,
        credentials: "include" // Include cookies in the request
    });
    return await response.json();
};

export default ENDPOINTS;