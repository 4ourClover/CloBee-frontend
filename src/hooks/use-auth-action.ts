import axiosInstance from "../lib/axiosInstance";
import { useNavigate } from "react-router-dom";

import Cookies from "js-cookie";

interface IUseAuth {
    login: (email: string, password: string, autoLogin: boolean) => Promise<void>;
    logout: () => void;
}

interface TokenResponse {
    access: string;
    refresh: string;
}

export const useAuthActions = (): IUseAuth => {
    const navigate = useNavigate();

    const login = async (email: string, password: string, autoLogin: boolean) => {
        try {
            const response = await axiosInstance.post(`/user/login`, {
                email,
                password,
            });
            if (response.status === 200) {
                const { access, refresh } = response.data as TokenResponse;
                console.log(autoLogin)
                if (autoLogin) {
                    Cookies.set("accessToken", access, { expires: 7 });
                    Cookies.set("refreshToken", refresh, { expires: 7 });
                }else{
                    Cookies.set("accessToken", access, { expires: 1 });
                }
                
                navigate("/map");
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    const logout = async () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
    };

    return { login, logout };
};