import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Redirection = () => {
    const navigate = useNavigate();
    const { isAuthenticated, checkAuth } = useContext(AuthContext);
    
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                // AuthContext의 checkAuth 함수를 사용하여 인증 상태 확인
                const isLoggedIn = await checkAuth();
                
                if (isLoggedIn) {
                    console.log("로그인 상태 확인: 로그인됨");
                    navigate("/map");
                } else {
                    console.log("로그인 상태 확인: 로그인되지 않음");
                    navigate("/login");
                }
            } catch (error) {
                console.error("로그인 상태 확인 중 오류:", error);
                navigate("/login");
            }
        };

        checkLoginStatus();
    }, [navigate, checkAuth]);
    
    return <div>인증 상태 확인 중...</div>;
};
  
export default Redirection;

