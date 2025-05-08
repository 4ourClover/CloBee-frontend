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
    onSearch: (keyword: string) => void; // 검색어를 부모 컴포넌트로 전달하는 함수
}

export default function MapHeader({ onBrandSelect, onSearch }: MapHeaderProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const { toast } = useToast()
    const [radius, setRadius] = useState(500) // 기본 반경 500m


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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const trimmed = searchQuery.trim();
            if (trimmed) {
                onSearch(trimmed);
            } else {
                alert("검색어를 입력하세요");
            }
        }
    };



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
                    id="search_keyword"
                    className="pl-7 pr-3 py-1 h-6 text-xs rounded-full bg-white/20 text-white placeholder:text-white/70 border-none focus-visible:ring-white/30"
                    placeholder="매장 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
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