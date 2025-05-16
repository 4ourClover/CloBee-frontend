import React, { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button"; 
import { Input } from "../components/ui/input"; 
import { Label } from "../components/ui/label"; 
import { useToast } from "../hooks/use-toast"; 
import { CoffeeIcon as KakaoTalk } from "lucide-react";
import rabbitClover from '../images/rabbit-clover.png';
import axiosInstance from "../lib/axiosInstance";
import { CheckBox } from "../components/ui/checkbox";
import { containsBadWords } from "../lib/badWordFilter";

interface SignupPageProps { }

const SignupPage: React.FC<SignupPageProps> = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [isCodeVerified, setIsCodeVerified] = useState(false);
    const [birthday, setBirthday] = useState(""); // 생년월일 상태 추가
    const { toast } = useToast();
    const navigate = useNavigate();
    
    // 유효성 검증 에러 상태 추가
    const [nicknameError, setNicknameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [birthdayError, setBirthdayError] = useState(""); // 생년월일 에러 상태 추가
    
    // 타이핑 타이머
    const [emailCheckTimer, setEmailCheckTimer] = useState<NodeJS.Timeout | null>(null);
    const [phoneCheckTimer, setPhoneCheckTimer] = useState<NodeJS.Timeout | null>(null);
    
    // 체크 중 상태
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isCheckingPhone, setIsCheckingPhone] = useState(false);
    
    // 모달 상태 추가
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState<string>("");
    const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});
    const [isSuccess, setIsSuccess] = useState(false);

    // 닉네임 유효성 검증
    useEffect(() => {
        if (nickname) {
            if (nickname.length < 2 || containsBadWords(nickname)) {
                setNicknameError("사용할수없는 닉네임 입니다");
            } else {
                setNicknameError("");
            }
        } else {
            setNicknameError("");
        }
    }, [nickname]);

    // 이메일 유효성 검증
    useEffect(() => {
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setEmailError("이메일 형식이 올바르지 않습니다");
            } else {
                setEmailError("");
            }
        } else {
            setEmailError("");
        }
    }, [email]);

    // 비밀번호 유효성 검증 (길이)
    useEffect(() => {
        if (password) {
            if (password.length < 8) {
                setPasswordError("비밀번호는 8자 이상이어야 합니다");
            } else {
                setPasswordError("");
            }
        } else {
            setPasswordError("");
        }
    }, [password]);

    // 비밀번호 확인 유효성 검증
    useEffect(() => {
        if (password && confirmPassword) {
            if (password !== confirmPassword) {
                setConfirmPasswordError("비밀번호가 일치하지 않습니다");
            } else {
                setConfirmPasswordError("");
            }
        } else {
            setConfirmPasswordError("");
        }
    }, [password, confirmPassword]);

    // 생년월일 유효성 검증
    useEffect(() => {
        if (birthday) {
            const birthdayDate = new Date(birthday);
            const today = new Date();
            
            if (isNaN(birthdayDate.getTime())) {
                setBirthdayError("유효한 날짜 형식이 아닙니다");
            } else if (birthdayDate > today) {
                setBirthdayError("미래 날짜는 선택할 수 없습니다");
            } else {
                setBirthdayError("");
            }
        } else {
            setBirthdayError("");
        }
    }, [birthday]);

    // 이메일 중복 체크 함수
    const checkEmailExists = async () => {
        if (!email || emailError) return;
        
        try {
            setIsCheckingEmail(true);
            const response = await axiosInstance.get(`/user/check-email?email=${email}`);
            if (response.data.exists) {
                setEmailError("이미 사용중인 이메일 입니다");
            }
        } catch (error) {
            console.error("이메일 중복 체크 중 오류 발생:", error);
        } finally {
            setIsCheckingEmail(false);
        }
    };

    // 전화번호 중복 체크 함수
    const checkPhoneExists = async () => {
        if (!phoneNumber || phoneNumber.length < 10) return;
        
        try {
            setIsCheckingPhone(true);
            const response = await axiosInstance.get(`/user/check-phone?phone=${phoneNumber}`);
            if (response.data.exists) {
                setPhoneError("이미 사용중인 전화번호 입니다");
            } else {
                setPhoneError("");
            }
        } catch (error) {
            console.error("전화번호 중복 체크 중 오류 발생:", error);
        } finally {
            setIsCheckingPhone(false);
        }
    };

    // 모달 헬퍼 함수 추가
    const showConfirmModal = (message: string, onConfirm: () => void = () => {}, success: boolean = false) => {
        setConfirmMessage(message);
        setOnConfirmAction(() => onConfirm);
        setIsSuccess(success);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
    };

    const handleSignup = async (e: FormEvent) => {
        e.preventDefault();

        if (nicknameError || emailError || passwordError || confirmPasswordError || phoneError || birthdayError) {
            showConfirmModal("입력 내용을 확인해주세요.");
            return;
        }

        if (!isPhoneVerified || !isCodeVerified) {
            showConfirmModal("전화번호 인증을 진행해주세요.");
            return;
        }

        if (!birthday) {
            showConfirmModal("생년월일을 입력해주세요.");
            return;
        }

        try {
            await axiosInstance.post("/user/signup/email", {
                userLoginType: 102,
                userEmail: email,
                userPassword: password,
                userNickname: nickname,
                userPhone: phoneNumber,
                userBirthday: birthday, // 생년월일 추가
                userAgreedPrivacy: true,
            });

            // 성공 모달 표시
            showConfirmModal(
                "회원가입이 완료되었습니다.\n로그인 페이지로 이동합니다.", 
                () => navigate("/login"),
                true
            );
        } catch (error: any) {
            console.error("회원가입 오류:", error);
            
            if (error.response && error.response.data) {
                const errorCode = error.response.data.code;
                
                if (errorCode === "EMAIL_DUPLICATION") {
                    setEmailError("이미 사용중인 이메일 입니다");
                    showConfirmModal("이미 사용중인 이메일 입니다.");
                } else if (errorCode === "PHONE_DUPLICATION") {
                    setPhoneError("이미 사용중인 전화번호 입니다");
                    showConfirmModal("이미 사용중인 전화번호 입니다.");
                } else {
                    showConfirmModal("회원가입 중 오류가 발생했습니다.");
                }
            } else {
                showConfirmModal("서버와의 통신 중 오류가 발생했습니다.");
            }
        }
    };

    const handleSocialLogin = () => {
        window.location.href = "http://localhost:8080/api/oauth2/authorization/kakao";
    }

    const handlePhoneVerification = async () => {
        if (!phoneNumber) {
          showConfirmModal("전화번호를 입력해주세요.");
          return;
        }

        if (phoneError) {
          showConfirmModal("이미 사용중인 전화번호 입니다.");
          return;
        }
      
        try {
          const response = await axiosInstance.post(
            "/user/sendPhoneCode",
            null,
            { params: { user_phone: phoneNumber } }
          );
          
          if (response?.status === 200) {
            setShowVerification(true);
            setIsPhoneVerified(true);
            toast({
              title: "인증번호 발송",
              description: "입력하신 전화번호로 인증번호가 발송되었습니다.",
            });
          } else {
            showConfirmModal("인증번호 발송에 실패했습니다.");
          }
        } catch (err: any) {
          console.error(err);
          showConfirmModal("서버 오류가 발생했습니다.");
        }
    };
      
    const handleVerifyCode = async () => {
        if (!verificationCode) {
            showConfirmModal("인증번호를 입력해주세요.");
            return;
        }

        try {      
            const res = await axiosInstance.post("/user/verifyPhoneCode", null, {
                params: {
                    user_phone: phoneNumber,
                    code: verificationCode
                }
            });
            
            if (res.status === 200) {
                setIsCodeVerified(true);
                toast({
                    title: "인증 성공",
                    description: "인증번호 확인이 완료되었습니다.",
                });
            }
        } catch (error) {
            console.log("error", error);
            // 인증 실패 시 모달 표시
            showConfirmModal("인증번호가 일치하지 않습니다.", () => {
                setVerificationCode("");
            });
        }
    };

    const [agreeTerms, setagreeTerms] = useState(false);

    const handleCheckboxChange = () => {
        setagreeTerms(!agreeTerms);
    };

    // 이메일 입력 핸들러 (타이머 사용)
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        
        // 기본 이메일 형식 유효성 검사는 useEffect에서 처리됨
        
        // 이메일 형식이 유효한 경우에만 중복 체크
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(newEmail)) {
            // 이전 타이머가 있으면 취소
            if (emailCheckTimer) clearTimeout(emailCheckTimer);
            
            // 새로운 타이머 설정 (사용자가 타이핑을 멈추고 500ms 후 중복 체크)
            const timer = setTimeout(() => {
                checkEmailExists();
            }, 500);
            
            setEmailCheckTimer(timer);
        }
    };

    // 전화번호 입력 핸들러 (타이머 사용)
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPhone = e.target.value;
        setPhoneNumber(newPhone);
        
        // 전화번호 형식이 유효한 경우에만 중복 체크
        if (newPhone.length >= 10) {
            // 이전 타이머가 있으면 취소
            if (phoneCheckTimer) clearTimeout(phoneCheckTimer);
            
            // 새로운 타이머 설정 (사용자가 타이핑을 멈추고 500ms 후 중복 체크)
            const timer = setTimeout(() => {
                checkPhoneExists();
            }, 500);
            
            setPhoneCheckTimer(timer);
        } else {
            setPhoneError("");
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#75CB3B]/10 to-white px-4 py-8 font-gmarket">
            <div className="w-full max-w-sm mx-auto">
                {/* 로고 및 캐릭터 */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-[#75CB3B] to-[#00B959] rounded-full flex items-center justify-center">
                        <img
                            src={rabbitClover}
                            alt="혜택클로버 캐릭터"
                            className="rounded-full"
                            width={60}
                            height={60}
                        />
                    </div>
                    <h1 className="text-xl font-bold text-[#00A949] mt-4">회원가입</h1>
                </div>

                {/* 회원가입 폼 */}
                <form className="space-y-4" onSubmit={handleSignup}>
                    <div className="space-y-2">
                        <Label htmlFor="nickname" className="text-[#5A3D2B]">
                            닉네임
                        </Label>
                        <Input
                            id="nickname"
                            type="text"
                            placeholder="닉네임 입력"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className={`border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full ${nicknameError ? 'border-red-500' : ''}`}
                            required
                        />
                        {nicknameError && (
                            <p className="text-xs text-red-500 mt-1 pl-3">{nicknameError}</p>
                        )}
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
                                onChange={handleEmailChange}
                                onBlur={checkEmailExists}
                                className={`border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full ${emailError ? 'border-red-500' : ''}`}
                                required
                            />
                        </div>

                        {emailError && (
                            <p className="text-xs text-red-500 mt-1 pl-3">{emailError}</p>
                        )}

                        {/* 생년월일 필드 추가 */}
                        <div className="mt-2 space-y-2">
                            <Label htmlFor="birthday" className="text-[#5A3D2B]">
                                생년월일
                            </Label>
                            <Input
                                id="birthday"
                                type="date"
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                                className={`border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full ${birthdayError ? 'border-red-500' : ''}`}
                                required
                            />
                            {birthdayError && (
                                <p className="text-xs text-red-500 mt-1 pl-3">{birthdayError}</p>
                            )}
                        </div>

                        <div className="mt-2 space-y-2">
                            <Label htmlFor="phone-number" className="text-[#5A3D2B]">
                                전화번호
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="phone-number"
                                    type="tel"
                                    placeholder="전화번호 입력"
                                    value={phoneNumber}
                                    disabled={isPhoneVerified}
                                    onChange={handlePhoneChange}
                                    onBlur={checkPhoneExists}
                                    className={`border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full ${phoneError ? 'border-red-500' : ''}`}
                                />
                                <Button
                                    type="button"
                                    onClick={handlePhoneVerification}
                                    className="bg-[#00A949] hover:bg-[#009149] rounded-full"
                                    disabled={isPhoneVerified || !!phoneError}
                                >
                                    {isPhoneVerified ? "코드 전송완료" : "인증"}
                                </Button>
                            </div>

                            {phoneError && (
                                <p className="text-xs text-red-500 mt-1 pl-3">{phoneError}</p>
                            )}
                        </div>
                        
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
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full"
                                    disabled={!isPhoneVerified || isCodeVerified}
                                />
                                <Button
                                    type="button"
                                    onClick={handleVerifyCode}
                                    className="bg-[#00A949] hover:bg-[#009149] rounded-full"
                                    disabled={!isPhoneVerified || isCodeVerified}
                                >
                                    {isCodeVerified ? "확인됨" : "확인"}
                                </Button>
                            </div>
                        </div>
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
                            onChange={(e) => setPassword(e.target.value)}
                            className={`border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full ${passwordError ? 'border-red-500' : ''}`}
                            required
                            minLength={8}
                        />
                        {passwordError && (
                            <p className="text-xs text-red-500 mt-1 pl-3">{passwordError}</p>
                        )}
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
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full ${confirmPasswordError ? 'border-red-500' : ''}`}
                            required
                            minLength={8}
                        />
                        {confirmPasswordError && (
                            <p className="text-xs text-red-500 mt-1 pl-3">{confirmPasswordError}</p>
                        )}
                    </div>

                    <CheckBox label="약관에 동의합니다." 
                        checked={agreeTerms}
                        onCheckedChange={handleCheckboxChange}
                    />

                    <Button
                        type="submit"
                        className="w-full py-5 text-base font-medium bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] text-white rounded-full"
                        disabled={
                            !(isCodeVerified && agreeTerms) || 
                            Boolean(nicknameError || emailError || passwordError || confirmPasswordError || phoneError || birthdayError) ||
                            isCheckingEmail || 
                            isCheckingPhone ||
                            !birthday // 생년월일 입력 여부 확인
                        } 
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
                        onClick={handleSocialLogin}
                    >
                        <KakaoTalk className="h-5 w-5 mr-2" />
                        카카오로 로그인
                    </Button>
                </div>

                {/* 로그인 링크 */}
                <div className="text-center mt-6">
                    <span className="text-sm text-gray-500">이미 계정이 있으신가요?</span>{" "}
                    <Link to="/login" className="text-sm text-[#00A949] font-medium hover:underline">
                        로그인
                    </Link>
                </div>
            </div>
            
            {/* 확인 모달 */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
                        {isSuccess && (
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                        <p className="mb-6 text-lg text-gray-800 whitespace-pre-line">
                            {confirmMessage}
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                onClick={() => {
                                    onConfirmAction();
                                    closeConfirmModal();
                                }}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default SignupPage;