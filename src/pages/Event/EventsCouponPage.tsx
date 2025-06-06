import { useState } from "react"
import { Link } from "react-router-dom"

import {
    ChevronLeft,
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
import BottomNavigation from "../../components/bottom-navigation"

// 이미지 import
import clover0 from "../../images/clover-0.png"
import clover1 from "../../images/clover-1.png"
import clover2 from "../../images/clover-2.png"
import clover3 from "../../images/clover-3.png"
import clover4 from "../../images/clover-4.png"

export default function EventsCouponPage() {
    const [cloverLeaves, setCloverLeaves] = useState(1) // 초기에는 1개의 잎만 채워짐
    const [showCamera, setShowCamera] = useState(false)
    const { toast } = useToast();
    const [selectedStore, setSelectedStore] = useState<number | null>(null);
    const [storeList, setStoreList] = useState([
        { name: "스타벅스 강남점", date: "2024.06.05", status: "인증" },
        { name: "투썸플레이스 역삼점", date: "2024.06.04", status: "인증" },
        { name: "컴포즈커피 선릉점", date: "2024.06.03", status: "인증" },
        { name: "이디야커피 테헤란점", date: "2024.06.02", status: "인증" }
    ]);

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
                description: `네잎 클로버의 잎이 ${cloverLeaves + 1}개가 되었습니다.`,
            })

            if (cloverLeaves + 1 === 4) {
                setTimeout(() => {
                    toast({
                        title: "축하합니다!",
                        description: "네잎 클로버의 잎을 모두 채웠습니다. 쿠폰이 발급되었습니다!",
                    })
                }, 1000)
            }
        }
    }

    // 매장 선택 핸들러
    const handleStoreSelect = (index : number) : void => {
        setSelectedStore(selectedStore === index ? null : index);
    };

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
        <main className="flex flex-col h-screen w-full mx-auto overflow-hidden">
            {/* 헤더 */}
            <header className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white p-3 flex items-center gap-2">
                <Link to="/event">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-lg font-bold flex-1">네잎 클로버 쿠폰 받기</h1>
            </header>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 overflow-auto bg-[#F5FAF0] p-4">
                <div className="space-y-6">
                    {/* 클로버 상태 */}
                    <div className="bg-white rounded-lg p-6 text-center">
                        <h2 className="text-lg font-bold text-[#5A3D2B] mb-4">네잎 클로버 채우기</h2>

                        <div className="relative w-40 h-40 mx-auto mb-4">
                            <img src={clover1} alt={"클로버"} className="w-full h-full object-cover" />
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            {cloverLeaves < 4
                                ? `${cloverLeaves}/4 잎 채움 - 참여 매장을 방문하고 인증하여 네잎 클로버를 완성하세요!`
                                : "네잎 클로버의 잎을을 모두 채웠습니다! 쿠폰을 받아가세요."}
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
                                        <p className="text-xs text-gray-500 mt-1">네잎 클로버 1잎 적립</p>
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
                                <span>참여 매장을 방문하고 인증하면 네잎 클로버 잎이 하나씩 채워집니다.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#00A949] font-bold">•</span>
                                <span>네잎 클로버의 잎을 모두 채우면 랜덤 쿠폰을 받을 수 있습니다.</span>
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
                    {/* <div className="space-y-4 py-4">
                        <div className="bg-gray-100 rounded-lg aspect-square flex flex-col items-center justify-center">
                            <Camera className="h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">매장 내 QR코드를 스캔하세요</p>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-4">매장에 있는 QR 코드를 스캔하여 방문을 인증하세요.</p>

                            <Button
                                className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                                onClick={handleVerificationComplete}
                            >
                                <Check className="h-4 w-4 mr-2" />
                                인증 완료 (데모)
                            </Button>
                        </div>
                    </div> */}
            
                    {/* 매장 정보 리스트 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
                            <span className="text-xs text-gray-500 font-medium">방문 매장</span>
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
                        </div>

                        {/* 매장 리스트 */}
                        <div className="space-y-2">
                            {storeList.map((store, index) => (
                                <div 
                                    key={index}
                                    onClick={() => handleStoreSelect(index)}
                                    className={`border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                                        selectedStore === index 
                                            ? 'bg-gray-100 border-gray-300' 
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 bg-gradient-to-r from-[#75CB3B] to-[#00B959] rounded-full"></div>
                                                <h3 className="text-sm font-semibold text-gray-800">{store.name}</h3>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    {/* <Calendar className="h-3 w-3" /> */}
                                                    <span>계산날짜: {store.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                            <span className="text-xs text-green-600 font-medium">{store.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Button
                        className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                        onClick={handleVerificationComplete}
                    >
                        <Check className="h-4 w-4 mr-2" />
                        인증 완료
                    </Button>
                </DialogContent>
            </Dialog>

            {/* 하단 내비게이션 */}
            <BottomNavigation />
        </main>
    )
}
