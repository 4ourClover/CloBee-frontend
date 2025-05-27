import { useState, Dispatch, useEffect } from "react";
import { Search, ChevronLeft, X, Filter, Bell } from "lucide-react";

import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Input } from "../ui/input";
import { Link } from "react-router-dom";
import { BenefitCard, brandCategory } from "../../types/store";
import { Store, notificationStore } from "../../types/store";

interface MapHeaderProps {
    searchRadius: number; // 검색 반경
    setSearchRadius: Dispatch<React.SetStateAction<number>>; // 검색 반경 설정 함수
    isNotificationOn: boolean; // 알림 설정 상태
    setIsNotificationOn: Dispatch<React.SetStateAction<boolean>>; // 알림 설정 함수
    selectedBrand: brandCategory | null; // 선택된 카드사
    onBrandSelect: (brand: brandCategory) => void;
    onSearch: (keyword: string) => void; // 검색어를 부모 컴포넌트로 전달하는 함수
    nearbyNotificationStores: notificationStore[];
}

export default function MapHeader({ searchRadius, setSearchRadius, isNotificationOn, setIsNotificationOn, selectedBrand, onBrandSelect, onSearch, nearbyNotificationStores }: MapHeaderProps) {
    const [searchQuery, setSearchQuery] = useState("");
    //const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const { toast } = useToast();
    //const [radius, setRadius] = useState(500); // 기본 반경 500m
    const [activeBrand, setActiveBrand] = useState<brandCategory | null>(null); // 내부 상태로 선택된 브랜드 관리

    useEffect(() => {
        // selectedBrand prop이 변경되면 내부 상태 업데이트
        setActiveBrand(selectedBrand);
    }, [selectedBrand]);

    const handleNotificationToggle = (checked: boolean) => {
        setIsNotificationOn(checked);
        toast({
            title: checked ? "혜택 알림이 켜졌습니다" : "혜택 알림이 꺼졌습니다",
            description: checked
                ? "주변 혜택 매장을 알려드립니다"
                : "더 이상 알림을 받지 않습니다",
            variant: checked ? "default" : "destructive",
        });
    };

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

    const handleBrandClick = (brand: brandCategory) => {
        onBrandSelect(brand);
        setActiveBrand(brand); // 내부 상태 업데이트
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
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-6 w-6 relative">
                        <Bell className="h-3.5 w-3.5" />
                        {/* {nearbyEventStores.length > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center">
                                {nearbyEventStores.length}
                            </span>
                        )} */}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold text-[#5A3D2B]">주변 혜택 알림</h3>
                            {nearbyNotificationStores.length > 0 && (
                                <Badge className="bg-red-500 text-[8px] py-0 px-1.5">
                                    {nearbyNotificationStores.length}개
                                </Badge>
                            )}
                        </div>
                        <div className="max-h-60 overflow-auto space-y-2">
                            {nearbyNotificationStores.length > 0 ? (
                                nearbyNotificationStores.map(store => (
                                    <div key={store.id} className="text-xs p-2 bg-gray-50 rounded-md border-l-2 border-[#00A949]">
                                        <div className="font-medium">{store.storeFullName}</div>
                                        <div className="text-gray-500 mt-1">
                                            {store.card_name} {store.discount} 할인 혜택이 있습니다.
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-gray-500">{store.distance}m</span>
                                            <Badge className="text-[8px] py-0 px-1.5 bg-[#75CB3B]/20 text-[#00A949] border-none">
                                                신규 혜택
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-center text-gray-500 py-4">
                                    주변에 혜택 매장이 없습니다
                                </div>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

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
                            <h3 className="text-sm font-medium">알림 반경</h3>
                            <div className="space-y-4">
                                <Slider
                                    defaultValue={[searchRadius]}
                                    max={2000}
                                    min={100}
                                    step={100}
                                    onValueChange={(value) => {
                                        setSearchRadius(value[0]);
                                        console.log(value[0]);
                                        toast({
                                            title: "검색 반경이 변경되었습니다",
                                            description: `현재 ${value[0]}m로 설정되었습니다`,
                                            variant: "default",
                                        });
                                    }}
                                    className="w-full"
                                />
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">100m</span>
                                    <span className="text-sm font-medium">1km</span>
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
                                    checked={isNotificationOn}
                                    onCheckedChange={handleNotificationToggle}
                                />
                                <Label htmlFor="notification-mode">
                                    {isNotificationOn ? "알림 켜짐" : "알림 꺼짐"}
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
                                        className={`cursor-pointer hover:bg-[#75CB3B]/10 rounded-full ${activeBrand === brand ? "border-2 border-[#00B959]" : ""
                                            }`}
                                        onClick={() => handleBrandClick(brand as brandCategory)}
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
    );
}