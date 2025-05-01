import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import {
    ChevronLeft,
    Plus,
    Trash2,
    Edit,
    Camera,
    Search,
    X,
} from "lucide-react"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useToast } from "../hooks/use-toast"
import { Badge } from "../components/ui/badge"
import BottomNavigation from "../components/bottom-navigation"

export default function CardsPage() {
    const [activeTab, setActiveTab] = useState("my-cards")
    const [selectedCard, setSelectedCard] = useState<any>(null)
    const [showCardDetail, setShowCardDetail] = useState(false)
    const { toast } = useToast()

    // 더미 데이터: 내 카드 목록
    const myCards = [
        {
            id: 1,
            name: "신한카드 Deep Dream",
            cardType: "신용카드",
            cardCompany: "신한카드",
            benefits: ["카페 30%", "영화 8천원", "편의점 20%"],
            spendingGoal: 300000,
            currentSpending: 210000,
            image: "/placeholder.svg?height=200&width=320",
            detailedBenefits: [
                {
                    category: "카페",
                    description: "스타벅스, 투썸플레이스 등 전국 카페 30% 할인",
                    limit: "월 최대 5,000원",
                    condition: "전월 실적 30만원 이상 시",
                },
                {
                    category: "영화",
                    description: "CGV, 메가박스, 롯데시네마 8,000원 할인",
                    limit: "월 2회",
                    condition: "전월 실적 30만원 이상 시",
                },
                {
                    category: "편의점",
                    description: "CU, GS25, 세븐일레븐 등 전국 편의점 20% 할인",
                    limit: "월 최대 4,000원",
                    condition: "전월 실적 30만원 이상 시",
                },
                {
                    category: "대중교통",
                    description: "버스, 지하철 10% 할인",
                    limit: "월 최대 3,000원",
                    condition: "전월 실적 30만원 이상 시",
                },
            ],
        },
        {
            id: 2,
            name: "현대카드 The Green",
            cardType: "신용카드",
            cardCompany: "현대카드",
            benefits: ["마트 15%", "주유 리터당 60원", "대중교통 10%"],
            spendingGoal: 500000,
            currentSpending: 320000,
            image: "/placeholder.svg?height=200&width=320",
            detailedBenefits: [
                {
                    category: "마트",
                    description: "이마트, 홈플러스, 롯데마트 등 대형마트 15% 할인",
                    limit: "월 최대 10,000원",
                    condition: "전월 실적 50만원 이상 시",
                },
                {
                    category: "주유",
                    description: "전국 주유소 리터당 60원 할인",
                    limit: "월 최대 8,000원",
                    condition: "전월 실적 50만원 이상 시",
                },
                {
                    category: "대중교통",
                    description: "버스, 지하철 10% 할인",
                    limit: "월 최대 5,000원",
                    condition: "전월 실적 50만원 이상 시",
                },
                {
                    category: "온라인쇼핑",
                    description: "쿠팡, 11번가, G마켓 등 온라인쇼핑 5% 할인",
                    limit: "월 최대 5,000원",
                    condition: "전월 실적 50만원 이상 시",
                },
            ],
        },
    ]

    // 더미 데이터: 전체 카드 목록
    const allCards = [
        {
            id: 101,
            name: "삼성카드 taptap O",
            cardCompany: "삼성카드",
            benefits: ["편의점 20%", "카페 30%", "영화 최대 8천원"],
            annualFee: "20,000원",
            image: "/placeholder.svg?height=200&width=320",
            applyUrl: "https://www.samsungcard.com/personal/card/simple-application/UHPPCA0101M0.jsp",
        },
        {
            id: 102,
            name: "KB국민카드 가온",
            cardCompany: "KB국민카드",
            benefits: ["마트 10%", "쇼핑 15%", "도서 20%"],
            annualFee: "15,000원",
            image: "/placeholder.svg?height=200&width=320",
            applyUrl: "https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076",
        },
        {
            id: 103,
            name: "우리카드 카드의정석",
            cardCompany: "우리카드",
            benefits: ["외식 20%", "주유 리터당 80원", "대중교통 10%"],
            annualFee: "30,000원",
            image: "/placeholder.svg?height=200&width=320",
            applyUrl: "https://pc.wooricard.com/dcpc/yh1/wcd/app/wcd/appCard/appCardMain.do",
        },
        {
            id: 104,
            name: "하나카드 원더카드",
            cardCompany: "하나카드",
            benefits: ["통신비 10%", "스트리밍 20%", "배달앱 15%"],
            annualFee: "17,000원",
            image: "/placeholder.svg?height=200&width=320",
            applyUrl: "https://www.hanacard.co.kr/OPI41000000D.web",
        },
    ]

    // 카드 추가 핸들러
    const handleAddCard = () => {
        toast({
            title: "카드가 추가되었습니다",
            description: "새로운 카드가 내 카드 목록에 추가되었습니다.",
        })
    }

    // 카드 삭제 핸들러
    const handleDeleteCard = (cardId: number) => {
        toast({
            title: "카드가 삭제되었습니다",
            description: "선택한 카드가 내 카드 목록에서 삭제되었습니다.",
            variant: "destructive",
        })
    }

    // 카드 신청 핸들러
    const handleApplyCard = (url: string) => {
        window.open(url, "_blank")
    }

    // 카드 상세 정보 보기 핸들러
    const handleViewCardDetail = (card: any) => {
        setSelectedCard(card)
        setShowCardDetail(true)
    }

    // 실적 그라데이션 계산 함수
    const getProgressGradient = (percentage: number) => {
        // 실적에 따라 그라데이션 강도 조절
        if (percentage < 30) {
            return "bg-gradient-to-r from-[#75CB3B]/30 to-[#00B959]/30"
        } else if (percentage < 60) {
            return "bg-gradient-to-r from-[#75CB3B]/60 to-[#00B959]/60"
        } else {
            return "bg-gradient-to-r from-[#75CB3B] to-[#00B959]"
        }
    }

    const navigate = useNavigate()

    return (
        <main className="flex flex-col h-full max-w-[1170px] mx-auto overflow-hidden font-gmarket">
            <header className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white p-1.5 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-6 w-6" onClick={() => navigate(-1)}>
                    <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <h1 className="text-base font-bold flex-1">카드 관리</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-6 w-6">
                            <Plus className="h-3.5 w-3.5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm mx-auto">
                        <DialogHeader>
                            <DialogTitle>카드 추가하기</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="card-type">카드 종류</Label>
                                <Select defaultValue="credit">
                                    <SelectTrigger id="card-type">
                                        <SelectValue placeholder="카드 종류 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="credit">신용카드</SelectItem>
                                        <SelectItem value="debit">체크카드</SelectItem>
                                        <SelectItem value="prepaid">선불카드</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="card-company">카드사</Label>
                                <Select>
                                    <SelectTrigger id="card-company">
                                        <SelectValue placeholder="카드사 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="shinhan">신한카드</SelectItem>
                                        <SelectItem value="samsung">삼성카드</SelectItem>
                                        <SelectItem value="hyundai">현대카드</SelectItem>
                                        <SelectItem value="kb">KB국민카드</SelectItem>
                                        <SelectItem value="woori">우리카드</SelectItem>
                                        <SelectItem value="hana">하나카드</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="card-number">카드 번호</Label>
                                <Input id="card-number" placeholder="0000-0000-0000-0000" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry-date">유효기간</Label>
                                    <Input id="expiry-date" placeholder="MM/YY" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvc">CVC</Label>
                                    <Input id="cvc" placeholder="000" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>카드 이미지</Label>
                                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                    <Button variant="outline" className="w-full">
                                        <Camera className="h-4 w-4 mr-2" />
                                        카드 촬영하기 (OCR)
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">취소</Button>
                            </DialogClose>
                            <Button
                                className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                                onClick={handleAddCard}
                            >
                                추가하기
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </header>

            <div className="bg-transparent border-b border-[#00A949]/20">
                <Tabs defaultValue="my-cards" onValueChange={(v) => setActiveTab(v)}>
                    <TabsList className="w-full grid grid-cols-2 bg-transparent">
                        <TabsTrigger value="my-cards" className="data-[state=active]:border-b-2 border-[#00A949] rounded-none">내 카드 목록</TabsTrigger>
                        <TabsTrigger value="all-cards" className="data-[state=active]:border-b-2 border-[#00A949] rounded-none">전체 카드 찾기</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-[#F5FAF0]">
                {activeTab === "my-cards" ? (
                    <div className="space-y-4">
                        {myCards.map((card) => {
                            const percentage = (card.currentSpending / card.spendingGoal) * 100
                            const progressGradient = getProgressGradient(percentage)

                            return (
                                <div
                                    key={card.id}
                                    className="bg-white rounded-lg shadow-xs overflow-hidden border border-gray-100 cursor-pointer"
                                    onClick={() => handleViewCardDetail(card)}
                                >
                                    <div className="flex">
                                        <div className="w-1/3 relative">
                                            <img
                                                src={card.image || "/placeholder.svg"}
                                                alt={card.name}
                                                width={120}
                                                height={80}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="w-2/3 p-3 space-y-2">
                                            <div className="flex justify-between">
                                                <h3 className="font-bold text-sm">{card.name}</h3>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-[#00A949]"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                        }}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-red-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDeleteCard(card.id)
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span>이번 달 실적</span>
                                                    <span className="font-medium">
                                                        {card.currentSpending.toLocaleString()}원 / {card.spendingGoal.toLocaleString()}원
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full ${progressGradient}`} style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1">
                                                {card.benefits.map((benefit, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-[#75CB3B]/20 text-[#00A949] text-xs px-1.5 py-0.5 rounded-full"
                                                    >
                                                        {benefit}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative">
                            <Input
                                className="pl-9 pr-4 py-2 rounded-full border-[#75CB3B]/30 focus-visible:ring-[#00A949]"
                                placeholder="카드 검색..."
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#00A949]" />
                        </div>

                        {allCards.map((card) => (
                            <div key={card.id} className="bg-white rounded-lg shadow-xs overflow-hidden border border-gray-100">
                                <div className="flex">
                                    <div className="w-1/3 relative">
                                        <img
                                            src={card.image || "/placeholder.svg"}
                                            alt={card.name}
                                            width={120}
                                            height={80}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="w-2/3 p-3 space-y-2">
                                        <div>
                                            <h3 className="font-bold text-sm">{card.name}</h3>
                                            <p className="text-xs text-gray-500">
                                                {card.cardCompany} | 연회비 {card.annualFee}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-1">
                                            {card.benefits.map((benefit, index) => (
                                                <span key={index} className="bg-[#75CB3B]/20 text-[#00A949] text-xs px-1.5 py-0.5 rounded-full">
                                                    {benefit}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex gap-1 mt-1">
                                            <Button
                                                variant="outline"
                                                className="flex-1 text-xs py-1 h-7 text-[#00A949] border-[#75CB3B]/30 hover:bg-[#75CB3B]/10 hover:border-[#75CB3B]/50"
                                            >
                                                상세 보기
                                            </Button>
                                            <Button
                                                className="flex-1 text-xs py-1 h-7 bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] border-none"
                                                onClick={() => handleApplyCard(card.applyUrl)}
                                            >
                                                카드 신청하기
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            {/* 하단 네비게이션 */}
            {/* 카드 추가 버튼 - 오른쪽 하단에 배치 
            //h-12 w-12 rounded-full shadow-md bg-white hover:bg-gray-100*/}
            <BottomNavigation
                floatingActionButton={
                    < Dialog >
                        <DialogTrigger asChild>
                            <Button className="h-14 w-14 rounded-full shadow-md bg-white hover:bg-gray-100 p-0 overflow-hidden">
                                <img
                                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-knhlHRBh7Yde8QtKPul45zdTK5iYJr.png"
                                    alt="카드 연결"
                                    width={56}
                                    height={56}
                                    className="object-cover"
                                />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm mx-auto">
                            <DialogHeader>
                                <DialogTitle>카드 추가하기</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="card-type-modal">카드 종류</Label>
                                    <Select defaultValue="credit">
                                        <SelectTrigger id="card-type-modal">
                                            <SelectValue placeholder="카드 종류 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="credit">신용카드</SelectItem>
                                            <SelectItem value="debit">체크카드</SelectItem>
                                            <SelectItem value="prepaid">선불카드</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="card-company-modal">카드사</Label>
                                    <Select>
                                        <SelectTrigger id="card-company-modal">
                                            <SelectValue placeholder="카드사 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="shinhan">신한카드</SelectItem>
                                            <SelectItem value="samsung">삼성카드</SelectItem>
                                            <SelectItem value="hyundai">현대카드</SelectItem>
                                            <SelectItem value="kb">KB국민카드</SelectItem>
                                            <SelectItem value="woori">우리카드</SelectItem>
                                            <SelectItem value="hana">하나카드</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="card-number-modal">카드 번호</Label>
                                    <Input id="card-number-modal" placeholder="0000-0000-0000-0000" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry-date-modal">유효기간</Label>
                                        <Input id="expiry-date-modal" placeholder="MM/YY" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvc-modal">CVC</Label>
                                        <Input id="cvc-modal" placeholder="000" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>카드 이미지</Label>
                                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                        <Button variant="outline" className="w-full">
                                            <Camera className="h-4 w-4 mr-2" />
                                            카드 촬영하기 (OCR)
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">취소</Button>
                                </DialogClose>
                                <Button
                                    className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                                    onClick={handleAddCard}
                                >
                                    추가하기
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                }
            />


            {/* 카드 상세 정보 모달 */}
            {
                showCardDetail && selectedCard && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
                        <div className="bg-white rounded-t-lg sm:rounded-lg w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col">
                            {/* 헤더 */}
                            <div className="p-3 border-b flex justify-between items-center bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white">
                                <h2 className="font-bold text-lg">{selectedCard.name} 혜택</h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/10"
                                    onClick={() => setShowCardDetail(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* 카드 이미지 */}
                            <div className="relative h-48 bg-gray-100">
                                <img
                                    src={selectedCard.image || "/placeholder.svg"}
                                    alt={selectedCard.name}
                                    className="w-full h-full object-contain p-4"
                                />
                            </div>

                            {/* 카드 정보 */}
                            <div className="p-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">{selectedCard.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {selectedCard.cardCompany} | {selectedCard.cardType}
                                        </p>
                                    </div>
                                    <Badge className="bg-[#75CB3B]/20 text-[#00A949] border-none">
                                        실적 {selectedCard.spendingGoal.toLocaleString()}원
                                    </Badge>
                                </div>

                                <div className="space-y-1 mt-2">
                                    <div className="flex justify-between text-sm">
                                        <span>이번 달 실적</span>
                                        <span className="font-medium">
                                            {selectedCard.currentSpending.toLocaleString()}원 / {selectedCard.spendingGoal.toLocaleString()}원
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#75CB3B] to-[#00B959]"
                                            style={{ width: `${(selectedCard.currentSpending / selectedCard.spendingGoal) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* 상세 혜택 */}
                            <div className="flex-1 overflow-auto p-4 pt-0">
                                <h4 className="font-medium text-[#5A3D2B] mt-4 mb-2">상세 혜택</h4>
                                <div className="space-y-3">
                                    {selectedCard.detailedBenefits.map((benefit: any, index: number) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex justify-between items-start">
                                                <h5 className="font-medium text-[#00A949]">{benefit.category}</h5>
                                                <Badge className="bg-[#75CB3B]/20 text-[#00A949] border-none">{benefit.limit}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-1">{benefit.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">{benefit.condition}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 하단 버튼 */}
                            <div className="p-4 border-t">
                                <Button
                                    className="w-full bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] border-none"
                                    onClick={() => setShowCardDetail(false)}
                                >
                                    확인
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
        </main >
    )
}
