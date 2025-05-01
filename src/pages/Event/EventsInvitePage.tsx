import { useState } from "react"
import { Link } from "react-router-dom"
import {
    ChevronLeft,
    Gift,
    Copy,
    Share2,
    Check,
} from "lucide-react"

import { Button } from "../../components/ui/button"  // '@/components' → '../components' 등으로 수정
import { Input } from "../../components/ui/input"
import { useToast } from "../../hooks/use-toast"     // '@/hooks' → '../hooks' 등으로 수정
import BottomNavigation from "../../components/bottom-navigation"

export default function InviteEventPage() {
    const [inviteCode] = useState("FRIEND2024")
    const [copied, setCopied] = useState(false)
    const { toast } = useToast()

    // 초대 현황 데이터
    const inviteData = [
        { name: "김철수", date: "2024.04.20", status: "가입완료", reward: "100P 지급완료" },
        { name: "이영희", date: "2024.04.18", status: "가입완료", reward: "100P 지급완료" },
        { name: "박지민", date: "2024.04.15", status: "가입완료", reward: "100P 지급완료" },
    ]

    // 코드 복사 핸들러
    const handleCopyCode = () => {
        navigator.clipboard.writeText(inviteCode)
        setCopied(true)
        toast({
            title: "초대 코드가 복사되었습니다",
            description: "친구에게 공유해보세요!",
        })

        setTimeout(() => setCopied(false), 2000)
    }

    // 공유하기 핸들러
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "카드맵 친구초대",
                text: `카드맵에서 함께해요! 내 초대 코드: ${inviteCode}`,
                url: "https://cardmap.example.com",
            })
        } else {
            toast({
                title: "공유하기를 지원하지 않는 브라우저입니다",
                description: "초대 코드를 복사해서 공유해주세요.",
            })
        }
    }

    return (
        <main className="flex flex-col h-screen max-w-sm mx-auto overflow-hidden">
            {/* 헤더 */}
            <header className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white p-3 flex items-center gap-2">
                <Link to="/events">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-lg font-bold flex-1">친구초대 이벤트</h1>
            </header>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 overflow-auto bg-gradient-to-b from-[#75CB3B]/10 to-white p-4">
                <div className="space-y-6">
                    {/* 이벤트 배너 */}
                    <div className="bg-[#f0f8ff] rounded-lg p-4 text-center">
                        <div className="flex justify-center mb-3">
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                                <Gift className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-lg font-bold text-[#5A3D2B] mb-1">친구와 함께 혜택 받기</h2>
                        <p className="text-sm text-gray-600 mb-4">친구 초대하고 최대 5,000P 받으세요!</p>

                        <div className="flex items-center gap-2 mb-4">
                            <Input value={inviteCode} readOnly className="text-center font-bold text-[#00A949] border-[#75CB3B]/30" />
                            <Button
                                variant="outline"
                                size="icon"
                                className="border-[#75CB3B]/30 text-[#00A949]"
                                onClick={handleCopyCode}
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>

                        <Button
                            className="w-full bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                            onClick={handleShare}
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            친구에게 공유하기
                        </Button>
                    </div>

                    {/* 초대 혜택 */}
                    <div className="bg-[#f8f9fa] rounded-lg p-4">
                        <h3 className="font-bold text-[#5A3D2B] mb-3">초대 혜택</h3>
                        <div className="flex justify-between mb-4">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-[#75CB3B]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="font-bold text-[#00A949]">1명</span>
                                </div>
                                <p className="text-xs text-gray-600">100P</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-[#75CB3B]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="font-bold text-[#00A949]">3명</span>
                                </div>
                                <p className="text-xs text-gray-600">500P</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-[#75CB3B]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="font-bold text-[#00A949]">5명</span>
                                </div>
                                <p className="text-xs text-gray-600">1,000P</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-[#75CB3B]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="font-bold text-[#00A949]">10명</span>
                                </div>
                                <p className="text-xs text-gray-600">5,000P</p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500">* 초대받은 친구가 가입 후 카드 등록 시 포인트가 지급됩니다.</p>
                    </div>

                    {/* 초대 현황 */}
                    <div>
                        <h3 className="font-bold text-[#5A3D2B] mb-3">초대 현황 (3/10명)</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">이름</th>
                                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">가입일</th>
                                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">상태</th>
                                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">리워드</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {inviteData.map((invite, index) => (
                                        <tr key={index}>
                                            <td className="py-2 px-3">{invite.name}</td>
                                            <td className="py-2 px-3">{invite.date}</td>
                                            <td className="py-2 px-3 text-[#00A949]">{invite.status}</td>
                                            <td className="py-2 px-3 text-gray-500">{invite.reward}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* 하단 내비게이션 */}
            <BottomNavigation />
        </main>
    )
}
