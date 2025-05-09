import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


const Redirection = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const checkSuccessLogin = async () => {
            navigate("/map")
        }

        checkSuccessLogin()
    }, []);
    return <div>로그인 중입니다.</div>;
};
  
export default Redirection;
  