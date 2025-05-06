import { useState, Dispatch } from "react"
import { Search, ChevronLeft, X, Filter, Bell } from "lucide-react"

import { Button } from "../ui/button"
import { useToast } from "../../hooks/use-toast"
import { Badge } from "../ui/badge"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import { Slider } from "../ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { Input } from "../ui/input"
import { Link } from "react-router-dom"
import { brandCategory } from "@/types/store"

interface MapHeaderProps {
    onBrandSelect: (brand: brandCategory) => void;
}

export default function MapHeader({ onBrandSelect }: MapHeaderProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const { toast } = useToast()
    const [radius, setRadius] = useState(500) // 기본 반경 500m

    // 주변 매장 더미 데이터
    // const nearbyStores = [
    //     {
    //         id: 1,
    //         name: "스타벅스 강남점",
    //         distance: 120,
    //         address: "서울시 강남구 테헤란로 123",
    //         bestCard: "신한카드 Deep Dream",
    //         discount: "30%",
    //         lat: 37.498095,
    //         lng: 127.02761,
    //         hasEvent: true,
    //     },
    //     {
    //         id: 2,
    //         name: "올리브영 역삼점",
    //         distance: 230,
    //         address: "서울시 강남구 역삼로 45",
    //         bestCard: "현대카드 The Green",
    //         discount: "20%",
    //         lat: 37.49944,
    //         lng: 127.029351,
    //         hasEvent: false,
    //     },
    //     {
    //         id: 3,
    //         name: "CGV 강남",
    //         distance: 350,
    //         address: "서울시 강남구 역삼동 814-6",
    //         bestCard: "삼성카드 taptap O",
    //         discount: "최대 8천원",
    //         lat: 37.500536,
    //         lng: 127.026318,
    //         hasEvent: true,
    //     },
    //     {
    //         id: 4,
    //         name: "교보문고 강남점",
    //         distance: 450,
    //         address: "서울시 강남구 테헤란로 152",
    //         bestCard: "KB국민카드 가온",
    //         discount: "15%",
    //         lat: 37.504476,
    //         lng: 127.024761,
    //         hasEvent: false,
    //     },
    //     {
    //         id: 5,
    //         name: "버거킹 역삼점",
    //         distance: 480,
    //         address: "서울시 강남구 역삼동 735-22",
    //         bestCard: "우리카드 카드의정석",
    //         discount: "최대 5천원",
    //         lat: 37.5011,
    //         lng: 127.036794,
    //         hasEvent: true,
    //     },
    // ]

    // const nearbyEventStores = nearbyStores.filter(
    //     (store) => store.distance <= 50 && store.hasEvent
    // )

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


    return (
        <header className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white p-1.5 flex items-center gap-2 z-20">
            {/* 뒤로가기 버튼 */}
            <Link to="/">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-6 w-6">
                    <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
            </Link>

            {/* 검색창 */}
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
            {/* <Popover>
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
            </Popover> */}

            {/* 필터 설정 */}
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
                                    //onValueChange={handleRadiusChange}
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
                                        onClick={() => onBrandSelect(brand as brandCategory)}
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
    )
}