"use client"

import { useEffect, useState } from "react"
import { fetchAllCards, fetchCardDetail, applyCard } from "../lib/card/cardApi"
import type { CardListDTO, CardBenefitDetail } from "../lib/card/cardTypes"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, Plus, Trash2, Camera, Search, X } from "lucide-react"

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
    const [isLoadingDetail, setIsLoadingDetail] = useState(false)
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

    // 전체 카드 목록
    const [allCards, setAllCards] = useState<CardListDTO[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedCardType, setSelectedCardType] = useState("credit")

    // 카드 타입이 변경될 때 항상 1페이지로 이동
    useEffect(() => {
        setCurrentPage(1)
    }, [selectedCardType])

    useEffect(() => {
        if (activeTab === "all-cards") {
            fetchAllCards(selectedCardType, currentPage, 10)
                .then((data) => {
                    setAllCards(data.cardPageList)
                    setTotalCount(data.totalCount)
                })
                .catch((err) => {
                    console.error("카드 데이터 로딩 실패", err)
                })
        }
    }, [activeTab, currentPage, selectedCardType])

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
    const handleApplyCard = async (cardInfoId: number, cardBrand: string) => {
        try {
            // 카드 브랜드 문자열을 숫자로 변환
            const cardBrandNum = Number.parseInt(cardBrand, 10)
            if (isNaN(cardBrandNum)) {
                throw new Error("유효하지 않은 카드 브랜드입니다.")
            }

            // 백엔드 API를 통해 카드 신청 URL 가져오기
            const url = await applyCard(cardInfoId, cardBrandNum)

            // 새 창에서 URL 열기
            if (url) {
                window.open(url, "_blank")
            } else {
                throw new Error("카드 신청 URL을 가져올 수 없습니다.")
            }
        } catch (error) {
            console.error("카드 신청 실패:", error)
            toast({
                title: "카드 신청 실패",
                description: "카드 신청 페이지로 이동할 수 없습니다.",
                variant: "destructive",
            })
        }
    }

    // 카드 상세 정보 보기 핸들러
    const handleViewCardDetail = (card: any) => {
        setSelectedCard(card)
        setShowCardDetail(true)
    }

    // 카드 상세 정보 가져오기 핸들러
    const handleFetchCardDetail = async (cardInfoId: number, cardItem: CardListDTO) => {
        setIsLoadingDetail(true)
        try {
            // 데이터베이스에서 카드 상세 정보(혜택) 가져오기
            const cardBenefits = await fetchCardDetail(cardInfoId)

            // 카드 기본 정보와 혜택 정보를 합쳐서 selectedCard에 설정
            setSelectedCard({
                ...cardItem,
                benefits: cardBenefits,
            })
            setShowCardDetail(true)
        } catch (error) {
            console.error("카드 상세 정보 로딩 실패", error)
            toast({
                title: "카드 상세 정보 로딩 실패",
                description: "카드 상세 정보를 불러오는 중 오류가 발생했습니다.",
                variant: "destructive",
            })
        } finally {
            setIsLoadingDetail(false)
        }
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

    // 연회비 표시 함수
    const renderAnnualFee = (domestic: number, global: number) => {
        if (domestic === 0 && global === 0) {
            return "연회비 없음"
        }

        const parts = []

        if (domestic > 0) {
            parts.push(`국내전용 ${domestic.toLocaleString()}원`)
        }

        if (global > 0) {
            parts.push(`해외겸용 ${global.toLocaleString()}원`)
        }

        return parts.join(" | ")
    }

    const navigate = useNavigate()

    return (
        <main className="flex flex-col h-full max-w-[1170px] mx-auto overflow-hidden font-gmarket">
            <header className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white p-1.5 flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 h-6 w-6"
                    onClick={() => navigate(-1)}
                >
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
                        <TabsTrigger value="my-cards" className="data-[state=active]:border-b-2 border-[#00A949] rounded-none">
                            내 카드 목록
                        </TabsTrigger>
                        <TabsTrigger value="all-cards" className="data-[state=active]:border-b-2 border-[#00A949] rounded-none">
                            전체 카드 찾기
                        </TabsTrigger>
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
                                        <div className="w-1/3 relative h-[80px] flex items-center justify-center bg-gray-50">
                                            <img
                                                src={card.image || "/placeholder.svg"}
                                                alt={card.name}
                                                width={120}
                                                height={80}
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                        <div className="w-2/3 p-3 space-y-2">
                                            <div className="flex justify-between">
                                                <h3 className="font-bold text-sm">{card.name}</h3>
                                                <div className="flex gap-1">
                                                    {/* <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-[#00A949]"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                        }}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button> */}
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
                        <div className="space-y-2">
                            <Label htmlFor="card-type-select">카드 종류</Label>
                            <Select
                                value={selectedCardType}
                                onValueChange={(value) => {
                                    setSelectedCardType(value) // ✅ 선택 시 상태 변경
                                }}
                            >
                                <SelectTrigger id="card-type-select" className="w-full">
                                    <SelectValue placeholder="카드 종류 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="credit">신용카드</SelectItem>
                                    <SelectItem value="check">체크카드</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {allCards.map((card) => (
                            <div
                                key={card.cardInfoId}
                                className="bg-white rounded-lg shadow-xs overflow-hidden border border-gray-100"
                            >
                                <div className="flex">
                                    <div className="w-1/3 relative h-[80px] flex items-center justify-center bg-gray-50">
                                        <img
                                            src={card.cardImageUrl || "/placeholder.svg"}
                                            alt={card.cardName}
                                            width={120}
                                            height={80}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                    <div className="w-2/3 p-3 space-y-2">
                                        <div>
                                            <h3 className="font-bold text-sm">{card.cardName}</h3>
                                            <p className="text-xs text-gray-500">{card.cardBrand}</p>
                                            <p className="text-xs text-gray-500 mt-1.5">
                                                {renderAnnualFee(card.cardDomesticAnnualFee, card.cardGlobalAnnualFee)}
                                            </p>
                                        </div>

                                        <div className="flex gap-1 mt-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1 text-xs py-1 h-7 text-[#00A949] border-[#75CB3B]/30 hover:bg-[#75CB3B]/10 hover:border-[#75CB3B]/50"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleFetchCardDetail(card.cardInfoId, card)
                                                }}
                                                disabled={isLoadingDetail}
                                            >
                                                {isLoadingDetail ? "로딩 중..." : "상세 보기"}
                                            </Button>
                                            <Button
                                                className="flex-1 text-xs py-1 h-7 bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] border-none"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleApplyCard(card.cardInfoId, card.cardBrand)
                                                }}
                                            >
                                                카드 신청하기
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* ✅ 페이지네이션 */}
                        <div className="flex justify-center items-center pt-4 gap-1">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {Array.from({ length: Math.min(5, Math.ceil(totalCount / 10)) }, (_, i) => {
                                // Calculate page number based on current page to show 5 pages at a time
                                let pageNum: number
                                const totalPages = Math.ceil(totalCount / 10)

                                if (totalPages <= 5) {
                                    // If total pages are 5 or less, show all pages
                                    pageNum = i + 1
                                } else {
                                    // If more than 5 pages, create a sliding window
                                    let startPage = Math.max(1, currentPage - 2)
                                    const endPage = Math.min(totalPages, startPage + 4)

                                    // Adjust start page if we're near the end
                                    startPage = Math.max(1, endPage - 4)
                                    pageNum = startPage + i
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium ${currentPage === pageNum
                                            ? "bg-[#00A949] text-white"
                                            : "bg-white text-[#00A949] border border-gray-200 hover:bg-[#F0FFF5]"
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(totalCount / 10)))}
                                disabled={currentPage === Math.ceil(totalCount / 10)}
                                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 disabled:opacity-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 하단 네비게이션 */}
            {/* 카드 추가 버튼 - 오른쪽 하단에 배치 
            //h-12 w-12 rounded-full shadow-md bg-white hover:bg-gray-100*/}
            <BottomNavigation
                floatingActionButton={
                    <Dialog>
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
            {showCardDetail && selectedCard && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-t-lg sm:rounded-lg w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col">
                        {/* 헤더 */}
                        <div className="p-3 border-b flex justify-between items-center bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white">
                            <h2 className="font-bold text-lg">{selectedCard.name || selectedCard.cardName} 혜택</h2>
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
                                src={selectedCard.image || selectedCard.cardImageUrl || "/placeholder.svg"}
                                alt={selectedCard.name || selectedCard.cardName}
                                className="w-full h-full object-contain p-4"
                            />
                        </div>

                        {/* 카드 정보 */}
                        <div className="p-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{selectedCard.name || selectedCard.cardName}</h3>
                                    <p className="text-sm text-gray-500">
                                        {selectedCard.cardCompany || selectedCard.cardBrand} | {selectedCard.cardType}
                                    </p>
                                </div>
                                <Badge className="bg-[#75CB3B]/20 text-[#00A949] border-none">
                                    {selectedCard.spendingGoal
                                        ? `실적 ${selectedCard.spendingGoal.toLocaleString()}원`
                                        : renderAnnualFee(selectedCard.cardDomesticAnnualFee || 0, selectedCard.cardGlobalAnnualFee || 0)}
                                </Badge>
                            </div>

                            {selectedCard.currentSpending !== undefined && (
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
                            )}
                        </div>

                        {/* 상세 혜택 */}
                        <div className="flex-1 overflow-auto p-4 pt-0">
                            <h4 className="font-medium text-[#5A3D2B] mt-4 mb-2">상세 혜택</h4>
                            <div className="space-y-3">
                                {selectedCard.benefits && selectedCard.benefits.length > 0 ? (
                                    selectedCard.benefits.map((benefit: CardBenefitDetail) => (
                                        <div key={benefit.cardBenefitId} className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex justify-between items-start">
                                                <h5 className="font-medium text-[#00A949]">{benefit.cardBenefitTitle}</h5>
                                                <Badge className="bg-[#75CB3B]/20 text-[#00A949] border-none">
                                                    {benefit.cardBenefitDiscntRate > 0
                                                        ? `${benefit.cardBenefitDiscntRate}% 할인`
                                                        : benefit.cardBenefitDiscntPrice > 0
                                                            ? `${benefit.cardBenefitDiscntPrice.toLocaleString()}원 할인`
                                                            : "혜택"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-1">{benefit.cardBenefitDesc}</p>
                                            <p className="text-xs text-gray-500 mt-1">{benefit.cardBenefitCondition}</p>
                                            {benefit.cardBenefitStore && (
                                                <p className="text-xs text-[#00A949] mt-1">적용 매장: {benefit.cardBenefitStore}</p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-4">
                                        {isLoadingDetail ? "혜택 정보를 불러오는 중..." : "혜택 정보가 없습니다."}
                                    </div>
                                )}
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
            )}
        </main>
    )
}
