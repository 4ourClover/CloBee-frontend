import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { MapPin, CreditCard } from "lucide-react"

import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import CardBenefitModal from "../components/card-benefit-modal"
import CategoryBar from "../components/category-bar"
import BottomNavigation from "../components/bottom-navigation"
import MapHeader from "../components/map/map-header"
import KakaoMap from "../components/map/kakao-map"

export default function MapPage() {
    const [showCardModal, setShowCardModal] = useState(false)
    const [selectedStore, setSelectedStore] = useState<any>(null)
    const [radius, setRadius] = useState(500) // 기본 반경 500m
    const [showBenefitTooltip, setShowBenefitTooltip] = useState<number | null>(null)

    // 주변 매장 더미 데이터
    const nearbyStores = [
        {
            id: 1,
            name: "스타벅스 강남점",
            distance: 120,
            address: "서울시 강남구 테헤란로 123",
            bestCard: "신한카드 Deep Dream",
            discount: "30%",
            lat: 37.498095,
            lng: 127.02761,
            hasEvent: true,
        },
        {
            id: 2,
            name: "올리브영 역삼점",
            distance: 230,
            address: "서울시 강남구 역삼로 45",
            bestCard: "현대카드 The Green",
            discount: "20%",
            lat: 37.49944,
            lng: 127.029351,
            hasEvent: false,
        },
        {
            id: 3,
            name: "CGV 강남",
            distance: 350,
            address: "서울시 강남구 역삼동 814-6",
            bestCard: "삼성카드 taptap O",
            discount: "최대 8천원",
            lat: 37.500536,
            lng: 127.026318,
            hasEvent: true,
        },
        {
            id: 4,
            name: "교보문고 강남점",
            distance: 450,
            address: "서울시 강남구 테헤란로 152",
            bestCard: "KB국민카드 가온",
            discount: "15%",
            lat: 37.504476,
            lng: 127.024761,
            hasEvent: false,
        },
        {
            id: 5,
            name: "버거킹 역삼점",
            distance: 480,
            address: "서울시 강남구 역삼동 735-22",
            bestCard: "우리카드 카드의정석",
            discount: "최대 5천원",
            lat: 37.5011,
            lng: 127.036794,
            hasEvent: true,
        },
    ]

    const handleStoreSelect = (store: any) => {
        setSelectedStore(store)
        setShowCardModal(true)
    }

    const handleMapClick = (storeId: number) => {
        setShowBenefitTooltip(storeId)
        setTimeout(() => {
            setShowBenefitTooltip(null)
        }, 3000)
    }


    return (
        <main className="flex flex-col h-full max-w-[1170px] mx-auto overflow-auto font-gmarket">
            {/* 헤더 */}
            <MapHeader />

            {/* 카테고리 바 */}
            <CategoryBar />

            {/* 지도 부분 */}
            <div className="flex-1 relative bg-[#f2f2f2] overflow-hidden">
                {/* 반경 표시 */}
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-30 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-md text-sm font-medium text-[#00A949]">
                    반경 {radius}m
                </div>

                {/* 지도 배경 */}
                <div className="absolute inset-0 bg-[#e8f4f8]" onClick={() => setShowBenefitTooltip(null)}>
                    <KakaoMap />
                </div>

                {/* 매장 마커 */}
                {nearbyStores.map((store, index) => (
                    <div
                        key={store.id}
                        className="absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: `${20 + index * 15}%`,
                            top: `${30 + index * 10}%`,
                        }}
                        onClick={() => handleMapClick(store.id)}
                        onDoubleClick={() => handleStoreSelect(store)}
                    >
                        <div className="flex flex-col items-center">
                            <div className="p-2 rounded-full bg-gradient-to-r from-[#75CB3B] to-[#00B959] shadow-md relative">
                                <MapPin className="h-5 w-5 text-white" />
                                {store.hasEvent && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
                                )}
                            </div>
                            <div className="mt-1 px-2 py-1 bg-white rounded-md shadow-sm text-xs max-w-[100px] text-center">
                                {store.name}
                            </div>

                            {/* 혜택 툴팁 */}
                            {showBenefitTooltip === store.id && (
                                <Card className="absolute top-0 -mt-16 bg-white shadow-lg rounded-lg p-2 text-xs whitespace-nowrap max-w-[150px] border-none z-20">
                                    <div className="flex items-center gap-1 mb-1">
                                        <CreditCard className="h-3 w-3 text-[#00A949]" />
                                        <span className="font-bold text-[#5A3D2B]">{store.bestCard}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#5A3D2B]">{store.name}</span>
                                        <span className="font-bold text-[#00A949]">{store.discount}</span>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                ))}

                {/* 현재 위치 표시 */}
                <div className="absolute left-1/2 top-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="p-2 rounded-full bg-blue-500 border-2 border-white shadow-md">
                        <div className="h-3 w-3 bg-white rounded-full"></div>
                    </div>
                </div>
            </div>


            {/* 하단 네비게이션 */}
            <BottomNavigation
                floatingActionButton={
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-md bg-white hover:bg-gray-100"
                    >
                        <MapPin className="h-5 w-5 text-[#00A949]" />
                    </Button>
                }
            />


            {/* 카드 혜택 모달 */}
            {showCardModal && selectedStore && (
                <CardBenefitModal store={selectedStore} onClose={() => setShowCardModal(false)} />
            )}
        </main>
    )
}


