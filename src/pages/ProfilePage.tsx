import { useState } from "react"
import { Link } from "react-router-dom"
import {
    ChevronLeft,
    Settings,
    Bell,
    LogOut,
    Shield,
    Ticket
} from "lucide-react"

import { Button } from "../components/ui/button"
import { Switch } from "../components/ui/switch"
import { Label } from "../components/ui/label"
import { Separator } from "../components/ui/separator"
import { useToast } from "../hooks/use-toast"
import userIamge from "../images/placeholder.svg"
import BottomNavigation from "../components/bottom-navigation"

export default function ProfilePage() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const { toast } = useToast()

    const user = {
        name: "홍길동",
        email: "user@example.com",
        profileImage: userIamge
    }

    const handleNotificationToggle = (checked: boolean) => {
        setNotificationsEnabled(checked)
        toast({
            title: checked ? "알림이 켜졌습니다" : "알림이 꺼졌습니다",
            description: checked ? "혜택 및 카드 관련 알림을 받습니다" : "더 이상 알림을 받지 않습니다",
            variant: checked ? "default" : "destructive"
        })
    }

    const handleLogout = () => {
        toast({
            title: "로그아웃 되었습니다",
            description: "다음에 또 만나요!"
        })
        // 이후 라우팅 필요시 navigate() 사용
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
                    <img src={user.profileImage} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
                    <div>
                        <h2 className="font-bold text-lg">{user.name}</h2>
                        <p className="text-sm text-gray-500">{user.email}</p>
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
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        로그아웃
                    </Button>
                </div>
            </div>

            <BottomNavigation />
        </main>
    )
}
