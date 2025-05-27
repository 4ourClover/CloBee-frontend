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
    X,
} from "lucide-react"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Badge } from "../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog"
import BottomNavigation from "../components/bottom-navigation"

// 브랜드 로고 이미지 import
import starbucksLogo from "../images/starbucks-logo.png"
import twosomeLogo from "../images/twosome-logo.png"
import mcdonaldsLogo from "../images/mcdonalds-logo.png"
import cgvLogo from "../images/cgv-logo.png"
import oliveyoungLogo from "../images/oliveyoung-logo.png"
import megaboxLogo from "../images/megabox-logo.png"
import lotteriaLogo from "../images/lotteria-logo.png"
import gs25Logo from "../images/gs25-logo.png"
import megacoffeeLogo from "../images/megacoffee-logo.png"

// 바코드 이미지 import
import barcodeImage from "../images/barcode.png"
import starbucksBarcode from "../images/starbucks-barcode.png"
import cgvBarcode from "../images/cgv-barcode.png"
import oliveyoungBarcode from "../images/oliveyoung-barcode.png"

interface Coupon {
    id: number
    storeName: string
    benefit: string
    expiryDate: string
    category: string
    image: string
    usedDate?: string
}

export default function CouponsPage() {
    const [activeTab, setActiveTab] = useState("available")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
    const [showCouponModal, setShowCouponModal] = useState(false)

    // storeName에 따라 바코드 이미지를 반환하는 함수
    const getBarcodeSrc = (storeName: string) => {
        switch (storeName) {
            case "스타벅스":
                return starbucksBarcode
            case "CGV":
                return cgvBarcode
            case "올리브영":
                return oliveyoungBarcode
            default:
                return barcodeImage
        }
    }

    const availableCoupons: Coupon[] = [
        {
            id: 1,
            storeName: "스타벅스",
            benefit: "아메리카노 1+1",
            expiryDate: "2025.06.30",
            category: "카페",
            image: starbucksLogo,
        },
        {
            id: 2,
            storeName: "CGV",
            benefit: "영화 티켓 2,000원 할인",
            expiryDate: "2025.07.15",
            category: "영화",
            image: cgvLogo,
        },
        {
            id: 3,
            storeName: "올리브영",
            benefit: "3만원 이상 구매 시 20% 할인",
            expiryDate: "2025.07.31",
            category: "쇼핑",
            image: oliveyoungLogo,
        },
    ]

    const usedCoupons: Coupon[] = [
        {
            id: 101,
            storeName: "투썸플레이스",
            benefit: "아이스 아메리카노 50% 할인",
            expiryDate: "2025.04.01",
            usedDate: "2025.04.10",
            category: "카페",
            image: twosomeLogo,
        },
        {
            id: 102,
            storeName: "메가박스",
            benefit: "팝콘 3천원 할인",
            expiryDate: "2025.04.01",
            usedDate: "2025.05.10",
            category: "영화",
            image: megaboxLogo,
        },
        {
            id: 103,
            storeName: "롯데리아",
            benefit: "불고기 버거 50% 할인",
            expiryDate: "2025.05.01",
            usedDate: "2025.05.12",
            category: "음식점",
            image: lotteriaLogo,
        },
        
    ]

    const expiredCoupons: Coupon[] = [
        {
            id: 201,
            storeName: "맥도날드",
            benefit: "빅맥 세트 2,000원 할인",
            expiryDate: "2024.04.01",
            category: "음식점",
            image: mcdonaldsLogo,
        },
              {
            id: 202,
            storeName: "GS25",
            benefit: "GS25 1,000원 할인",
            expiryDate: "2024.05.01",
            category: "편의점",
            image: gs25Logo,
        },
                
              {
            id: 203,
            storeName: "메가커피",
            benefit: "아이스티 1잔 무료",
            expiryDate: "2024.05.30",
            category: "카페",
            image: megacoffeeLogo,
        },
    ]

    const getFilteredCoupons = () => {
        let coupons: Coupon[] = []
        if (activeTab === "available") coupons = availableCoupons
        else if (activeTab === "used") coupons = usedCoupons
        else coupons = expiredCoupons

        if (selectedCategory !== "all") {
            coupons = coupons.filter(c => c.category === selectedCategory)
        }
        if (searchQuery) {
            coupons = coupons.filter(
                c =>
                    c.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.benefit.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.category.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }
        return coupons
    }

    const getRemainingDays = (dateStr: string) => {
        const target = new Date(dateStr.replace(/\./g, "-"))
        const now = new Date()
        const diff = target.getTime() - now.getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    const handleUseCoupon = (coupon: Coupon) => {
        setSelectedCoupon(coupon)
        setShowCouponModal(true)
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
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-28 h-9 border-[#75CB3B]/30 text-sm">
                        <SelectValue placeholder="카테고리" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="카페">카페</SelectItem>
                        <SelectItem value="음식점">음식점</SelectItem>
                        <SelectItem value="영화">영화</SelectItem>
                        <SelectItem value="쇼핑">쇼핑</SelectItem>
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
                                                        ? `${coupon.usedDate} 사용`
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
                                        <Button
                                            className="w-full py-1 h-8 text-sm bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                                            onClick={() => handleUseCoupon(coupon)}
                                        >
                                            쿠폰 사용하기
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 쿠폰 사용 모달 */}
            <Dialog open={showCouponModal} onOpenChange={setShowCouponModal}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-center">쿠폰 사용</DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2"
                            onClick={() => setShowCouponModal(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogHeader>

                    {selectedCoupon && (
                        <div className="mt-4">
                            <div className="text-center mb-4">
                                <div className="w-20 h-20 mx-auto mb-3 bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={selectedCoupon.image}
                                        alt={selectedCoupon.storeName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="text-lg font-bold text-[#5A3D2B]">
                                    {selectedCoupon.storeName}
                                </h3>
                                <p className="text-[#00A949] font-medium mt-1">
                                    {selectedCoupon.benefit}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    유효기간: {selectedCoupon.expiryDate}까지
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 text-center mb-3">
                                    아래 바코드를 직원에게 보여주세요
                                </p>
                                <div className="bg-white p-3 rounded">
                                    <img
                                        src={getBarcodeSrc(selectedCoupon.storeName)}
                                        alt="쿠폰 바코드"
                                        className="w-full h-24 object-contain"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-gray-500 text-center">
                                <p>• 본 쿠폰은 1회만 사용 가능합니다</p>
                                <p>• 다른 할인과 중복 적용되지 않습니다</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <BottomNavigation />
        </main>
    )
}