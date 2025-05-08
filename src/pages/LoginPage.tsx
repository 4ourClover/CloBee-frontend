import React, { FormEventHandler, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useToast } from "../hooks/use-toast"
import { CoffeeIcon as KakaoTalk } from "lucide-react"
import rabbitClover from '../images/rabbit-clover.png';
import { useAuthActions } from "../hooks/use-auth-action"
import { CheckBox } from "../components/ui/checkbox"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const { toast } = useToast()
    const navigate = useNavigate()
    const authAction = useAuthActions()

    const [autoLogin, setAutoLogin] = useState(false);

    const handleCheckboxChange = () => {
      setAutoLogin(!autoLogin);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        // toast({
        //     title: "로그인 성공",
        //     description: "환영합니다!",
        // })
        await authAction.login(email, password, autoLogin)
    }

    const handleSocialLogin = () => {
        // toast({
        //     title: "카카오 로그인",
        //     description: "카카오 로그인 처리 중...",
        // })
        // navigate("/map")
        
    
        window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
    
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#75CB3B]/10 to-white px-4 py-8 font-gmarket">
            <div className="w-full max-w-sm mx-auto">
                {/* 로고 및 캐릭터 */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-[#75CB3B] to-[#00B959] rounded-full flex items-center justify-center overflow-hidden">
                        <img
                            src={rabbitClover}
                            alt="혜택클로버 캐릭터"
                            className="rounded-full"
                            width={60}
                            height={60}
                        />
                    </div>
                    <p className="text-sm text-center text-[#5A3D2B]/80 mt-4 px-6 leading-relaxed">
                        혜택 클로버앱에 로그인하고
                        <br />더 많은 서비스를 이용해 보세요
                    </p>
                </div>

                {/* 로그인 폼 */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label htmlFor="email" className="text-[#5A3D2B]">
                                이메일
                            </Label>
                        </div>
                        <Input
                            id="email"
                            type="email"
                            placeholder="이메일 주소 입력"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full"
                            required
                        />
                        <div className="text-right">
                            <Link to="/forgot-email" className="text-xs text-[#00A949] hover:underline">
                                이메일 찾기
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label htmlFor="password" className="text-[#5A3D2B]">
                                비밀번호
                            </Label>

                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="비밀번호 입력"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full"
                            required
                        />
                        <div className="text-right">
                            <Link to="/forgot-password" className="text-xs text-[#00A949] hover:underline">
                                비밀번호 찾기
                            </Link>
                        </div>
                    </div>

                    <CheckBox label="자동 로그인" 
                        checked={autoLogin}
                        onCheckedChange={handleCheckboxChange}
                    />
                    
                    <Button
                        type="submit"
                        className="w-full py-5 text-base font-medium bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] text-white rounded-full"
                    >
                        로그인
                    </Button>
                </form>

                {/* 소셜 로그인 */}
                <div className="mt-6">
                    <div className="relative flex items-center gap-4 py-2">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <div className="text-xs text-gray-400">소셜 계정으로 로그인</div>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90 border-none mt-4 rounded-full"
                        onClick={handleSocialLogin}
                    >
                        <KakaoTalk className="h-5 w-5 mr-2" />
                        카카오로 로그인
                    </Button>
                </div>

                {/* 회원가입 링크 */}
                <div className="text-center mt-6">
                    <span className="text-sm text-gray-500">아직 계정이 없으신가요?</span>{" "}
                    <Link to="/signup" className="text-sm text-[#00A949] font-medium hover:underline">
                        회원가입
                    </Link>
                </div>

                {/* 로그인 없이 지도 보기 */}
                <div className="text-center mt-4">
                    <Link to="/map" className="text-sm text-[#00A949] hover:underline">
                        로그인 없이 지도 보기
                    </Link>
                </div>
            </div>
        </main>
    )
}
