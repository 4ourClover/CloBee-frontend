import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button" // <-- 상대 경로로 수정
import { Badge } from "../../components/ui/badge"   // <-- 상대 경로로 수정
import {
    ChevronLeft,
    Check,
} from "lucide-react"
import { Link } from "react-router-dom" // <-- next/link → react-router-dom
import BottomNavigation from "../../components/bottom-navigation"
import { getTotalAttend, addAttend, EventsAttendDetail } from "../../api/event";

export default function AttendanceEventPage() {
    const detail : EventsAttendDetail = {
        userId: 1, // 세션 로그인 불러와야 함
        month: String(new Date().getMonth() + 1).padStart(2, '0')
    };
    // 출석체크 상태 (예시 데이터)
    const [attendanceData, setAttendanceData] = useState<Record<number, boolean>>({ 1: true });

    // 현재 날짜 정보
    const currentDate = new Date()
    const currentDay = currentDate.getDate()
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

    // 오늘 출석체크 여부
    const [todayChecked, setTodayChecked] = useState(attendanceData[currentDay] || false)

    // 출석체크 핸들러
    const handleAttendanceCheck = async () => {
        if (!todayChecked) {
            await addAttend(detail);
            setTodayChecked(true)
            setAttendanceData((prev) => ({
                ...prev,
                [currentDay]: true,
            }))
            setTodayChecked(true);
        }
    }

    // 출석체크 일수 계산
    const totalCheckedDays = Object.values(attendanceData).filter(Boolean).length

    // 달력 데이터 생성
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    const fetchTotalAttend = async () => {
        try {
            const response = await getTotalAttend(detail);
            setAttendanceData(prev => {
                const updated = Object.fromEntries((response.data as number[]).map(day => [day, true]));
                setTodayChecked(!!updated[currentDay]); // 상태 반영 후에 todayChecked 설정
                return updated;
            });
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTotalAttend();
    }, [detail.userId]);

    return (
        <main className="flex flex-col h-screen max-w-sm mx-auto overflow-hidden">
            {/* 헤더 */}
            <header className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white p-3 flex items-center gap-2">
                <Link to="/events">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-lg font-bold flex-1">출석체크 이벤트</h1>
            </header>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 overflow-auto bg-[#F5FAF0] p-4">
                <div className="space-y-6">
                    {/* 출석체크 상태 */}
                    <div className="bg-white rounded-lg p-4 text-center">
                        <h2 className="text-lg font-bold text-[#5A3D2B] mb-2">이번 달 출석체크</h2>
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="text-3xl font-bold text-[#00A949]">{totalCheckedDays}</span>
                            <span className="text-gray-500">/ {daysInMonth}일</span>
                        </div>

                        <div className="flex justify-center gap-2 mb-4">
                            <Badge className="bg-[#75CB3B]/20 text-[#00A949] border-none">5일 연속: 100P</Badge>
                            <Badge className="bg-[#75CB3B]/20 text-[#00A949] border-none">15일 달성: 300P</Badge>
                            <Badge className="bg-[#75CB3B]/20 text-[#00A949] border-none">30일 달성: 1000P</Badge>
                        </div>

                        <Button
                            className={`w-full ${todayChecked
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] text-white"
                                }`}
                            onClick={handleAttendanceCheck}
                            disabled={todayChecked}
                        >
                            {todayChecked ? "오늘 출석완료" : "오늘 출석체크하기"}
                        </Button>
                    </div>

                    {/* 달력 */}
                    <div>
                        <h3 className="font-bold text-[#5A3D2B] mb-3">
                            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                        </h3>
                        <div className="grid grid-cols-7 gap-2">
                            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                                <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
                                    {day}
                                </div>
                            ))}

                            {/* 첫째 날 요일 맞추기 위한 빈 칸 */}
                            {Array.from(
                                { length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() },
                                (_, i) => (
                                    <div key={`empty-${i}`} className="h-10"></div>
                                ),
                            )}

                            {/* 날짜 */}
                            {calendarDays.map((day) => (
                                <div
                                    key={day}
                                    className={`h-10 flex items-center justify-center rounded-full ${attendanceData[day]
                                        ? "bg-[#75CB3B]/20"
                                        : day === currentDay
                                            ? "border border-[#00A949] border-dashed"
                                            : ""
                                        }`}
                                >
                                    <div className="relative">
                                        <span className={`text-sm ${day === currentDay ? "font-bold text-[#00A949]" : ""}`}>{day}</span>
                                        {attendanceData[day] && (
                                            <div className="absolute -top-1 -right-1 text-[#00A949]">
                                                <Check className="h-3 w-3" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 출석체크 혜택 */}
                    <div className="bg-white rounded-lg p-4">
                        <h3 className="font-bold text-[#5A3D2B] mb-2">출석체크 혜택</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-[#00A949] font-bold">•</span>
                                <span>매일 출석체크 시 10포인트 적립</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#00A949] font-bold">•</span>
                                <span>5일 연속 출석 시 보너스 100포인트</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#00A949] font-bold">•</span>
                                <span>15일 달성 시 보너스 300포인트</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#00A949] font-bold">•</span>
                                <span>한 달 모두 출석 시 보너스 1000포인트</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* 하단 내비게이션 */}
            <BottomNavigation />
        </main>
    )
}
