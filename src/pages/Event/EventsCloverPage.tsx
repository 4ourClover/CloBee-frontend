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
            return
        }

        try {
            // 사용자 상태 확인
            let response = await fetch(`${API_BASE_URL}/status?user_id=${userId}`)

            // 오류가 발생하면 새로운 사용자이므로 초기화
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

            setClovers(newClovers)
            setEventFindingCloverCurrentStage(data.eventFindingCloverCurrentStage)
            setGameStarted(true)
            setGameWon(false)
        } catch (error) {
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

    // 친구 초대 후 한판 더 진행 - 카카오 SDK 오류 수정 버전
    const handleInviteFriend = async () => {
        if (!userId) {
            return
        }

        // 공유 완료 후 게임 초기화 함수
        const initializeGameAfterShare = async () => {
            try {
                console.log('게임 초기화 시작...')
                const response = await fetch(`${API_BASE_URL}/init?user_id=${userId}&invited=true`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                if (response.ok) {
                    console.log('게임 초기화 성공')

                    // 게임 상태 초기화 후 자동으로 게임 시작
                    setGameStarted(false)
                    setGameWon(false)
                    setTimeout(() => {
                        console.log('게임 시작 호출')
                        handleStartGame()
                    }, 100)
                } else {
                    throw new Error('게임 초기화에 실패했습니다.')
                }
            } catch (error: any) {
                console.error('게임 초기화 중 오류 발생:', error)
                toast({
                    title: "오류가 발생했습니다",
                    description: "다시 시도해주세요.",
                })
            }
        }

        // 카카오 SDK 로드 확인 및 초기화
        const ensureKakaoSDK = (): Promise<any> => {
            return new Promise((resolve, reject) => {
                // 이미 Kakao 객체가 있는 경우
                if (typeof window !== 'undefined' && (window as any).Kakao) {
                    const Kakao = (window as any).Kakao
                    if (!Kakao.isInitialized()) {
                        try {
                            Kakao.init('REACT_APP_JAVASCRIPT_KEY') // 실제 JavaScript 키로 교체하세요
                            console.log('카카오 SDK 초기화 완료')
                        } catch (error) {
                            console.error('카카오 SDK 초기화 실패:', error)
                            reject(error)
                            return
                        }
                    }
                    resolve(Kakao)
                    return
                }

                // Kakao 객체가 없는 경우 스크립트 로드
                const script = document.createElement('script')
                script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.4.0/kakao.min.js'
                script.async = true

                script.onload = () => {
                    console.log('카카오 SDK 스크립트 로드 완료')
                    const Kakao = (window as any).Kakao
                    if (Kakao) {
                        try {
                            Kakao.init('REACT_APP_JAVASCRIPT_KEY') // 실제 JavaScript 키로 교체하세요
                            console.log('카카오 SDK 초기화 완료')
                            resolve(Kakao)
                        } catch (error) {
                            console.error('카카오 SDK 초기화 실패:', error)
                            reject(error)
                        }
                    } else {
                        reject(new Error('카카오 SDK 로드 실패'))
                    }
                }

                script.onerror = () => {
                    console.error('카카오 SDK 스크립트 로드 실패')
                    reject(new Error('카카오 SDK 스크립트 로드 실패'))
                }

                document.head.appendChild(script)
            })
        }

        // 카카오톡 공유 처리
        const handleKakaoShare = async () => {
            try {
                // 카카오 SDK 로드 및 초기화 확인
                const Kakao = await ensureKakaoSDK()

                const shareUrl = window.location.origin + '/event/clover'

                // 공유 시작 알림
                toast({
                    title: "카카오톡 공유창을 여는 중...",
                    description: "공유를 완료해주세요.",
                })

                // 카카오톡 공유 실행
                const shareResult = Kakao.Share.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: '🍀 골드 네잎 클로버 찾기 게임',
                        description: '골드 네잎 클로버를 찾아서 특별한 보상을 받아보세요! 함께 도전해요!',
                        imageUrl: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=🍀', // 실제 게임 이미지로 교체
                        link: {
                            mobileWebUrl: shareUrl,
                            webUrl: shareUrl,
                        },
                    },
                    buttons: [
                        {
                            title: '게임 하러가기',
                            link: {
                                mobileWebUrl: shareUrl,
                                webUrl: shareUrl,
                            },
                        }
                    ]
                })

                // Promise 형태로 반환되는지 확인
                if (shareResult && typeof shareResult.then === 'function') {
                    shareResult
                        .then((result: any) => {
                            console.log('카카오톡 공유 성공:', result)
                            handleShareSuccess()
                        })
                        .catch((error: any) => {
                            console.error('카카오톡 공유 실패:', error)
                            handleShareError(error)
                        })
                } else {
                    // Promise가 아닌 경우 (구버전 SDK)
                    console.log('카카오톡 공유 실행됨 (구버전 SDK)')
                    // 일정 시간 후 성공으로 간주 (실제로는 사용자가 공유를 완료했는지 확인할 수 없음)
                    setTimeout(() => {
                        handleShareSuccess()
                    }, 10000)
                }

            } catch (error: any) {
                console.error('카카오톡 공유 처리 중 오류:', error)
                handleShareError(error)
            }
        }

        // 공유 성공 처리
        const handleShareSuccess = () => {
            // 공유 성공 시 성공 모달 표시
            showConfirmModal(
                '공유에 성공했습니다. 3초뒤에 게임이 시작됩니다',
                () => {
                    // 이 함수는 호출되지 않지만 모달 구조상 필요
                    console.log('모달 확인 버튼 클릭됨')
                }
            )

            // 3초 후 자동으로 게임 시작
            setTimeout(() => {
                setIsConfirmModalOpen(false) // 모달 닫기
                initializeGameAfterShare()
            }, 3000)
        }

        // 공유 실패 처리
        const handleShareError = (error: any) => {
            if (error?.code === -2 || error?.message?.includes('cancel')) {
                // 사용자가 공유창에서 취소한 경우
                toast({
                    title: "공유가 취소되었습니다",
                    description: "친구 초대를 완료하면 추가 게임을 플레이할 수 있습니다.",
                })
            } else if (error?.code === -1) {
                // 카카오톡이 설치되지 않은 경우
                toast({
                    title: "카카오톡이 설치되지 않았습니다",
                    description: "카카오톡을 설치한 후 다시 시도해주세요.",
                })
            } else {
                // 기타 오류
                toast({
                    title: "공유 중 오류가 발생했습니다",
                    description: "다시 시도해주세요.",
                })
            }
        }

        // 메인 실행부
        try {
            await handleKakaoShare()
        } catch (error: any) {
            console.error('공유 처리 중 최종 오류:', error)
            toast({
                title: "오류가 발생했습니다",
                description: "페이지를 새로고침 후 다시 시도해주세요.",
            })
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
                                친구에게 공유하고 한판 더 진행하기
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 text-center">
                            <h2 className="text-lg font-bold text-[#5A3D2B] mb-2">
                                {gameWon ? "축하합니다!" : "골드 네잎 클로버를 5회안에 찾아보세요!"}
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