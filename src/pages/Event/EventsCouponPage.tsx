import { useState } from "react"
import { Link } from "react-router-dom"

import {
    ChevronLeft,
    MapPin,
    CreditCard,
    Calendar,
    User,
    Clover,
    Camera,
    Check,
} from "lucide-react"

import { Button } from "../../components/ui/button"      // '@/components/ui/button'
import { useToast } from "../../hooks/use-toast"         // '@/hooks/use-toast'
import { Badge } from "../../components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog"


export default function EventsCouponPage() {
    const [cloverLeaves, setCloverLeaves] = useState(1) // 초기에는 1개의 잎만 채워짐
    const [showCamera, setShowCamera] = useState(false)
    const { toast } = useToast()

    // 매장 인증 핸들러
    const handleStoreVerification = () => {
        setShowCamera(true)
    }

    // 매장 인증 완료 핸들러
    const handleVerificationComplete = () => {
        setShowCamera(false)

        if (cloverLeaves < 4) {
            setCloverLeaves((prev) => prev + 1)

            toast({
                title: "매장 인증 완료!",
                description: `클로버 잎이 ${cloverLeaves + 1}개가 되었습니다.`,
            })

            if (cloverLeaves + 1 === 4) {
                setTimeout(() => {
                    toast({
                        title: "축하합니다!",
                        description: "클로버를 모두 채웠습니다. 쿠폰이 발급되었습니다!",
                    })
                }, 1000)
            }
        }
    }

    // 참여 매장 목록
    const participatingStores = [
        {
            name: "스타벅스",
            category: "카페",
            benefit: "아메리카노 1+1",
        },
        {
            name: "CGV",
            category: "영화",
            benefit: "팝콘 무료 업그레이드",
        },
        {
            name: "올리브영",
            category: "쇼핑",
            benefit: "전 상품 15% 할인",
        },
        {
            name: "버거킹",
            category: "음식점",
            benefit: "와퍼 세트 30% 할인",
        },
    ]

    return (
        <main className="flex flex-col h-screen max-w-sm mx-auto overflow-hidden">
            {/* 헤더 */}
            <header className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white p-3 flex items-center gap-2">
                <Link to="/events">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-lg font-bold flex-1">클로버 쿠폰 받기</h1>
            </header>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 overflow-auto bg-[#F5FAF0] p-4">
                <div className="space-y-6">
                    {/* 클로버 상태 */}
                    <div className="bg-white rounded-lg p-6 text-center">
                        <h2 className="text-lg font-bold text-[#5A3D2B] mb-4">클로버 채우기</h2>

                        <div className="relative w-40 h-40 mx-auto mb-4">
                            {/* 클로버 배경 (회색) */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Clover className="w-full h-full text-gray-200" />
                            </div>

                            {/* 채워진 클로버 잎 */}
                            <div className="absolute inset-0">
                                <svg viewBox="0 0 24 24" className="w-full h-full">
                                    {/* 왼쪽 위 잎 */}
                                    {cloverLeaves >= 1 && (
                                        <path
                                            d="M12 7C12 7 10 2 7 2C4 2 2 4 2 7C2 10 7 12 7 12"
                                            fill="#00A949"
                                            stroke="#00A949"
                                            strokeWidth="1"
                                        />
                                    )}

                                    {/* 오른쪽 위 잎 */}
                                    {cloverLeaves >= 2 && (
                                        <path
                                            d="M12 7C12 7 14 2 17 2C20 2 22 4 22 7C22 10 17 12 17 12"
                                            fill="#00A949"
                                            stroke="#00A949"
                                            strokeWidth="1"
                                        />
                                    )}

                                    {/* 왼쪽 아래 잎 */}
                                    {cloverLeaves >= 3 && (
                                        <path
                                            d="M12 17C12 17 10 22 7 22C4 22 2 20 2 17C2 14 7 12 7 12"
                                            fill="#00A949"
                                            stroke="#00A949"
                                            strokeWidth="1"
                                        />
                                    )}

                                    {/* 오른쪽 아래 잎 */}
                                    {cloverLeaves >= 4 && (
                                        <path
                                            d="M12 17C12 17 14 22 17 22C20 22 22 20 22 17C22 14 17 12 17 12"
                                            fill="#00A949"
                                            stroke="#00A949"
                                            strokeWidth="1"
                                        />
                                    )}

                                    {/* 줄기 */}
                                    <path d="M12 12L12 22" stroke="#00A949" strokeWidth="1" fill="none" />
                                </svg>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            {cloverLeaves < 4
                                ? `${cloverLeaves}/4 잎 채움 - 참여 매장을 방문하고 인증하여 클로버를 완성하세요!`
                                : "클로버를 모두 채웠습니다! 쿠폰을 받아가세요."}
                        </p>

                        {cloverLeaves < 4 ? (
                            <Button
                                className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                                onClick={handleStoreVerification}
                            >
                                매장 인증하기
                            </Button>
                        ) : (
                            <Button className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC000] hover:to-[#FF8C00] text-white">
                                쿠폰 받기
                            </Button>
                        )}
                    </div>

                    {/* 참여 매장 목록 */}
                    <div>
                        <h3 className="font-bold text-[#5A3D2B] mb-3">참여 매장</h3>
                        <div className="space-y-3">
                            {participatingStores.map((store, index) => (
                                <div key={index} className="bg-white rounded-lg p-3 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-[#5A3D2B]">{store.name}</h4>
                                        <Badge className="mt-1 bg-[#75CB3B]/20 text-[#00A949] border-none">{store.category}</Badge>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-[#00A949] font-medium">{store.benefit}</p>
                                        <p className="text-xs text-gray-500 mt-1">클로버 1잎 적립</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 이벤트 설명 */}
                    <div className="bg-white rounded-lg p-4">
                        <h3 className="font-bold text-[#5A3D2B] mb-2">이벤트 안내</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-[#00A949] font-bold">•</span>
                                <span>참여 매장을 방문하고 인증하면 클로버 잎이 하나씩 채워집니다.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#00A949] font-bold">•</span>
                                <span>클로버 4잎을 모두 채우면 랜덤 쿠폰을 받을 수 있습니다.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#00A949] font-bold">•</span>
                                <span>매장 인증은 매장 내에서만 가능합니다.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#00A949] font-bold">•</span>
                                <span>이벤트 기간: 2024.04.01 ~ 2024.05.31</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* 매장 인증 카메라 모달 */}
            <Dialog open={showCamera} onOpenChange={setShowCamera}>
                <DialogContent className="max-w-sm mx-auto">
                    <DialogHeader>
                        <DialogTitle>매장 인증</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-gray-100 rounded-lg aspect-square flex flex-col items-center justify-center">
                            <Camera className="h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">매장 내 QR코드를 스캔하세요</p>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-4">매장에 있는 QR 코드를 스캔하여 방문을 인증하세요.</p>

                            {/* 데모 목적으로 인증 완료 버튼 추가 */}
                            <Button
                                className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                                onClick={handleVerificationComplete}
                            >
                                <Check className="h-4 w-4 mr-2" />
                                인증 완료 (데모)
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 하단 내비게이션 */}
            <div className="bg-white border-t py-2 px-4 flex justify-around">
                <Link to="/map">
                    <Button variant="ghost" className="flex flex-col items-center h-auto py-1 rounded-full">
                        <MapPin className="h-6 w-6" />
                        <span className="text-[10px] mt-0.5">지도</span>
                    </Button>
                </Link>
                <Link to="/cards">
                    <Button variant="ghost" className="flex flex-col items-center text-[#00A949] h-auto py-1 rounded-full">
                        <CreditCard className="h-6 w-6" />
                        <span className="text-[10px] mt-0.5">내 카드</span>
                    </Button>
                </Link>
                <Link to="/events">
                    <Button variant="ghost" className="flex flex-col items-center h-auto py-1 rounded-full">
                        <Calendar className="h-6 w-6" />
                        <span className="text-[10px] mt-0.5">이벤트</span>
                    </Button>
                </Link>
                <Link to="/profile">
                    <Button variant="ghost" className="flex flex-col items-center h-auto py-1 rounded-full">
                        <User className="h-6 w-6" />
                        <span className="text-[10px] mt-0.5">내 정보</span>
                    </Button>
                </Link>
            </div>
        </main>
    )
}
