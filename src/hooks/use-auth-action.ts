import axiosInstance from "../lib/axiosInstance";
import { useNavigate } from "react-router-dom";

import Cookies from "js-cookie";

interface IUseAuth {
    login: (email: string, password: string, autoLogin: boolean) => Promise<{ success: boolean, error?: string }>;
    logout: () => void;
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
                const { access, refresh } = response.data;
                console.log(autoLogin)
                if (autoLogin) {
                    Cookies.set("accessToken", access, { expires: 7 });
                    Cookies.set("refreshToken", refresh, { expires: 7 });
                }else{
                    Cookies.set("accessToken", access, { expires: 1 });
                }
                    
                navigate("/map");
                return { success: true };
            }
            return { success: false, error: "로그인에 실패했습니다." };
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, error: "이메일 또는 비밀번호가 일치하지 않습니다." };
        }
    };

    const logout = async () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
    };

    return { login, logout };
};
