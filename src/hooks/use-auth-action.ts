import axiosInstance from "../api/axios/axiosInstance";


import Cookies from "js-cookie";

export interface IUseAuth {
    login: (email: string, password: string, autoLogin: boolean) => Promise<{ success: boolean, error?: string }>;
    logout: () => void;
}

interface TokenResponse {
    access: string;
    refresh: string;
}

export const useAuthActions = (): IUseAuth => {
    

    const login = async (email: string, password: string, autoLogin: boolean) => {
        try {
            const response = await axiosInstance.post(`/user/login`, {
                email,
                password,
            });
            
            if (response.status === 200) {
                const { access, refresh } = response.data as TokenResponse;
                console.log("자동 로그인:", autoLogin);
                
                if (autoLogin) {
                    Cookies.set("accessToken", access, { expires: 7 });
                    Cookies.set("refreshToken", refresh, { expires: 7 });
                } else {
                    Cookies.set("accessToken", access, { expires: 1 });
                }
                
                return { success: true };
            }
            return { success: false, error: "로그인에 실패했습니다." };
            
        } catch (error: any) {
            console.error("Login error details:", {
                message: error.message,
                code: error.code,
                response: error.response?.data
            });

            // 에러 타입별 메시지 처리
            if (error.code === 'ECONNABORTED') {
                return { 
                    success: false, 
                    error: "서버 응답 시간이 초과되었습니다.\n잠시 후 다시 시도해주세요." 
                };
            } else if (error.response?.status === 401) {
                return { 
                    success: false, 
                    error: "이메일 또는 비밀번호가 일치하지 않습니다." 
                };
            } else if (error.response?.status >= 500) {
                return { 
                    success: false, 
                    error: "서버에 일시적인 문제가 발생했습니다.\n잠시 후 다시 시도해주세요." 
                };
            } else {
                return { 
                    success: false, 
                    error: "네트워크 연결을 확인해주세요." 
                };
            }
        }
    };

    const logout = async () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
    };

    return { login, logout };
};