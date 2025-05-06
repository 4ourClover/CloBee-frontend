"use client"

import { useEffect, useState } from "react"
import {
    fetchAllCards,
    fetchCardDetail,
    applyCard,
    fetchMyCards,
    fetchCardSpending,
    searchCards,
    addUserCard,
} from "../lib/card/cardApi"
import type { CardListDTO, CardBenefitDetail, CardSpendingInfo } from "../lib/card/cardTypes"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, Plus, Trash2, Camera, Search, X, RotateCcw, PlusCircle } from "lucide-react"

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

    // 상단에 userId 상태 추가 (import 문 아래, 컴포넌트 내부 상단)
    const [userId, setUserId] = useState<number>(1) // 임시로 userId를 1로 설정 (실제 구현 시 로그인한 사용자의 ID로 대체 필요)
    const [myCardsList, setMyCardsList] = useState<CardListDTO[]>([])
    const [isLoadingMyCards, setIsLoadingMyCards] = useState(false)
    const [cardSpendingInfo, setCardSpendingInfo] = useState<Record<number, CardSpendingInfo>>({})
    const [isLoadingSpending, setIsLoadingSpending] = useState(false)
    const [cardBenefits, setCardBenefits] = useState<Record<number, CardBenefitDetail[]>>({})

    // 전체 카드 목록
    const [allCards, setAllCards] = useState<CardListDTO[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedCardType, setSelectedCardType] = useState("credit")

    // 검색 관련 상태 추가
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<CardListDTO[]>([])
    const [isSearchMode, setIsSearchMode] = useState(false)

    // 카드 추가 모달 관련 상태
    const [showAddCardModal, setShowAddCardModal] = useState(false)
    const [addCardSearchQuery, setAddCardSearchQuery] = useState("")
    const [addCardSearchResults, setAddCardSearchResults] = useState<CardListDTO[]>([])
    const [isAddCardSearching, setIsAddCardSearching] = useState(false)
    const [addCardSelectedType, setAddCardSelectedType] = useState("credit")
    const [isAddingCard, setIsAddingCard] = useState(false)

    // 카드 타입이 변경될 때 항상 1페이지로 이동
    useEffect(() => {
        setCurrentPage(1)
    }, [selectedCardType])

    useEffect(() => {
        if (activeTab === "all-cards" && !isSearchMode) {
            fetchAllCards(selectedCardType, currentPage, 10)
                .then((data) => {
                    setAllCards(data.cardPageList)
                    setTotalCount(data.totalCount)
                })
                .catch((err) => {
                    console.error("카드 데이터 로딩 실패", err)
                })
        }
    }, [activeTab, currentPage, selectedCardType, isSearchMode])

    // 내 카드 목록 가져오기
    useEffect(() => {
        if (activeTab === "my-cards") {
            setIsLoadingMyCards(true)
            setIsLoadingSpending(true)

            // 카드 목록 가져오기
            fetchMyCards(userId)
                .then((data) => {
                    // 카드 목록의 실적 정보와 혜택 정보를 병렬로 가져오기
                    const spendingPromises = data.map((card) =>
                        fetchCardSpending(card.cardInfoId, userId).catch(() => ({
                            cardInfoId: card.cardInfoId,
                            currentSpending: 0,
                            spendingGoal: 300000,
                        })),
                    )

                    const benefitPromises = data.map((card) => fetchCardDetail(card.cardInfoId).catch(() => []))

                    // 모든 데이터를 한 번에 처리
                    return Promise.all([
                        Promise.all(spendingPromises),
                        Promise.all(benefitPromises),
                        data, // 원본 카드 목록도 전달
                    ])
                })
                .then(([spendingInfoArray, benefitsArray, cardsList]) => {
                    // 실적 정보 맵 생성
                    const spendingInfoMap: Record<number, CardSpendingInfo> = {}
                    spendingInfoArray.forEach((info) => {
                        if (info) {
                            spendingInfoMap[info.cardInfoId] = info
                        }
                    })

                    // 혜택 정보 맵 생성
                    const benefitsMap: Record<number, CardBenefitDetail[]> = {}
                    cardsList.forEach((card, index) => {
                        benefitsMap[card.cardInfoId] = benefitsArray[index]
                    })

                    // 모든 상태를 한 번에 업데이트 (배치 업데이트)
                    setMyCardsList(cardsList)
                    setCardSpendingInfo(spendingInfoMap)
                    setCardBenefits(benefitsMap)
                })
                .catch((err) => {
                    console.error("내 카드 목록 로딩 실패", err)
                    toast({
                        title: "내 카드 목록 로딩 실패",
                        description: "내 카드 목록을 불러오는 중 오류가 발생했습니다.",
                        variant: "destructive",
                    })
                })
                .finally(() => {
                    // 모든 로딩 상태를 한 번에 false로 설정
                    setIsLoadingMyCards(false)
                    setIsLoadingSpending(false)
                })
        }
    }, [activeTab, userId, toast])

    // 카드 검색 핸들러
    const handleSearchCards = async () => {
        if (!searchQuery.trim()) {
            // 검색어가 없을 때는 검색 모드를 비활성화하고 전체 카드 리스트를 보여줌
            setIsSearchMode(false)

            // 백엔드 API를 호출하지 않고 toast 메시지만 표시
            toast({
                title: "검색어를 입력하세요",
                description: "카드 이름을 입력한 후 검색해주세요.",
                variant: "destructive",
            })
            return
        }

        setIsSearching(true)
        setIsSearchMode(true)

        try {
            const results = await searchCards(searchQuery)
            setSearchResults(results)

            // 검색 결과 개수 표시 (카드 타입 필터링 전)
            const totalResults = results.length

            // 현재 선택된 카드 타입에 맞는 결과 개수 계산
            const filteredResults = results.filter(
                (card) =>
                    (selectedCardType === "credit" && card.cardType === 401) ||
                    (selectedCardType === "check" && card.cardType === 402),
            )

            toast({
                title: "검색 완료",
                description: `총 ${totalResults}개의 카드 중 ${filteredResults.length}개의 ${selectedCardType === "credit" ? "신용" : "체크"}카드를 찾았습니다.`,
            })
        } catch (error: any) {
            console.error("카드 검색 실패:", error)

            // 백엔드에서 보낸 에러 메시지 처리
            if (error.response && error.response.data && error.response.data.message) {
                toast({
                    title: "검색 실패",
                    description: error.response.data.message,
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "검색 실패",
                    description: "카드 검색 중 오류가 발생했습니다.",
                    variant: "destructive",
                })
            }
        } finally {
            setIsSearching(false)
        }
    }

    // 카드 추가 모달 내 검색 핸들러
    const handleAddCardSearch = async () => {
        if (!addCardSearchQuery.trim()) {
            toast({
                title: "검색어를 입력하세요",
                description: "카드 이름을 입력한 후 검색해주세요.",
                variant: "destructive",
            })
            return
        }

        setIsAddCardSearching(true)

        try {
            const results = await searchCards(addCardSearchQuery)
            setAddCardSearchResults(results)

            // 검색 결과 개수 표시 (카드 타입 필터링 전)
            const totalResults = results.length

            // 현재 선택된 카드 타입에 맞는 결과 개수 계산
            const filteredResults = results.filter(
                (card) =>
                    (addCardSelectedType === "credit" && card.cardType === 401) ||
                    (addCardSelectedType === "check" && card.cardType === 402),
            )

            toast({
                title: "검색 완료",
                description: `총 ${totalResults}개의 카드 중 ${filteredResults.length}개의 ${addCardSelectedType === "credit" ? "신용" : "체크"}카드를 찾았습니다.`,
            })
        } catch (error: any) {
            console.error("카드 검색 실패:", error)

            // 백엔드에서 보낸 에러 메시지 처리
            if (error.response && error.response.data && error.response.data.message) {
                toast({
                    title: "검색 실패",
                    description: error.response.data.message,
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "검색 실패",
                    description: "카드 검색 중 오류가 발생했습니다.",
                    variant: "destructive",
                })
            }
        } finally {
            setIsAddCardSearching(false)
        }
    }

    // 검색 초기화 핸들러
    const handleResetSearch = () => {
        setSearchQuery("")
        setSearchResults([])
        setIsSearchMode(false)
    }

    // 카드 추가 모달 검색 초기화 핸들러
    const handleResetAddCardSearch = () => {
        setAddCardSearchQuery("")
        setAddCardSearchResults([])
    }

    // 카드 추가 핸들러 (모달에서 카드 선택 후)
    const handleAddUserCard = async (cardInfoId: number, cardType: number) => {
        setIsAddingCard(true)
        try {
            // 카드 타입 값 설정 (401: 신용카드, 402: 체크카드)
            const userCardType = cardType

            // 백엔드 API 호출
            await addUserCard(userId, cardInfoId, userCardType)

            toast({
                title: "카드가 추가되었습니다",
                description: "새로운 카드가 내 카드 목록에 추가되었습니다.",
            })

            // 모달 닫기
            setShowAddCardModal(false)

            // 검색 초기화
            handleResetAddCardSearch()

            // 내 카드 목록 새로고침 (activeTab을 변경했다가 다��� 돌아오는 방식)
            if (activeTab === "my-cards") {
                setActiveTab("all-cards")
                setTimeout(() => {
                    setActiveTab("my-cards")
                }, 100)
            } else {
                setActiveTab("my-cards")
            }
        } catch (error) {
            console.error("카드 추가 실패:", error)
            toast({
                title: "카드 추가 실패",
                description: "카드를 추가하는 중 오류가 발생했습니다.",
                variant: "destructive",
            })
        } finally {
            setIsAddingCard(false)
        }
    }

    // 기존 카드 추가 핸들러 (이전 모달용)
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

    // 내 카드 목록 핸들러 추가 (다른 핸들러 근처에 추가)
    const handleViewMyCardDetail = async (cardInfoId: number) => {
        setIsLoadingDetail(true)
        try {
            // 데이터베이스에서 카드 상세 정보(혜택) 가져오기
            const cardBenefits = await fetchCardDetail(cardInfoId)

            // 카드 기본 정보 찾기
            const cardItem = myCardsList.find((card) => card.cardInfoId === cardInfoId)

            if (!cardItem) {
                throw new Error("카드 정보를 찾을 수 없습니다.")
            }

            // 카드 실적 정보 가져오기
            const spendingInfo = cardSpendingInfo[cardInfoId]

            // 카드 기본 정보와 혜택 정보를 합쳐서 selectedCard에 설정
            setSelectedCard({
                ...cardItem,
                benefits: cardBenefits,
                currentSpending: spendingInfo?.currentSpending,
                spendingGoal: spendingInfo?.spendingGoal,
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

    // 카드 목록 렌더링 함수
    const renderCardList = () => {
        // 검색 모드인 경우 검색 결과를, 아닌 경우 전체 카드 목록을 사용
        const cards = isSearchMode ? searchResults : allCards

        if (isSearching) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-500">카드를 검색하는 중...</p>
                </div>
            )
        }

        // 카드 타입에 따라 필터링
        const filteredCards = cards.filter((card) => {
            // cardType이 401이면 신용카드, 402면 체크카드로 가정
            return (
                (selectedCardType === "credit" && card.cardType === 401) ||
                (selectedCardType === "check" && card.cardType === 402)
            )
        })

        if (isSearchMode && searchResults.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-500">검색 결과가 없습니다.</p>
                    <Button
                        className="mt-4 bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                        onClick={handleResetSearch}
                    >
                        검색 초기화
                    </Button>
                </div>
            )
        }

        if (filteredCards.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-500">
                        {isSearchMode
                            ? `선택한 카드 타입(${selectedCardType === "credit" ? "신용카드" : "체크카드"})에 해당하는 검색 결과가 없습니다.`
                            : `선택한 카드 타입(${selectedCardType === "credit" ? "신용카드" : "체크카드"})에 해당하는 카드가 없습니다.`}
                    </p>
                    {isSearchMode && (
                        <Button
                            className="mt-4 bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                            onClick={handleResetSearch}
                        >
                            검색 초기화
                        </Button>
                    )}
                </div>
            )
        }

        return filteredCards.map((card) => (
            <div key={card.cardInfoId} className="bg-white rounded-lg shadow-xs overflow-hidden border border-gray-100">
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
        ))
    }

    // 카드 추가 모달 내 카드 목록 렌더링 함수
    const renderAddCardSearchResults = () => {
        if (isAddCardSearching) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-500">카드를 검색하는 중...</p>
                </div>
            )
        }

        if (addCardSearchResults.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-500">검색 결과가 없습니다.</p>
                    <Button
                        className="mt-4 bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                        onClick={handleResetAddCardSearch}
                    >
                        검색 초기화
                    </Button>
                </div>
            )
        }

        // 카드 타입에 따라 필터링
        const filteredCards = addCardSearchResults.filter((card) => {
            return (
                (addCardSelectedType === "credit" && card.cardType === 401) ||
                (addCardSelectedType === "check" && card.cardType === 402)
            )
        })

        if (filteredCards.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-500">
                        선택한 카드 타입({addCardSelectedType === "credit" ? "신용카드" : "체크카드"})에 해당하는 검색 결과가
                        없습니다.
                    </p>
                    <Button
                        className="mt-4 bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                        onClick={handleResetAddCardSearch}
                    >
                        검색 초기화
                    </Button>
                </div>
            )
        }

        return filteredCards.map((card) => (
            <div key={card.cardInfoId} className="bg-white rounded-lg shadow-xs overflow-hidden border border-gray-100 mb-3">
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
                                    handleAddUserCard(card.cardInfoId, card.cardType)
                                }}
                                disabled={isAddingCard}
                            >
                                {isAddingCard ? "추가 중..." : "카드 추가하기"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        ))
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
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 h-6 w-6"
                            aria-label="카드 추가하기"
                            onClick={() => setShowAddCardModal(true)}
                        >
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
                        {isLoadingMyCards ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">내 카드 목록을 불러오는 중...</p>
                            </div>
                        ) : myCardsList.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">등록된 카드가 없습니다.</p>
                                <Button
                                    className="mt-4 bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                                    onClick={() => setShowAddCardModal(true)}
                                >
                                    카드 추가하기
                                </Button>
                            </div>
                        ) : (
                            myCardsList.map((card) => {
                                // 카드 실적 정보 가져오기
                                const spendingInfo = cardSpendingInfo[card.cardInfoId]
                                const currentSpending = spendingInfo?.currentSpending || 0
                                const spendingGoal = spendingInfo?.spendingGoal || 1
                                const percentage = (currentSpending / spendingGoal) * 100
                                const progressGradient = getProgressGradient(percentage)

                                return (
                                    <div
                                        key={card.cardInfoId}
                                        className="bg-white rounded-lg shadow-xs overflow-hidden border border-gray-100 cursor-pointer"
                                        onClick={() => handleViewMyCardDetail(card.cardInfoId)}
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
                                                <div className="flex justify-between">
                                                    <h3 className="font-bold text-sm">{card.cardName}</h3>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-red-600"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleDeleteCard(card.cardInfoId)
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* 이번 달 실적 표시 수정 */}
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-500">이번 달 실적</span>
                                                    <span className="font-medium">
                                                        {currentSpending.toLocaleString()}원 / {spendingGoal.toLocaleString()}원
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden -mt-1">
                                                    <div className={`h-full ${progressGradient}`} style={{ width: `${percentage}%` }}></div>
                                                </div>

                                                {/* 혜택 태그 표시 - 실제 혜택 정보 사용 */}
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {cardBenefits[card.cardInfoId]?.slice(0, 3).map((benefit, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="bg-[#75CB3B]/20 text-[#00A949] text-xs px-1.5 py-0.5 rounded-full"
                                                        >
                                                            {benefit.cardBenefitTitle}{" "}
                                                            {benefit.cardBenefitDiscntRate > 0
                                                                ? `${benefit.cardBenefitDiscntRate}%`
                                                                : benefit.cardBenefitDiscntPrice > 0
                                                                    ? `${benefit.cardBenefitDiscntPrice.toLocaleString()}원`
                                                                    : ""}
                                                        </span>
                                                    ))}
                                                    {!cardBenefits[card.cardInfoId] || cardBenefits[card.cardInfoId].length === 0 ? (
                                                        // 혜택 정보가 없을 경우 기본 혜택 표시
                                                        <>
                                                            <span className="bg-[#75CB3B]/20 text-[#00A949] text-xs px-1.5 py-0.5 rounded-full">
                                                                혜택 정보 없음
                                                            </span>
                                                        </>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* 검색 입력란과 버튼 */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    className="pl-9 pr-4 py-2 rounded-full border-[#75CB3B]/30 focus-visible:ring-[#00A949]"
                                    placeholder="카드 검색..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSearchCards()
                                        }
                                    }}
                                />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#00A949]" />
                            </div>
                            <Button
                                className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] text-white"
                                onClick={handleSearchCards}
                                disabled={isSearching}
                            >
                                검색
                            </Button>
                            {isSearchMode && (
                                <Button
                                    variant="outline"
                                    className="border-[#75CB3B]/30 text-[#00A949] hover:bg-[#75CB3B]/10"
                                    onClick={handleResetSearch}
                                >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    초기화
                                </Button>
                            )}
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

                        {/* 카드 목록 렌더링 */}
                        {renderCardList()}

                        {/* 페이지네이션 - 검색 모드가 아닐 때만 표시 */}
                        {!isSearchMode && (
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
                        )}
                    </div>
                )}
            </div>

            {/* 하단 네비게이션 */}
            {/* 카드 추가 버튼 - 오른쪽 하단에 배치 */}
            <BottomNavigation
                floatingActionButton={
                    <Button
                        className="h-14 w-14 rounded-full shadow-md bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] p-0 overflow-hidden"
                        onClick={() => setShowAddCardModal(true)}
                    >
                        <PlusCircle className="h-8 w-8 text-white" />
                    </Button>
                }
            />

            {/* 카드 추가 모달 */}
            <Dialog open={showAddCardModal} onOpenChange={setShowAddCardModal}>
                <DialogContent className="max-w-sm mx-auto">
                    <DialogHeader>
                        <DialogTitle>카드 추가하기</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="add-card-type">카드 종류</Label>
                            <Select value={addCardSelectedType} onValueChange={(value) => setAddCardSelectedType(value)}>
                                <SelectTrigger id="add-card-type">
                                    <SelectValue placeholder="카드 종류 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="credit">신용카드</SelectItem>
                                    <SelectItem value="check">체크카드</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="add-card-search">카드 검색</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        id="add-card-search"
                                        className="pl-9 pr-4 py-2 rounded-full border-[#75CB3B]/30 focus-visible:ring-[#00A949]"
                                        placeholder="카드 검색..."
                                        value={addCardSearchQuery}
                                        onChange={(e) => setAddCardSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleAddCardSearch()
                                            }
                                        }}
                                    />
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#00A949]" />
                                </div>
                                <Button
                                    className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] text-white"
                                    onClick={handleAddCardSearch}
                                    disabled={isAddCardSearching}
                                >
                                    검색
                                </Button>
                            </div>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto">{renderAddCardSearchResults()}</div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">닫기</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                        {selectedCard.cardCompany || selectedCard.cardBrand} |{" "}
                                        {selectedCard.cardType === 401 ? "신용카드" : "체크카드"}
                                    </p>
                                </div>
                                <Badge className="bg-[#75CB3B]/20 text-[#00A949] border-none">
                                    {renderAnnualFee(selectedCard.cardDomesticAnnualFee || 0, selectedCard.cardGlobalAnnualFee || 0)}
                                </Badge>
                            </div>

                            {/* 이번 달 실적 정보 표시 수정 */}
                            <div className="space-y-1 mt-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">이번 달 실적</span>
                                    <span className="font-medium">
                                        {(selectedCard.currentSpending || 0).toLocaleString()}원 /{" "}
                                        {(selectedCard.spendingGoal || 1).toLocaleString()}원
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#75CB3B] to-[#00B959]"
                                        style={{
                                            width: `${((selectedCard.currentSpending || 0) / (selectedCard.spendingGoal || 1)) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
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
