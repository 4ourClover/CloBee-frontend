import React, { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button"; // 실제 경로에 맞게 수정
import { Input } from "../components/ui/input"; // 실제 경로에 맞게 수정
import { Label } from "../components/ui/label"; // 실제 경로에 맞게 수정
import { useToast } from "../hooks/use-toast"; // 실제 useToast 훅의 경로 확인
import { CoffeeIcon as KakaoTalk } from "lucide-react"; // lucide-react 설치 필요
import rabbitClover from '../images/rabbit-clover.png';

interface SignupPageProps { }

const SignupPage: React.FC<SignupPageProps> = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSignup = (e: FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "비밀번호 불일치",
                description: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
                variant: "destructive",
            });
            return;
        }

        // 회원가입 로직 구현
        toast({
            title: "회원가입 성공",
            description: "가입이 완료되었습니다. 로그인해주세요.",
        });
        navigate("/login");
    };

    const handleSocialSignup = () => {
        // 카카오 회원가입 로직 구현
        toast({
            title: "카카오 회원가입",
            description: "카카오 회원가입 처리 중...",
        });
    };

    const handleSendVerification = () => {
        if (!email) {
            toast({
                title: "이메일 필요",
                description: "이메일 주소를 입력해주세요.",
                variant: "destructive",
            });
            return;
        }

        setShowVerification(true);
        toast({
            title: "인증번호 발송",
            description: "입력하신 이메일로 인증번호가 발송되었습니다.",
        });
    };

    const handleVerifyCode = () => {
        if (!verificationCode) {
            toast({
                title: "인증번호 필요",
                description: "인증번호를 입력해주세요.",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "인증 완료",
            description: "이메일 인증이 완료되었습니다.",
        });
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#75CB3B]/10 to-white px-4 py-8 font-gmarket">
            <div className="w-full max-w-sm mx-auto">
                {/* 로고 및 캐릭터 */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-[#75CB3B] to-[#00B959] rounded-full flex items-center justify-center">
                        <img
                            src={rabbitClover} // public 폴더 기준 경로
                            alt="혜택클로버 캐릭터"
                            className="rounded-full"
                            width={60}
                            height={60}
                        />
                    </div>
                    <h1 className="text-xl font-bold text-[#00A949] mt-4">회원가입</h1>
                </div>

                {/* 회원가입 폼 */}
                <form className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nickname" className="text-[#5A3D2B]">
                            닉네임
                        </Label>
                        <Input
                            id="nickname"
                            type="text"
                            placeholder="닉네임 입력"
                            value={nickname}
                            //onChange={(e) => setNickname(e.target.value)}
                            className="border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-[#5A3D2B]">
                            이메일
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="email"
                                type="email"
                                placeholder="이메일 주소 입력"
                                value={email}
                                //onChange={(e) => setEmail(e.target.value)}
                                className="border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full"
                                required
                            />
                            <Button
                                type="button"
                                //onClick={handleSendVerification}
                                className="bg-[#00A949] hover:bg-[#009149] rounded-full"
                            >
                                인증
                            </Button>
                        </div>

                        {(
                            <div className="mt-2 space-y-2">
                                <Label htmlFor="verification-code" className="text-[#5A3D2B]">
                                    인증번호
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="verification-code"
                                        type="text"
                                        placeholder="인증번호 입력"
                                        value={verificationCode}
                                        //onChange={(e) => setVerificationCode(e.target.value)}
                                        className="border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full"
                                    />
                                    <Button
                                        type="button"
                                        //onClick={handleVerifyCode}
                                        className="bg-[#00A949] hover:bg-[#009149] rounded-full"
                                    >
                                        확인
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-[#5A3D2B]">
                            비밀번호
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="비밀번호 입력 (8자 이상)"
                            value={password}
                            //onChange={(e) => setPassword(e.target.value)}
                            className="border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full"
                            required
                            minLength={8}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-[#5A3D2B]">
                            비밀번호 확인
                        </Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder="비밀번호 재입력"
                            value={confirmPassword}
                            //onChange={(e) => setConfirmPassword(e.target.value)}
                            className="border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full"
                            required
                            minLength={8}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-5 text-base font-medium bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] text-white rounded-full"
                    >
                        가입하기
                    </Button>
                </form>

                {/* 소셜 회원가입 */}
                <div className="mt-6">
                    <div className="relative flex items-center gap-4 py-2">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <div className="text-xs text-gray-400">소셜 계정으로 가입</div>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90 border-none mt-4 rounded-full"
                        onClick={handleSocialSignup}
                    >
                        <KakaoTalk className="h-5 w-5 mr-2" />
                        카카오로 회원가입
                    </Button>
                </div>

                {/* 로그인 링크 */}
                <div className="text-center mt-6">
                    <span className="text-sm text-gray-500">이미 계정이 있으신가요?</span>{" "}
                    <Link to="/login" className="text-sm text-[#00A949] font-medium hover:underline">
                        로그인
                    </Link>
                </div>

                {/* 로그인 없이 지도로 이동 */}
                <div className="text-center mt-4">
                    <Link to="/map" className="text-sm text-[#00A949] hover:underline">
                        로그인 없이 지도 보기
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default SignupPage;