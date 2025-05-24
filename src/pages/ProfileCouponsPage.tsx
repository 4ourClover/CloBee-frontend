import { useState } from "react"
import { Link } from "react-router-dom"
import {
    MapPin,
    CreditCard,
    Calendar,
    User,
    Ticket,
    Search,
    ChevronLeft,
} from "lucide-react"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Badge } from "../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import couponIamge from "../images/placeholder.svg"

export default function CouponsPage() {
    const [activeTab, setActiveTab] = useState("available")
    const [searchQuery, setSearchQuery] = useState("")

    const availableCoupons = [
        {
            id: 1,
            storeName: "스타벅스",
            benefit: "아메리카노 1+1",
            expiryDate: "2024.05.30",
            category: "카페",
            image: couponIamge,
        },
        // ... 생략
    ]

    const usedCoupons = [
        {
            id: 101,
            storeName: "투썸플레이스",
            benefit: "아이스 아메리카노 50% 할인",
            expiryDate: "2024.04.01",
            usedDate: "2024.04.10",
            category: "카페",
            image: couponIamge,
        },
        // ... 생략
    ]

    const expiredCoupons = [
        {
            id: 201,
            storeName: "맥도날드",
            benefit: "빅맥 세트 2,000원 할인",
            expiryDate: "2024.04.01",
            category: "음식점",
            image: couponIamge,
        },
        // ... 생략
    ]

    const getFilteredCoupons = () => {
        let coupons = []
        if (activeTab === "available") coupons = availableCoupons
        else if (activeTab === "used") coupons = usedCoupons
        else coupons = expiredCoupons

        if (!searchQuery) return coupons

        return coupons.filter(
            (c) =>
                c.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.benefit.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }

    const getRemainingDays = (dateStr: string) => {
        const target = new Date(dateStr.replace(/\./g, "-"))
        const now = new Date()
        const diff = target.getTime() - now.getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    const filteredCoupons = getFilteredCoupons()

    return (
        <main className="flex flex-col h-screen max-w-sm mx-auto overflow-hidden">
            <header className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white p-3 flex items-center gap-2">
                <Link to="/profile">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-lg font-bold flex-1">쿠폰 관리</h1>
            </header>

            <div className="border-b border-[#00A949]/20">
                <Tabs defaultValue="available" className="w-full" onValueChange={(v) => setActiveTab(v)}>
                    <TabsList className="w-full grid grid-cols-3 bg-transparent">
                        <TabsTrigger value="available" className="data-[state=active]:text-[#00A949] border-b-2">사용 가능</TabsTrigger>
                        <TabsTrigger value="used" className="data-[state=active]:text-[#00A949] border-b-2">사용 완료</TabsTrigger>
                        <TabsTrigger value="expired" className="data-[state=active]:text-[#00A949] border-b-2">기간 만료</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="p-3 bg-white flex items-center gap-2">
                <div className="relative flex-1">
                    <Input
                        className="pl-9 pr-3 py-1 h-9 text-sm rounded-full border-[#75CB3B]/30"
                        placeholder="쿠폰 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#00A949]" />
                </div>
                <Select>
                    <SelectTrigger className="w-28 h-9 border-[#75CB3B]/30 text-sm">
                        <SelectValue placeholder="카테고리" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="cafe">카페</SelectItem>
                        <SelectItem value="restaurant">음식점</SelectItem>
                        <SelectItem value="movie">영화</SelectItem>
                        <SelectItem value="shopping">쇼핑</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-[#F5FAF0]">
                {filteredCoupons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <Ticket className="h-12 w-12 text-[#75CB3B]/70 mb-2" />
                        <h3 className="text-lg font-medium text-[#5A3D2B]">쿠폰이 없습니다</h3>
                        <p className="text-sm text-[#5A3D2B]/70 mt-1">
                            {activeTab === "available"
                                ? "사용 가능한 쿠폰이 없습니다"
                                : activeTab === "used"
                                    ? "사용한 쿠폰이 없습니다"
                                    : "만료된 쿠폰이 없습니다"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredCoupons.map((coupon) => (
                            <div key={coupon.id} className="bg-white rounded-lg shadow-sm border border-gray-100">
                                <div className="flex p-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                                        <img src={coupon.image} alt={coupon.storeName} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-[#5A3D2B]">{coupon.storeName}</h3>
                                                <p className="text-sm text-[#00A949] font-medium">{coupon.benefit}</p>
                                            </div>
                                            <Badge className={`${activeTab === "available" ? "bg-[#75CB3B]/20 text-[#00A949]" : activeTab === "used" ? "bg-gray-200 text-gray-600" : "bg-red-100 text-red-600"} border-none`}>
                                                {activeTab === "available"
                                                    ? `${getRemainingDays(coupon.expiryDate)}일 남음`
                                                    : activeTab === "used"
                                                        ? `${(coupon as any).usedDate} 사용`
                                                        : "만료됨"}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <Badge variant="outline" className="text-xs border-[#75CB3B]/30 text-gray-500">
                                                {coupon.category}
                                            </Badge>
                                            {activeTab === "available" && <p className="text-xs text-gray-500">~ {coupon.expiryDate}</p>}
                                        </div>
                                    </div>
                                </div>
                                {activeTab === "available" && (
                                    <div className="border-t p-2 bg-gray-50">
                                        <Button className="w-full py-1 h-8 text-sm bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]">
                                            쿠폰 사용하기
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white border-t py-2 px-4 flex justify-around">
                <Link to="/map">
                    <Button variant="ghost" className="flex flex-col items-center">
                        <MapPin className="h-5 w-5" />
                        <span className="text-xs mt-1">지도</span>
                    </Button>
                </Link>
                <Link to="/card">
                    <Button variant="ghost" className="flex flex-col items-center">
                        <CreditCard className="h-5 w-5" />
                        <span className="text-xs mt-1">내 카드</span>
                    </Button>
                </Link>
                <Link to="/event">
                    <Button variant="ghost" className="flex flex-col items-center">
                        <Calendar className="h-5 w-5" />
                        <span className="text-xs mt-1">이벤트</span>
                    </Button>
                </Link>
                <Link to="/profile">
                    <Button variant="ghost" className="flex flex-col items-center text-[#00A949]">
                        <User className="h-5 w-5" />
                        <span className="text-xs mt-1">내 정보</span>
                    </Button>
                </Link>
            </div>
        </main>
    )
}
