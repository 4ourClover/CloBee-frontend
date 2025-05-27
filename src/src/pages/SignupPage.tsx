import React, { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { CoffeeIcon as KakaoTalk } from "lucide-react";
import rabbitClover from '../images/rabbit-clover.png';
import axiosInstance from "../api/axios/axiosInstance";
import { CheckBox } from "../components/ui/checkbox";
import { containsBadWords } from "../lib/badWordFilter";
import {
    SignupFormData,
    SignupFormErrors,
    SignupStates,
    ModalState
} from "../types/signup";

interface SignupPageProps { }
interface ExistenceResponse {
  exists: boolean;
}
const SignupPage: React.FC<SignupPageProps> = () => {
    // 폼 데이터 상태
    const [formData, setFormData] = useState<SignupFormData>({
        email: "",
        password: "",
        confirmPassword: "",
        nickname: "",
        phoneNumber: "",
        verificationCode: "",
        birthday: "",
        referralCode: "",
        agreeTerms: false
    });

    // 에러 상태
    const [errors, setErrors] = useState<SignupFormErrors>({
        nicknameError: "",
        emailError: "",
        passwordError: "",
        confirmPasswordError: "",
        phoneError: "",
        birthdayError: ""
    });

    // 회원가입 관련 상태
    const [states, setStates] = useState<SignupStates>({
        showVerification: false,
        isPhoneVerified: false,
        isCodeVerified: false,
        isCheckingEmail: false,
        isCheckingPhone: false
    });

    // 모달 상태
    const [modal, setModal] = useState<ModalState>({
        isConfirmModalOpen: false,
        confirmMessage: "",
        onConfirmAction: () => { },
        isSuccess: false
    });

    // 타이머 상태
    const [emailCheckTimer, setEmailCheckTimer] = useState<NodeJS.Timeout | null>(null);
    const [phoneCheckTimer, setPhoneCheckTimer] = useState<NodeJS.Timeout | null>(null);

    const { toast } = useToast();
    const navigate = useNavigate();

    // 폼 데이터 업데이트 함수
    const updateFormData = (key: keyof SignupFormData, value: string | boolean): void => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // 에러 상태 업데이트 함수
    const updateError = (key: keyof SignupFormErrors, value: string): void => {
        setErrors(prev => ({ ...prev, [key]: value }));
    };

    // 상태 업데이트 함수
    const updateState = (key: keyof SignupStates, value: boolean): void => {
        setStates(prev => ({ ...prev, [key]: value }));
    };

    // 닉네임 유효성 검증
    useEffect(() => {
        if (formData.nickname) {
            if (formData.nickname.length < 2 || containsBadWords(formData.nickname)) {
                updateError("nicknameError", "사용할수없는 닉네임 입니다");
            } else {
                updateError("nicknameError", "");
            }
        } else {
            updateError("nicknameError", "");
        }
    }, [formData.nickname]);

    // 이메일 유효성 검증
    useEffect(() => {
        if (formData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                updateError("emailError", "이메일 형식이 올바르지 않습니다");
            } else {
                updateError("emailError", "");
            }
        } else {
            updateError("emailError", "");
        }
    }, [formData.email]);

    // 비밀번호 유효성 검증 (길이)
    useEffect(() => {
        if (formData.password) {
            if (formData.password.length < 8) {
                updateError("passwordError", "비밀번호는 8자 이상이어야 합니다");
            } else {
                updateError("passwordError", "");
            }
        } else {
            updateError("passwordError", "");
        }
    }, [formData.password]);

    // 비밀번호 확인 유효성 검증
    useEffect(() => {
        if (formData.password && formData.confirmPassword) {
            if (formData.password !== formData.confirmPassword) {
                updateError("confirmPasswordError", "비밀번호가 일치하지 않습니다");
            } else {
                updateError("confirmPasswordError", "");
            }
        } else {
            updateError("confirmPasswordError", "");
        }
    }, [formData.password, formData.confirmPassword]);

    // 생년월일 유효성 검증
    useEffect(() => {
        if (formData.birthday) {
            const birthdayDate = new Date(formData.birthday);
            const today = new Date();

            if (isNaN(birthdayDate.getTime())) {
                updateError("birthdayError", "유효한 날짜 형식이 아닙니다");
            } else if (birthdayDate > today) {
                updateError("birthdayError", "미래 날짜는 선택할 수 없습니다");
            } else {
                updateError("birthdayError", "");
            }
        } else {
            updateError("birthdayError", "");
        }
    }, [formData.birthday]);

    // 이메일 중복 체크 함수
    const checkEmailExists = async (): Promise<void> => {
        if (!formData.email || errors.emailError) return;

        try {
            updateState("isCheckingEmail", true);
            const response = await axiosInstance.get<ExistenceResponse>(`/user/check-email?email=${formData.email}`);

            // API는 { exists: true/false } 형태로 응답
            if (response.data?.exists === true) {
                updateError("emailError", "이미 사용중인 이메일 입니다");
            } else {
                updateError("emailError", "");
            }
        } catch (error) {
            console.error("Email check error:", error);
            toast({
                title: "오류",
                description: "이메일 중복 확인 중 오류가 발생했습니다.",
                variant: "destructive"
            });
        } finally {
            updateState("isCheckingEmail", false);
        }
    };

    // 전화번호 중복 체크 함수
    const checkPhoneExists = async (): Promise<void> => {
        if (!formData.phoneNumber || formData.phoneNumber.length < 10) return;

        try {
            updateState("isCheckingPhone", true);
            const response = await axiosInstance.get<ExistenceResponse>(`/user/check-phone?phone=${formData.phoneNumber}`);

            // API는 { exists: true/false } 형태로 응답
            if (response.data?.exists === true) {
                updateError("phoneError", "이미 사용중인 전화번호 입니다");
            } else {
                updateError("phoneError", "");
            }
        } catch (error) {
            console.error("Phone check error:", error);
            toast({
                title: "오류",
                description: "전화번호 중복 확인 중 오류가 발생했습니다.",
                variant: "destructive"
            });
        } finally {
            updateState("isCheckingPhone", false);
        }
    };

    // 모달 헬퍼 함수 추가
    const showConfirmModal = (message: string, onConfirm: () => void = () => { }, success: boolean = false): void => {
        setModal({
            isConfirmModalOpen: true,
            confirmMessage: message,
            onConfirmAction: onConfirm,
            isSuccess: success
        });
    };

    const closeConfirmModal = (): void => {
        setModal(prev => ({ ...prev, isConfirmModalOpen: false }));
    };

    const handleSignup = async (e: FormEvent): Promise<void> => {
        e.preventDefault();

        const { nicknameError, emailError, passwordError, confirmPasswordError, phoneError, birthdayError } = errors;
        if (nicknameError || emailError || passwordError || confirmPasswordError || phoneError || birthdayError) {
            showConfirmModal("입력 내용을 확인해주세요.");
            return;
        }

        if (!states.isPhoneVerified || !states.isCodeVerified) {
            showConfirmModal("전화번호 인증을 진행해주세요.");
            return;
        }

        if (!formData.birthday) {
            showConfirmModal("생년월일을 입력해주세요.");
            return;
        }

        try {
            await axiosInstance.post("/user/signup/email", {
                userLoginType: 102,
                userEmail: formData.email,
                userPassword: formData.password,
                userNickname: formData.nickname,
                userPhone: formData.phoneNumber,
                userBirthday: formData.birthday,
                userAgreedPrivacy: true,
                friendInvitationCode: formData.referralCode
            });

            // 성공 모달 표시
            showConfirmModal(
                "회원가입이 완료되었습니다.\n로그인 페이지로 이동합니다.",
                () => navigate("/login"),
                true
            );
        } catch (error: any) {



            if (error.response && error.response.data) {
                const errorCode = error.response.data.code;

                if (errorCode === "EMAIL_DUPLICATION") {
                    updateError("emailError", "이미 사용중인 이메일 입니다");
                    showConfirmModal("이미 사용중인 이메일 입니다.");
                } else if (errorCode === "PHONE_DUPLICATION") {
                    updateError("phoneError", "이미 사용중인 전화번호 입니다");
                    showConfirmModal("이미 사용중인 전화번호 입니다.");
                } else {
                    showConfirmModal("회원가입 중 오류가 발생했습니다.");
                }
            } else {
                showConfirmModal("서버와의 통신 중 오류가 발생했습니다.");
            }
        }
    };

    const handleSocialLogin = (): void => {
        window.location.href = process.env.REACT_APP_API_BASE_URL + "/oauth2/authorization/kakao";
    }

    const handlePhoneVerification = async (): Promise<void> => {
        if (!formData.phoneNumber) {
            showConfirmModal("전화번호를 입력해주세요.");
            return;
        }

        if (errors.phoneError) {
            showConfirmModal("이미 사용중인 전화번호 입니다.");
            return;
        }

        try {
            const response = await axiosInstance.post(
                "/user/sendPhoneCode",
                null,
                { params: { user_phone: formData.phoneNumber } }
            );

            if (response?.status === 200) {
                updateState("showVerification", true);
                updateState("isPhoneVerified", true);
                toast({
                    title: "인증번호 발송",
                    description: "입력하신 전화번호로 인증번호가 발송되었습니다.",
                });
            } else {
                showConfirmModal("인증번호 발송에 실패했습니다.");
            }
        } catch (err: any) {

            showConfirmModal("서버 오류가 발생했습니다.");
        }
    };

    const handleVerifyCode = async (): Promise<void> => {
        if (!formData.verificationCode) {
            showConfirmModal("인증번호를 입력해주세요.");
            return;
        }

        try {
            const res = await axiosInstance.post("/user/verifyPhoneCode", null, {
                params: {
                    user_phone: formData.phoneNumber,
                    code: formData.verificationCode
                }
            });

            if (res.status === 200) {
                updateState("isCodeVerified", true);
                toast({
                    title: "인증 성공",
                    description: "인증번호 확인이 완료되었습니다.",
                });
            }
        } catch (error) {

            // 인증 실패 시 모달 표시
            showConfirmModal("인증번호가 일치하지 않습니다.", () => {
                updateFormData("verificationCode", "");
            });
        }
    };

    const handleCheckboxChange = (): void => {
        updateFormData("agreeTerms", !formData.agreeTerms);
    };

    // 이메일 입력 핸들러 (타이머 사용)
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newEmail = e.target.value;
        updateFormData("email", newEmail);

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
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newPhone = e.target.value;
        updateFormData("phoneNumber", newPhone);

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
            updateError("phoneError", "");
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
                            value={formData.nickname}
                            onChange={(e) => updateFormData("nickname", e.target.value)}
                            className={`border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full ${errors.nicknameError ? 'border-red-500' : ''}`}
                            required
                        />
                        {errors.nicknameError && (
                            <p className="text-xs text-red-500 mt-1 pl-3">{errors.nicknameError}</p>
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
                                value={formData.email}
                                onChange={handleEmailChange}
                                onBlur={checkEmailExists}
                                className={`border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full ${errors.emailError ? 'border-red-500' : ''}`}
                                required
                            />
                        </div>

                        {errors.emailError && (
                            <p className="text-xs text-red-500 mt-1 pl-3">{errors.emailError}</p>
                        )}

                        {/* 생년월일 필드 추가 */}
                        <div className="mt-2 space-y-2">
                            <Label htmlFor="birthday" className="text-[#5A3D2B]">
                                생년월일
                            </Label>
                            <Input
                                id="birthday"
                                type="date"
                                value={formData.birthday}
                                onChange={(e) => updateFormData("birthday", e.target.value)}
                                className={`border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full ${errors.birthdayError ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.birthdayError && (
                                <p className="text-xs text-red-500 mt-1 pl-3">{errors.birthdayError}</p>
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
                                    value={formData.phoneNumber}
                                    disabled={states.isPhoneVerified}
                                    onChange={handlePhoneChange}
                                    onBlur={checkPhoneExists}
                                    className={`border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full ${errors.phoneError ? 'border-red-500' : ''}`}
                                />
                                <Button
                                    type="button"
                                    onClick={handlePhoneVerification}
                                    className="bg-[#00A949] hover:bg-[#009149] rounded-full"
                                    disabled={states.isPhoneVerified || !!errors.phoneError}
                                >
                                    {states.isPhoneVerified ? "코드 전송완료" : "인증"}
                                </Button>
                            </div>

                            {errors.phoneError && (
                                <p className="text-xs text-red-500 mt-1 pl-3">{errors.phoneError}</p>
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
                                    value={formData.verificationCode}
                                    onChange={(e) => updateFormData("verificationCode", e.target.value)}
                                    className="border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full"
                                    disabled={!states.isPhoneVerified || states.isCodeVerified}
                                />
                                <Button
                                    type="button"
                                    onClick={handleVerifyCode}
                                    className="bg-[#00A949] hover:bg-[#009149] rounded-full"
                                    disabled={!states.isPhoneVerified || states.isCodeVerified}
                                >
                                    {states.isCodeVerified ? "확인됨" : "확인"}
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
                            value={formData.password}
                            onChange={(e) => updateFormData("password", e.target.value)}
                            className={`border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full ${errors.passwordError ? 'border-red-500' : ''}`}
                            required
                            minLength={8}
                        />
                        {errors.passwordError && (
                            <p className="text-xs text-red-500 mt-1 pl-3">{errors.passwordError}</p>
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
                            value={formData.confirmPassword}
                            onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                            className={`border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full ${errors.confirmPasswordError ? 'border-red-500' : ''}`}
                            required
                            minLength={8}
                        />
                        {errors.confirmPasswordError && (
                            <p className="text-xs text-red-500 mt-1 pl-3">{errors.confirmPasswordError}</p>
                        )}
                    </div>

                    {/* 친구초대코드 필드 추가 */}
                    <div className="mt-2 space-y-2">
                        <Label htmlFor="referral-code" className="text-[#5A3D2B]">
                            친구초대코드 <span className="text-xs text-gray-500">(선택사항)</span>
                        </Label>
                        <Input
                            id="referral-code"
                            type="text"
                            placeholder="친구초대코드 입력"
                            value={formData.referralCode}
                            onChange={(e) => updateFormData("referralCode", e.target.value)}
                            className="border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full"
                        />
                    </div>

                    <CheckBox label="약관에 동의합니다."
                        checked={formData.agreeTerms}
                        onCheckedChange={handleCheckboxChange}
                    />

                    <Button
                        type="submit"
                        className="w-full py-5 text-base font-medium bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] text-white rounded-full"
                        disabled={
                            !(states.isCodeVerified && formData.agreeTerms) ||
                            Boolean(errors.nicknameError || errors.emailError || errors.passwordError || errors.confirmPasswordError || errors.phoneError || errors.birthdayError) ||
                            states.isCheckingEmail ||
                            states.isCheckingPhone ||
                            !formData.birthday // 생년월일 입력 여부 확인
                        }
                    >
                        가입하기
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

                {/* 로그인 링크 */}
                <div className="text-center mt-6">
                    <span className="text-sm text-gray-500">이미 계정이 있으신가요?</span>{" "}
                    <Link to="/login" className="text-sm text-[#00A949] font-medium hover:underline">
                        로그인
                    </Link>
                </div>
            </div>

            {/* 확인 모달 */}
            {modal.isConfirmModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
                        {modal.isSuccess && (
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                        <p className="mb-6 text-lg text-gray-800 whitespace-pre-line">
                            {modal.confirmMessage}
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                onClick={() => {
                                    modal.onConfirmAction();
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