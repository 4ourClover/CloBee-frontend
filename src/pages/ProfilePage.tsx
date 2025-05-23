import { useState, useEffect, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
    ChevronLeft,
    Settings,
    Bell,
    LogOut,
    Shield,
    Ticket,
    User
} from "lucide-react"

import { Button } from "../components/ui/button"
import { Switch } from "../components/ui/switch"
import { Label } from "../components/ui/label"
import { Separator } from "../components/ui/separator"
import { useToast } from "../hooks/use-toast"
import BottomNavigation from "../components/bottom-navigation"
import { AuthContext } from "../contexts/AuthContext"

interface UserInfo {
    userId: number;
    userEmail: string;
    userNickname: string;
    // 서버에서 반환하는 다른 필드들도 여기에 추가할 수 있습니다
}

export default function ProfilePage() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const { toast } = useToast()
    const navigate = useNavigate()
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [loading, setLoading] = useState(true)
    
    // AuthContext 사용
    const { setAuth } = useContext(AuthContext)
    
    // 모달 상태 관리
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

    // 사용자 정보 가져오기
    useEffect(() => {
        fetch(process.env.REACT_APP_API_BASE_URL + "/user/me", {
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("로그인이 필요합니다");
                }
                return res.json();
            })
            .then((data) => {
                setUserInfo({
                    userId: data.userId,
                    userEmail: data.userEmail,
                    userNickname: data.userNickname
                });
                setLoading(false);
            })
            .catch((error) => {
                console.error("사용자 정보를 가져오는데 실패했습니다:", error);
                setLoading(false);
            });
    }, []);

    const handleNotificationToggle = (checked: boolean) => {
        setNotificationsEnabled(checked)
        toast({
            title: checked ? "알림이 켜졌습니다" : "알림이 꺼졌습니다",
            description: checked ? "혜택 및 카드 관련 알림을 받습니다" : "더 이상 알림을 받지 않습니다",
            variant: checked ? "default" : "destructive"
        })
    }
    
    // 모달 헬퍼 함수
    const showConfirmModal = (message: string, onConfirm: () => void) => {
        setConfirmMessage(message);
        setOnConfirmAction(() => onConfirm);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
    };
    
    // 로그아웃 확인 모달 표시
    const showLogoutConfirmation = () => {
        showConfirmModal("로그아웃 하시겠습니까?", performLogout);
    };

    // 실제 로그아웃 처리 함수
    const performLogout = async () => {
        try {
            // 서버에 로그아웃 요청 보내기
            const response = await fetch(process.env.REACT_APP_API_BASE_URL + "/user/logout", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            // 로컬 상태 초기화
            setUserInfo(null);
            
            // 인증 상태 업데이트 
            setAuth(false);
            
            // 쿠키 삭제
            document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            
            // 로컬 스토리지 및 세션 스토리지 초기화
            localStorage.removeItem("user");
            localStorage.removeItem("isAuthenticated");
            sessionStorage.clear();
            
            toast({
                title: "로그아웃 되었습니다",
                description: "다음에 또 만나요!"
            });
            
            // 페이지 리로드 후 리다이렉트 (중요)
            window.location.href = "/";
        } catch (error) {
            console.error("로그아웃 중 오류 발생:", error);
            
            // 오류가 발생해도 인증 상태 업데이트
            setAuth(false);
            
            // 쿠키, 로컬 스토리지 삭제
            document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            localStorage.removeItem("user");
            localStorage.removeItem("isAuthenticated");
            sessionStorage.clear();
            
            toast({
                title: "로그아웃 처리 중 오류가 발생했습니다",
                description: "하지만 로그아웃은 처리되었습니다.",
                variant: "destructive"
            });
            
            // 페이지 리로드 후 리다이렉트 (중요)
            window.location.href = "/";
        }
    }

    // 로딩 중 표시
    if (loading) {
        return (
            <main className="flex flex-col h-full max-w-[1170px] mx-auto overflow-hidden font-gmarket">
                <header className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white p-1.5 flex items-center gap-2">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-6 w-6">
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                    <h1 className="text-base font-bold flex-1">내 정보</h1>
                    <Link to="/settings">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-6 w-6">
                            <Settings className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </header>
                <div className="flex-1 flex items-center justify-center">
                    <p>로딩 중...</p>
                </div>
                <BottomNavigation />
            </main>
        );
    }

    return (
        <main className="flex flex-col h-full max-w-[1170px] mx-auto overflow-hidden font-gmarket">
            {/* 헤더 */}
            <header className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white p-1.5 flex items-center gap-2">
                <Link to="/">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-6 w-6">
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                </Link>
                <h1 className="text-base font-bold flex-1">내 정보</h1>
                <Link to="/settings">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-6 w-6">
                        <Settings className="h-3.5 w-3.5" />
                    </Button>
                </Link>
            </header>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 overflow-auto bg-[#F5FAF0]">
                <div className="bg-white p-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#E0F2E0] flex items-center justify-center">
                        <User className="h-8 w-8 text-[#75CB3B]" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">{userInfo?.userNickname || "사용자"}</h2>
                        <p className="text-sm text-gray-500">{userInfo?.userEmail || "이메일 정보 없음"}</p>
                    </div>
                </div>

                <div className="mt-4 bg-white p-4 space-y-4">
                    <h3 className="font-medium text-[#5A3D2B]">설정</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-[#00A949]" />
                                <Label htmlFor="notifications" className="text-sm">알림 설정</Label>
                            </div>
                            <Switch
                                id="notifications"
                                checked={notificationsEnabled}
                                onCheckedChange={handleNotificationToggle}
                            />
                        </div>

                        <Separator />

                        <Link to="/profile/coupons" className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-3">
                                <Ticket className="h-5 w-5 text-[#00A949]" />
                                <span className="text-sm">쿠폰 관리</span>
                            </div>
                            <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180" />
                        </Link>

                        <Separator />

                        <Link to="/profile/privacy" className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-[#00A949]" />
                                <span className="text-sm">개인정보 보호</span>
                            </div>
                            <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180" />
                        </Link>
                    </div>
                </div>

                <div className="mt-4 bg-white p-4 space-y-4">
                    <h3 className="font-medium text-[#5A3D2B]">앱 정보</h3>

                    <div className="space-y-4">
                        <Link to="/terms" className="flex items-center justify-between py-1">
                            <span className="text-sm">이용약관</span>
                            <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180" />
                        </Link>

                        <Separator />

                        <Link to="/privacy-policy" className="flex items-center justify-between py-1">
                            <span className="text-sm">개인정보 처리방침</span>
                            <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180" />
                        </Link>

                        <Separator />

                        <div className="flex items-center justify-between py-1">
                            <span className="text-sm">앱 버전</span>
                            <span className="text-sm text-gray-500">1.0.0</span>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <Button
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={showLogoutConfirmation}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        로그아웃
                    </Button>
                </div>
            </div>

            {/* 확인 모달 */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
                        <p className="mb-6 text-lg text-gray-800 whitespace-pre-line">
                            {confirmMessage}
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                                onClick={closeConfirmModal}
                            >
                                취소
                            </button>
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-red-600 transition"
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

            <BottomNavigation />
        </main>
    )
}