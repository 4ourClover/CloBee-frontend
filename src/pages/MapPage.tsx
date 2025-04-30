import { useState } from "react"
import { Link } from "react-router-dom"
import { MapPin, Search, CreditCard, ChevronLeft, X, Filter, User, Calendar, Bell } from "lucide-react"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Switch } from "../components/ui/switch"
import { Label } from "../components/ui/label"
import { Slider } from "../components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet"
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover"
import CardBenefitModal from "../components/card-benefit-modal"
import CategoryBar from "../components/category-bar"
import { useToast } from "../hooks/use-toast"

export default function MapPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [showCardModal, setShowCardModal] = useState(false)
    const [selectedStore, setSelectedStore] = useState<any>(null)
    const [radius, setRadius] = useState(500) // 기본 반경 500m
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [showBenefitTooltip, setShowBenefitTooltip] = useState<number | null>(null)
    const { toast } = useToast()

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

    const nearbyEventStores = nearbyStores.filter(
        (store) => store.distance <= 50 && store.hasEvent
    )

    const handleNotificationToggle = (checked: boolean) => {
        setNotificationsEnabled(checked)
        toast({
            title: checked ? "혜택 알림이 켜졌습니다" : "혜택 알림이 꺼졌습니다",
            description: checked
                ? "주변 혜택 매장을 알려드립니다"
                : "더 이상 알림을 받지 않습니다",
            variant: checked ? "default" : "destructive",
        })
    }

    const handleRadiusChange = (value: number[]) => {
        setRadius(value[0])
    }

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
            <header className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white p-1.5 flex items-center gap-2 z-20">
                <Link to="/">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-6 w-6">
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                </Link>
                <div className="flex-1 relative">
                    <Input
                        className="pl-7 pr-3 py-1 h-6 text-xs rounded-full bg-white/20 text-white placeholder:text-white/70 border-none focus-visible:ring-white/30"
                        placeholder="매장 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-2 top-1 h-3 w-3 text-white/70" />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-0 h-6 w-6 text-white/70 hover:text-white hover:bg-transparent"
                            onClick={() => setSearchQuery("")}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {/* 주변 매장 알림 */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-6 w-6 relative">
                            <Bell className="h-3.5 w-3.5" />
                            {nearbyEventStores.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center">
                                    {nearbyEventStores.length}
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="end">
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-[#5A3D2B]">주변 50m 이벤트 알림</h3>
                            {nearbyEventStores.length > 0 ? (
                                <div className="max-h-40 overflow-auto space-y-2">
                                    {nearbyEventStores.map((store) => (
                                        <div key={store.id} className="text-xs p-2 bg-gray-50 rounded-md">
                                            <div className="font-medium">{store.name}</div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-gray-500">{store.distance}m</span>
                                                <Badge className="text-[8px] py-0 px-1.5 bg-[#75CB3B]/20 text-[#00A949] border-none">
                                                    이벤트 진행중
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500">주변 50m 내 이벤트가 없습니다.</p>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* 필터 Sheet */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-6 w-6">
                            <Filter className="h-3.5 w-3.5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[280px]">
                        <SheetHeader>
                            <SheetTitle>필터 설정</SheetTitle>
                        </SheetHeader>
                        <div className="py-4 space-y-6">
                            {/* 검색 반경 설정 */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">검색 반경</h3>
                                <div className="space-y-4">
                                    <Slider
                                        defaultValue={[radius]}
                                        max={2000}
                                        min={100}
                                        step={100}
                                        onValueChange={handleRadiusChange}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">100m</span>
                                        <span className="text-sm font-medium">{radius}m</span>
                                        <span className="text-sm text-muted-foreground">2km</span>
                                    </div>
                                </div>
                            </div>

                            {/* 혜택 알림 스위치 */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">혜택 알림</h3>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="notification-mode"
                                        checked={notificationsEnabled}
                                        onCheckedChange={handleNotificationToggle}
                                    />
                                    <Label htmlFor="notification-mode">
                                        {notificationsEnabled ? "알림 켜짐" : "알림 꺼짐"}
                                    </Label>
                                </div>
                            </div>

                            {/* 카드사 선택 */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">카드사 선택</h3>
                                <div className="flex flex-wrap gap-2">
                                    {["신한카드", "삼성카드", "현대카드", "KB국민", "우리카드"].map((brand) => (
                                        <Badge
                                            key={brand}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-[#75CB3B]/10 rounded-full"
                                        >
                                            {brand}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </header>

            {/* 카테고리 바 */}
            <CategoryBar />

            {/* 지도 부분 */}
            <div className="flex-1 relative bg-[#f2f2f2] overflow-hidden">
                {/* 반경 표시 */}
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-30 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-md text-sm font-medium text-[#00A949]">
                    반경 {radius}m
                </div>

                {/* 지도 배경 (가짜 도로/공원) */}
                <div className="absolute inset-0 bg-[#e8f4f8]" onClick={() => setShowBenefitTooltip(null)}>
                    {/* 도로 */}
                    <div className="absolute left-0 top-1/2 w-full h-8 bg-[#ffffff] transform -translate-y-1/2"></div>
                    <div className="absolute left-1/2 top-0 w-8 h-full bg-[#ffffff] transform -translate-x-1/2"></div>

                    {/* 건물 */}
                    <div className="absolute left-[20%] top-[20%] w-16 h-16 bg-[#d9d9d9] rounded-md"></div>
                    <div className="absolute left-[60%] top-[30%] w-20 h-14 bg-[#d9d9d9] rounded-md"></div>
                    <div className="absolute left-[25%] top-[60%] w-14 h-14 bg-[#d9d9d9] rounded-md"></div>
                    <div className="absolute left-[70%] top-[65%] w-16 h-16 bg-[#d9d9d9] rounded-md"></div>

                    {/* 공원 */}
                    <div className="absolute left-[10%] top-[40%] w-24 h-20 bg-[#c8e6c9] rounded-full opacity-70"></div>
                    <div className="absolute left-[65%] top-[15%] w-16 h-16 bg-[#c8e6c9] rounded-full opacity-70"></div>
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
            <div className="bg-white border-t py-1.5 px-4 flex justify-around relative">
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute -top-14 right-4 h-12 w-12 rounded-full shadow-md bg-white hover:bg-gray-100 z-30"
                >
                    <MapPin className="h-5 w-5 text-[#00A949]" />
                </Button>

                <Link to="/map">
                    <Button variant="ghost" className="flex flex-col items-center text-[#00A949] h-auto py-1 rounded-full">
                        <MapPin className="h-6 w-6" />
                        <span className="text-[10px] mt-0.5">지도</span>
                    </Button>
                </Link>
                <Link to="/cards">
                    <Button variant="ghost" className="flex flex-col items-center h-auto py-1 rounded-full">
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

            {/* 카드 혜택 모달 */}
            {showCardModal && selectedStore && (
                <CardBenefitModal store={selectedStore} onClose={() => setShowCardModal(false)} />
            )}
        </main>
    )
}


