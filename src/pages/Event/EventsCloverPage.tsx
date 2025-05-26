import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
    ChevronLeft,
    Clover,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { useToast } from "../../hooks/use-toast"
// @ts-ignore
import confetti from "canvas-confetti"
import BottomNavigation from "../../components/bottom-navigation"
import { useCurrentUser } from "../../hooks/use-current-user"

// API URL 상수 정의
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL + '/event/findClover'

export default function CloverGamePage() {
    const [clovers, setClovers] = useState<Array<{ id: number; isLucky: boolean; isFlipped: boolean }>>([])
    const [gameStarted, setGameStarted] = useState(false)
    const [gameWon, setGameWon] = useState(false)
    const [eventFindingCloverCurrentStage, setEventFindingCloverCurrentStage] = useState(0)
    const { toast } = useToast()
    const navigate = useNavigate()

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const [confirmMessage, setConfirmMessage] = useState<string>("")
    const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => { })

    const [showSuccessAlert, setShowSuccessAlert] = useState(false)
    const [nextStage, setNextStage] = useState(0)

    const user = useCurrentUser()
    const userId = user?.userId

    // 모달을 띄우는 헬퍼
    const showConfirmModal = useCallback((message: string, onConfirm: () => void) => {
        setConfirmMessage(message)
        setOnConfirmAction(() => onConfirm)
        setIsConfirmModalOpen(true)
    }, [])

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false)
    }

    // 게임 시작 핸들러
    const handleStartGame = useCallback(async () => {
        if (!userId) {
            toast({
                title: "오류",
                description: "사용자 정보를 불러올 수 없습니다.",
                variant: "destructive",
            })
            return
        }

        try {
            // 먼저 사용자 상태 확인
            let response = await fetch(`${API_BASE_URL}/status?user_id=${userId}`)

            // 404 오류가 발생하면 새로운 사용자이므로 초기화
            if (response.status === 404) {
                console.log('새로운 사용자 - 게임 초기화 진행')
                const initResponse = await fetch(`${API_BASE_URL}/init?user_id=${userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                if (!initResponse.ok) {
                    throw new Error('게임 초기화에 실패했습니다.')
                }

                // 초기화 후 다시 상태 확인
                response = await fetch(`${API_BASE_URL}/status?user_id=${userId}`)
            }

            if (!response.ok) {
                throw new Error('게임 상태를 불러오는데 실패했습니다.')
            }

            const data = await response.json()
            console.log('게임 상태:', data)

            if (data.eventFindingCloverParticipationStatus === true) {
                showConfirmModal(
                    '오늘은 이미 참여하셨습니다.',
                    () => navigate('/event')
                )
                return
            }

            // current stage에 따라 클로버 개수 변경
            let newClovers: Array<{ id: number; isLucky: boolean; isFlipped: boolean }> = []

            if (data.eventFindingCloverCurrentStage === 1) {
                newClovers = Array.from({ length: 16 }, (_, i) => ({
                    id: i,
                    isLucky: false,
                    isFlipped: false,
                }))
            } else if (data.eventFindingCloverCurrentStage === 2) {
                newClovers = Array.from({ length: 25 }, (_, i) => ({
                    id: i,
                    isLucky: false,
                    isFlipped: false,
                }))
            } else if (data.eventFindingCloverCurrentStage === 3) {
                newClovers = Array.from({ length: 36 }, (_, i) => ({
                    id: i,
                    isLucky: false,
                    isFlipped: false,
                }))
            }

            // 랜덤하게 하나의 클로버를 골드 네잎클로버로 지정
            const luckyIndex = Math.floor(Math.random() * newClovers.length)
            newClovers[luckyIndex].isLucky = true

            console.log("새로운 클로버 배열:", newClovers)

            setClovers(newClovers)
            setEventFindingCloverCurrentStage(data.eventFindingCloverCurrentStage)
            setGameStarted(true)
            setGameWon(false)
        } catch (error) {
            console.error('게임 시작 실패:', error)
            toast({
                title: "오류 발생",
                description: "게임을 시작하는데 실패했습니다.",
                variant: "destructive",
            })
        }
    }, [userId, navigate, showConfirmModal, toast])

    // 게임 초기화
    useEffect(() => {
        if (!gameStarted || !userId) return

        fetch(`${API_BASE_URL}/status?user_id=${userId}`)
            .then(response => response.json())
            .then(data => {
                setEventFindingCloverCurrentStage(data.eventFindingCloverCurrentStage)

                // 오늘 이미 참여한 경우 게임 종료
                if (data.eventFindingCloverParticipationStatus === true) {
                    showConfirmModal(
                        '오늘은 이미 참여하셨습니다.',
                        () => navigate('/event')
                    )
                    setGameStarted(false)
                    setGameWon(true)
                    return
                }

                let newClovers: Array<{ id: number; isLucky: boolean; isFlipped: boolean }> = [];

                // current stage에 따라 클로버 개수 변경
                if (data.eventFindingCloverCurrentStage === 1) {
                    newClovers = Array.from({ length: 16 }, (_, i) => ({
                        id: i,
                        isLucky: false,
                        isFlipped: false,
                    }))
                } else if (data.eventFindingCloverCurrentStage === 2) {
                    newClovers = Array.from({ length: 25 }, (_, i) => ({
                        id: i,
                        isLucky: false,
                        isFlipped: false
                    }))
                } else if (data.eventFindingCloverCurrentStage === 3) {
                    newClovers = Array.from({ length: 36 }, (_, i) => ({
                        id: i,
                        isLucky: false,
                        isFlipped: false,
                    }))
                }

                // 랜덤하게 하나의 클로버를 골드 클로버로 지정
                const luckyIndex = Math.floor(Math.random() * newClovers.length)
                newClovers[luckyIndex].isLucky = true

                setClovers(newClovers)
                setGameWon(false)
            })
            .catch(error => {
                console.error('Failed to fetch game status:', error)
                toast({
                    title: "오류 발생",
                    description: "게임 상태를 불러오는데 실패했습니다.",
                    variant: "destructive",
                })
            })
    }, [gameStarted, userId, navigate, showConfirmModal, toast])

    // 클로버 클릭 핸들러
    const handleCloverClick = async (id: number) => {
        if (!gameStarted || gameWon || !userId) return

        const updatedClovers = clovers.map((clover) => {
            if (clover.id === id && !clover.isFlipped) {
                const newClover = { ...clover, isFlipped: true }

                if (newClover.isLucky) {
                    setGameWon(true)

                    // 성공 시 API 호출
                    fetch(`${API_BASE_URL}/status?user_id=${userId}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.eventFindingCloverCurrentStage === 3) {
                                // 축하 효과
                                setTimeout(() => {
                                    confetti({
                                        particleCount: 100,
                                        spread: 70,
                                        origin: { y: 0.6 },
                                    })
                                }, 1000)
                                // 쿠폰 지급 완료 알림 (3초 지연)
                                if (!data.eventFindingCloverReceiveCoupon) {
                                    setTimeout(() => {
                                        showConfirmModal(
                                            '쿠폰이 지급되었습니다!',
                                            () => navigate('/event')
                                        )
                                    }, 3000)
                                } else {
                                    setTimeout(() => {
                                        showConfirmModal(
                                            '이미 쿠폰을 지급받았습니다',
                                            () => navigate('/event')
                                        )
                                    }, 3000)
                                }

                            } else {
                                const nextStage = data.eventFindingCloverCurrentStage + 1
                                setNextStage(nextStage)
                                setShowSuccessAlert(true)

                                // 3초 후 게임 상태 초기화 및 다음 단계 시작
                                setTimeout(() => {
                                    setShowSuccessAlert(false)
                                    setGameStarted(false)
                                    setGameWon(false)
                                    handleStartGame()
                                }, 3000)
                            }

                            // 마지막으로 시도 결과 전송
                            return fetch(`${API_BASE_URL}/attempt?user_id=${userId}&success=true`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            })
                        })
                        .catch(error => console.error('Failed to fetch status:', error))
                } else {
                    // 실패 시 API 호출
                    fetch(`${API_BASE_URL}/attempt?user_id=${userId}&success=false`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                        .then(() => {
                            // 실패 후 상태 확인
                            return fetch(`${API_BASE_URL}/status?user_id=${userId}`)
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.eventFindingCloverParticipationStatus === true || data.eventFindingCloverAttemptsLeft === 0) {
                                showConfirmModal(
                                    '횟수를 모두 소진하였습니다\n내일 다시 도전해주세요',
                                    () => navigate('/event')
                                )
                            }
                        })
                        .catch(error => console.error('Failed to update attempt:', error))
                }

                return newClover
            }
            return clover
        })

        setClovers(updatedClovers)
    }

    // 친구 초대 후 한판 더 진행
    const handleInviteFriend = async () => {
        if (!userId) {
            toast({
                title: "오류",
                description: "사용자 정보를 불러올 수 없습니다.",
                variant: "destructive",
            })
            return
        }

        try {
            const response = await fetch(`${API_BASE_URL}/init?user_id=${userId}&invited=true`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                toast({
                    title: "성공!",
                    description: "친구 초대로 한 번 더 도전할 수 있습니다!",
                })
                // 게임 상태 초기화 후 자동으로 게임 시작
                setGameStarted(false)
                setGameWon(false)
                setTimeout(() => {
                    handleStartGame()
                }, 100)
            }
        } catch (error) {
            console.error('Failed to invite friend:', error)
        }
    }

    return (
        <main className="flex flex-col h-screen max-w-sm mx-auto overflow-hidden">
            {/* 헤더 */}
            <header className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white p-3 flex items-center gap-2">
                <Link to="/event">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-lg font-bold flex-1">골드 네잎 클로버 찾기 게임</h1>
            </header>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 overflow-auto bg-[#F5FAF0] p-4">
                {!gameStarted ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-20 h-20 bg-[#75CB3B]/20 rounded-full flex items-center justify-center mb-4">
                            <Clover className="h-10 w-10 text-[#00A949]" />
                        </div>
                        <h2 className="text-xl font-bold text-[#5A3D2B] mb-2">골드 네잎 클로버 찾기</h2>
                        <p className="text-sm text-gray-600 mb-6 max-w-xs">
                            많은 네잎 클로버 중에서 골드 네잎 클로버를 찾아보세요! 찾으면 특별한 보상이 기다립니다.
                        </p>
                        <div className="flex gap-4">
                            <Button
                                className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                                onClick={handleStartGame}
                            >
                                게임 시작하기
                            </Button>
                            <Button
                                className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                                onClick={handleInviteFriend}
                            >
                                친구 초대 후 한판 더 진행하기
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 text-center">
                            <h2 className="text-lg font-bold text-[#5A3D2B] mb-2">
                                {gameWon ? "축하합니다!" : "골드 네잎 클로버를 찾아보세요!"}
                            </h2>
                        </div>

                        {/* 클로버 그리드 */}
                        <div className={`grid gap-3 ${eventFindingCloverCurrentStage === 1 ? 'grid-cols-4' :
                            eventFindingCloverCurrentStage === 2 ? 'grid-cols-5' :
                                eventFindingCloverCurrentStage === 3 ? 'grid-cols-6' : 'grid-cols-4'
                            }`}>
                            {clovers.map((clover) => (
                                <button
                                    key={clover.id}
                                    className={`aspect-square rounded-lg flex items-center justify-center ${clover.isFlipped
                                        ? clover.isLucky
                                            ? "bg-[#FFD700]/20 border-2 border-[#FFD700]"
                                            : "bg-[#75CB3B]/10 border border-[#75CB3B]/30"
                                        : "bg-white border border-gray-200 hover:border-[#75CB3B]/50"
                                        }`}
                                    onClick={() => handleCloverClick(clover.id)}
                                    disabled={clover.isFlipped || gameWon}
                                >
                                    {clover.isFlipped ? (
                                        clover.isLucky ? (
                                            <div className="relative">
                                                <Clover className="h-10 w-10 text-[#FFD700]" />
                                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-[#5A3D2B]">
                                                    3
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <Clover className="h-10 w-10 text-[#00A949]" />
                                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white">
                                                    4
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div className="w-10 h-10 bg-[#E0F2E0] rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 하단 내비게이션 */}
            <BottomNavigation />

            {/* 확인 모달 */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
                        <p className="mb-6 text-lg text-gray-800 whitespace-pre-line">
                            {confirmMessage}
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                onClick={() => {
                                    onConfirmAction()
                                    closeConfirmModal()
                                }}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 성공 알림 */}
            {showSuccessAlert && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center">
                        <h3 className="text-xl font-bold text-green-600 mb-2">축하합니다!</h3>
                        <p className="text-gray-700 mb-4">
                            다음 단계({nextStage}단계)로 진행합니다!
                        </p>
                    </div>
                </div>
            )}
        </main>
    )
}