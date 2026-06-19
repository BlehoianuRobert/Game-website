import ENDPOINTS, { fetchData } from "./endpoints";

export const login = async (email: string, password: string) => {
    try{
        const response = await fetchData(ENDPOINTS.login, { email, password });
        return response;
    } catch (error) {
        console.error("Login error:", error);
        return null;
    }
};

export const signup = async (username: string, email: string, password: string, role: string) => {
    try{
        const response = await fetchData(ENDPOINTS.signup, { username, email, password, role });
        return response;
    }
    catch (error) {
        console.error("Signup error:", error);
        return null;
    }
};

export const me = async () => {
    try{
        const response = await fetchData(ENDPOINTS.me, {}, "GET");
        console.log("Me response:", response);

        if(response && response.data && response.data.id && response.data.username && response.data.email){
            const player = {
                id: response.data.id,
                username: response.data.username,
                email: response.data.email,
            };
            return player;
        }

        return null;
    } catch (error) {
        console.error("Me error:", error);
        return null;
    }
}