"use client"

import { useEffect, useState } from "react"
import {
    fetchAllCards,
    fetchCardDetail,
    applyCard,
    fetchMyCards,
    searchCards,
    addUserCard,
    fetchCardPerformance,
    deleteUserCard,
} from "../lib/card/cardApi"
import type { CardListDTO, CardBenefitDetail, UserCardPerformanceDetail, } from "../lib/card/cardTypes"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, Plus, Trash2, Search, X, RotateCcw, PlusCircle, Calendar } from "lucide-react"
import api from '../api/axios/index';
import { CustomAlert } from "../components/custom-alert"
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
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import { useCurrentUser } from "../hooks/use-current-user"

export default function CardsPage() {
    const [activeTab, setActiveTab] = useState("my-cards")
    const [selectedCard, setSelectedCard] = useState<any>(null)
    const [showCardDetail, setShowCardDetail] = useState(false)
    const [isLoadingDetail, setIsLoadingDetail] = useState(false)
    const { toast } = useToast()

    const Component = () => {
        const [userId, setUserId] = useState<number | null>(null)  // 초깃값은 null로
        const user = useCurrentUser()

        useEffect(() => {
            if (user?.userId) {
                setUserId(user.userId)
            }
        }, [user?.userId]) // user가 바뀔 때만 set

        useEffect(() => {
            if (userId !== null) {
                fetch(`${API_BASE_URL}/status?user_id=${userId}`)
                    .then(res => res.json())
                    .then(data => {
                        console.log("Fetched data:", data)
                    })
            }
        }, [userId])

        return <div>userId: {userId}</div>
    }

    // 커스텀 알림 상태 추가
    const [alertOpen, setAlertOpen] = useState(false)
    const [alertMessage, setAlertMessage] = useState("")

    // 상단에 userId 상태 추가 (import 문 아래, 컴포넌트 내부 상단)
    // const [userId, setUserId] = useState<number>(1) // 임시로 userId를 1로 설정 (실제 구현 시 로그인한 사용자의 ID로 대체 필요)
    const [myCardsList, setMyCardsList] = useState<CardListDTO[]>([])
    const [isLoadingMyCards, setIsLoadingMyCards] = useState(false)
    const [cardPerformanceInfo, setCardPerformanceInfo] = useState<Record<number, UserCardPerformanceDetail>>({})
    const [isLoadingPerformance, setIsLoadingPerformance] = useState(false)
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

    // 실적 목표 금액 (백엔드에서 제공하지 않으므로 프론트에서 설정)
    const DEFAULT_SPENDING_GOAL = 300000

    // 년도와 월 선택 상태 추가
    // 기본값을 2025년 5월로 설정 (데이터베이스에 있는 데이터에 맞춤)
    const [selectedYear, setSelectedYear] = useState(2025)
    const [selectedMonth, setSelectedMonth] = useState(5)
    const [showDateSelector, setShowDateSelector] = useState(false)

    // 년도와 월 옵션 생성
    const yearOptions = [2024, 2025, 2026]
    const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

    // 카드 삭제용 상태 변수
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [pendingDeleteCardId, setPendingDeleteCardId] = useState<number | null>(null)

    // 카드 삭제 ㅇ요청 트리거 함수 
    const requestDeleteCard = (cardId: number) => {
        setPendingDeleteCardId(cardId)
        setConfirmDeleteOpen(true)
    }

    // 커스텀 알림 표시 함수
    const showAlert = (message: string) => {
        setAlertMessage(message)
        setAlertOpen(true)
    }

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
    // 로그 추가하여 API 호출 디버깅
    useEffect(() => {
        if (activeTab === "my-cards") {
            setIsLoadingMyCards(true)
            setIsLoadingPerformance(true)

            console.log(`Fetching my cards for userId: ${userId}`)

            // 카드 목록 가져오기
            fetchMyCards(userId)
                .then((data) => {
                    console.log("My cards data:", data)

                    // 카드 실적 상세 정보 가져오기
                    // userCardId가 있는 카드만 필터링하여 실적 정보 조회
                    const cardsWithUserCardId = data.filter((card) => card.userCardId !== undefined)
                    console.log(`Cards with userCardId:`, cardsWithUserCardId)

                    if (cardsWithUserCardId.length === 0) {
                        console.log("No cards with userCardId found")
                        return Promise.all([[], [], data])
                    }

                    const performancePromises = cardsWithUserCardId.map((card) => {
                        console.log(
                            `Fetching performance for userCardId: ${card.userCardId}, year: ${selectedYear}, month: ${selectedMonth}`,
                        )
                        return fetchCardPerformance(card.userCardId!, selectedYear, selectedMonth)
                            .then((result) => {
                                console.log(`Performance result for userCardId ${card.userCardId}:`, result)
                                return result
                            })
                            .catch((error) => {
                                console.error(`Error fetching performance for userCardId ${card.userCardId}:`, error)
                                return {
                                    performanceId: 0,
                                    userCardId: card.userCardId!,
                                    year: selectedYear,
                                    month: selectedMonth,
                                    monthlyAmount: 0,
                                }
                            })
                    })

                    const benefitPromises = data.map((card) => fetchCardDetail(card.cardInfoId).catch(() => []))

                    // 모든 데이터를 한 번에 처리
                    return Promise.all([
                        Promise.all(performancePromises),
                        Promise.all(benefitPromises),
                        data, // 원본 카드 목록도 전달
                    ])
                })
                .then(([performanceInfoArray, benefitsArray, cardsList]) => {
                    console.log("All performance data:", performanceInfoArray)

                    // 실적 상세 정보 맵 생성
                    const performanceInfoMap: Record<number, UserCardPerformanceDetail> = {}
                    performanceInfoArray.forEach((info) => {
                        if (info && info.userCardId) {
                            performanceInfoMap[info.userCardId] = info
                            console.log(`Added performance info for userCardId ${info.userCardId}:`, info)
                        }
                    })

                    console.log("Performance info map:", performanceInfoMap)

                    // 혜택 정보 맵 생성
                    const benefitsMap: Record<number, CardBenefitDetail[]> = {}
                    cardsList.forEach((card, index) => {
                        benefitsMap[card.cardInfoId] = benefitsArray[index]
                    })

                    // 모든 상태를 한 번에 업데이트 (배치 업데이트)
                    setMyCardsList(cardsList)
                    setCardPerformanceInfo(performanceInfoMap)
                    setCardBenefits(benefitsMap)

                    // 실적 정보가 있는지 확인
                    if (Object.keys(performanceInfoMap).length > 0) {
                        toast({
                            title: "실적 정보 로드 완료",
                            description: `${selectedYear}년 ${selectedMonth}월 실적 정보를 불러왔습니다.`,
                        })
                    } else if (cardsList.filter((card) => card.userCardId !== undefined).length > 0) {
                        toast({
                            title: "실적 정보 없음",
                            description: `${selectedYear}년 ${selectedMonth}월에 해당하는 실적 정보가 없습니다.`,
                        })
                    }
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
                    setIsLoadingPerformance(false)
                })
        }
    }, [activeTab, userId, toast, selectedYear, selectedMonth])

    // 년도와 월이 변경될 때 실적 정보 다시 로드
    const handleDateChange = (year: number, month: number) => {
        setSelectedYear(year)
        setSelectedMonth(month)
        setShowDateSelector(false)

        // 이미 내 카드 탭이 활성화되어 있다면 데이터 새로고침
        if (activeTab === "my-cards") {
            setIsLoadingPerformance(true)

            // userCardId가 있는 카드만 필터링하여 실적 정보 조회
            const cardsWithUserCardId = myCardsList.filter((card) => card.userCardId !== undefined)

            if (cardsWithUserCardId.length === 0) {
                setIsLoadingPerformance(false)
                toast({
                    title: "카드 정보 없음",
                    description: "실적 정보를 조회할 카드가 없습니다.",
                    variant: "destructive",
                })
                return
            }

            const performancePromises = cardsWithUserCardId.map((card) => {
                return fetchCardPerformance(card.userCardId!, year, month)
                    .then((result) => {
                        console.log(`Performance result for userCardId ${card.userCardId}:`, result)
                        return result
                    })
                    .catch(() => ({
                        performanceId: 0,
                        userCardId: card.userCardId!,
                        year: year,
                        month: month,
                        monthlyAmount: 0,
                    }))
            })

            Promise.all(performancePromises)
                .then((performanceInfoArray) => {
                    // 실적 상세 정보 맵 생성
                    const performanceInfoMap: Record<number, UserCardPerformanceDetail> = {}
                    performanceInfoArray.forEach((info) => {
                        if (info && info.userCardId) {
                            performanceInfoMap[info.userCardId] = info
                        }
                    })

                    // 실적 정보 업데이트
                    setCardPerformanceInfo(performanceInfoMap)

                    // 실적 정보가 있는지 확인
                    if (Object.keys(performanceInfoMap).length > 0) {
                        toast({
                            title: "실적 정보 업데이트 완료",
                            description: `${year}년 ${month}월 실적 정보를 불러왔습니다.`,
                        })
                    } else {
                        toast({
                            title: "실적 정보 없음",
                            description: `${year}년 ${month}월에 해당하는 실적 정보가 없습니다.`,
                        })
                    }
                })
                .catch((err) => {
                    console.error("실적 정보 로딩 실패", err)
                    toast({
                        title: "실적 정보 로딩 실패",
                        description: "실적 정보를 불러오는 중 오류가 발생했습니다.",
                        variant: "destructive",
                    })
                })
                .finally(() => {
                    setIsLoadingPerformance(false)
                })
        }
    }

    // 카드 검색 핸들러
    const handleSearchCards = async () => {
        if (!searchQuery.trim()) {
            // 검색어가 없을 때는 검색 모드를 비활성화하고 전체 카드 리스트를 보여줌
            setIsSearchMode(false)

            // 커스텀 알림 표시
            setAlertMessage("검색어를 입력해주세요")
            setAlertOpen(true)
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
            // 검색어가 없을 때 커스텀 알림 표시
            setAlertMessage("검색어를 입력해주세요")
            setAlertOpen(true)
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

    // 카드 추가 모달 상태 변경 시 검색 결과 초기화 처리
    // showAddCardModal 상태가 변경될 때 검색 결과를 초기화하도록 수정
    // setShowAddCardModal 함수를 직접 사용하는 대신 handleAddCardModalChange 함수를 사용

    // 다음 코드를 추가합니다 (handleAddCardModalChange 함수 추가)
    // 기존 핸들러 근처에 추가 (예: handleResetAddCardSearch 함수 아래)
    const handleAddCardModalChange = (open: boolean) => {
        setShowAddCardModal(open)

        // 모달이 열릴 때 신용카드를 기본값으로 설정하고, 닫힐 때 검색 결과 초기화
        if (open) {
            setAddCardSelectedType("credit")
        } else {
            handleResetAddCardSearch()
        }
    }

    // 카드 추가 핸들러 (모달에서 카드 선택 후)
    const handleAddUserCard = async (cardInfoId: number, cardType: number) => {
        setIsAddingCard(true)
        try {
            await addUserCard(userId, cardInfoId, cardType)

            setAlertMessage("카드가 추가되었습니다")
            setAlertOpen(true)

            setShowAddCardModal(false)
            handleResetAddCardSearch()

            if (activeTab === "my-cards") {
                setActiveTab("all-cards")
                setTimeout(() => setActiveTab("my-cards"), 100)
            } else {
                setActiveTab("my-cards")
            }
        } catch (error: any) {
            const status = error?.response?.status
            const message = error?.response?.data || "카드를 추가하는 중 오류가 발생했습니다."

            if (status === 409 || message.includes("이미 등록된 카드")) {
                setAlertMessage("이미 등록된 카드입니다")
            } else {
                setAlertMessage("카드 추가 실패: " + message)
            }
            setAlertOpen(true)
        } finally {
            setIsAddingCard(false)
        }
    }


    // 카드 삭제 핸들러
    const confirmDeleteCard = async () => {
        if (pendingDeleteCardId === null) return
        try {
            await deleteUserCard(userId, pendingDeleteCardId)

            toast({
                title: "카드가 삭제되었습니다",
                description: "선택한 카드가 내 카드 목록에서 삭제되었습니다.",
                variant: "destructive",
            })

            setConfirmDeleteOpen(false)
            setPendingDeleteCardId(null)

            // 카드 목록 갱신
            if (activeTab === "my-cards") {
                setActiveTab("all-cards")
                setTimeout(() => setActiveTab("my-cards"), 100)
            } else {
                setActiveTab("my-cards")
            }
        } catch (error) {
            console.error("카드 삭제 실패:", error)
            toast({
                title: "카드 삭제 실패",
                description: "삭제 중 문제가 발생했습니다.",
                variant: "destructive",
            })
            setConfirmDeleteOpen(false)
            setPendingDeleteCardId(null)
        }
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

            // URL이 유효한지 확인
            if (!url) {
                throw new Error("카드 신청 URL을 가져올 수 없습니다.")
            }

            // 새 창에서 URL 열기
            window.open(url, "_blank")
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

            // 카드 실적 상세 정보 가져오기 (userCardId가 있는 경우)
            let performanceInfo = null
            if (cardItem.userCardId) {
                performanceInfo = cardPerformanceInfo[cardItem.userCardId]
            }

            // 카드 기본 정보와 혜택 정보를 합쳐서 selectedCard에 설정
            setSelectedCard({
                ...cardItem,
                benefits: cardBenefits,
                monthlyAmount: performanceInfo?.monthlyAmount || 0,
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

    // 카드 추가 모달 내 카드 목록 렌더링 함수 수정
    // renderAddCardSearchResults 함수에서 상세 보기 버튼을 제거하고 카드 추가하기 버튼만 표시하도록 수정
    // 다음 코드로 renderAddCardSearchResults 함수의 return 부분을 수정합니다:
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
                </div>
            )
        }

        // renderAddCardSearchResults 함수 내의 return filteredCards.map 부분을 다음과 같이 수정:
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

                        <div className="flex mt-2">
                            <Button
                                className="w-full text-xs py-1 h-7 bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] border-none"
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
            {/* 메인 검색용 커스텀 알림 */}
            {alertOpen && !showAddCardModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
                    <div className="w-[80%] max-w-sm rounded-lg bg-white p-6 shadow-lg">
                        <div className="mb-6 text-center text-base font-medium">{alertMessage}</div>
                        <div className="flex justify-end">
                            <Button
                                onClick={() => setAlertOpen(false)}
                                className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-6 py-2 rounded-md"
                            >
                                확인
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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
                {/* 카드 추가 모달 Dialog 컴포넌트의 onOpenChange 속성을 수정합니다 */}
                {/* 다음 코드로 Dialog 컴포넌트의 onOpenChange 속성을 수정합니다: */}
                {/* <Dialog open={showAddCardModal} onOpenChange={setShowAddCardModal}> */}
                {/* 위 코드를 아래와 같이 변경: */}

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
                        {/* 날짜 선택기 추가 */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-sm font-medium text-gray-700">내 카드 목록</h2>
                            <Popover open={showDateSelector} onOpenChange={setShowDateSelector}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 border-[#75CB3B]/30 text-[#00A949] hover:bg-[#75CB3B]/10 hover:border-[#75CB3B]/50"
                                    >
                                        <Calendar className="h-3.5 w-3.5 mr-1" />
                                        {selectedYear}년 {selectedMonth}월
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <div className="p-3 space-y-3">
                                        <div className="space-y-1">
                                            <Label htmlFor="year-select">년도</Label>
                                            <Select
                                                value={selectedYear.toString()}
                                                onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                                            >
                                                <SelectTrigger id="year-select" className="w-full">
                                                    <SelectValue placeholder="년도 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {yearOptions.map((year) => (
                                                        <SelectItem key={year} value={year.toString()}>
                                                            {year}년
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="month-select">월</Label>
                                            <Select
                                                value={selectedMonth.toString()}
                                                onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
                                            >
                                                <SelectTrigger id="month-select" className="w-full">
                                                    <SelectValue placeholder="월 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {monthOptions.map((month) => (
                                                        <SelectItem key={month} value={month.toString()}>
                                                            {month}월
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            className="w-full bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                                            onClick={() => handleDateChange(selectedYear, selectedMonth)}
                                        >
                                            적용하기
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

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
                                // 카드 실적 상세 정보 가져오기 (userCardId가 있는 경우)
                                let performanceInfo = null
                                if (card.userCardId) {
                                    performanceInfo = cardPerformanceInfo[card.userCardId]
                                }

                                const monthlyAmount = performanceInfo?.monthlyAmount || 0
                                const percentage = (monthlyAmount / DEFAULT_SPENDING_GOAL) * 100
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
                                                                requestDeleteCard(card.cardInfoId)
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* 이번 달 실적 표시 수정 */}
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-500">
                                                        {selectedYear}년 {selectedMonth}월 실적
                                                    </span>
                                                    <span className="font-medium">
                                                        {monthlyAmount.toLocaleString()}원 / {DEFAULT_SPENDING_GOAL.toLocaleString()}원
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
            <Dialog open={showAddCardModal} onOpenChange={handleAddCardModalChange}>
                <DialogContent className="max-w-sm mx-auto">
                    {/* 커스텀 알림을 모달 내부에 추가 */}
                    {alertOpen && showAddCardModal && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60">
                            <div className="w-[80%] max-w-sm rounded-lg bg-white p-6 shadow-lg">
                                <div className="mb-6 text-center text-base font-medium">{alertMessage}</div>
                                <div className="flex justify-end">
                                    <Button
                                        onClick={() => setAlertOpen(false)}
                                        className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-6 py-2 rounded-md"
                                    >
                                        확인
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

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

            <CustomAlert
                isOpen={confirmDeleteOpen}
                message="정말 삭제하시겠습니까?"
                onClose={() => {
                    setConfirmDeleteOpen(false)
                    setPendingDeleteCardId(null)
                }}
            >
                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setConfirmDeleteOpen(false)
                            setPendingDeleteCardId(null)
                        }}
                    >
                        취소
                    </Button>
                    <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={confirmDeleteCard}
                    >
                        삭제
                    </Button>
                </div>
            </CustomAlert>

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

                            {/* 이번 달 실적 정보 표시 수정 - 내 카드인 경우에만 표시 */}
                            {selectedCard.userCardId && (
                                <div className="space-y-1 mt-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">
                                            {selectedYear}년 {selectedMonth}월 실적
                                        </span>
                                        <span className="font-medium">
                                            {(selectedCard.monthlyAmount || 0).toLocaleString()}원 / {DEFAULT_SPENDING_GOAL.toLocaleString()}
                                            원
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#75CB3B] to-[#00B959]"
                                            style={{
                                                width: `${((selectedCard.monthlyAmount || 0) / DEFAULT_SPENDING_GOAL) * 100}%`,
                                            }}
                                        />
                                    </div>

                                    {/* 실적 정보 추가 표시 */}
                                    <div className="flex justify-between text-xs mt-1">
                                        <span className="text-gray-500">
                                            {selectedYear}년 {selectedMonth}월 실적
                                        </span>
                                        <span
                                            className={
                                                selectedCard.monthlyAmount >= DEFAULT_SPENDING_GOAL
                                                    ? "text-[#00A949] font-medium"
                                                    : "text-gray-500"
                                            }
                                        >
                                            {selectedCard.monthlyAmount >= DEFAULT_SPENDING_GOAL ? "실적 달성 완료" : "실적 달성 중"}
                                        </span>
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
