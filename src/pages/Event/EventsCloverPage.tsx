import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
    ChevronLeft,
    Clover,
    Gift,
} from "lucide-react"
import { Button } from "../../components/ui/button"       // '@/components/...' → '../components/...'
import { useToast } from "../../hooks/use-toast"          // '@/hooks/...' → '../hooks/...'
// @ts-ignore
import confetti from "canvas-confetti"
import BottomNavigation from "../../components/bottom-navigation"

export default function CloverGamePage() {
    const [clovers, setClovers] = useState<Array<{ id: number; isLucky: boolean; isFlipped: boolean }>>([])
    const [gameStarted, setGameStarted] = useState(false)
    const [gameWon, setGameWon] = useState(false)
    const [attempts, setAttempts] = useState(0)
    const { toast } = useToast()

    // 게임 초기화
    useEffect(() => {
        if (!gameStarted) return

        // 20개의 클로버 생성 (19개 네잎, 1개 세잎)
        const newClovers = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            isLucky: false,
            isFlipped: false,
        }))

        // 랜덤하게 하나의 클로버를 행운의 클로버(세잎)로 지정
        const luckyIndex = Math.floor(Math.random() * 20)
        newClovers[luckyIndex].isLucky = true

        setClovers(newClovers)
        setGameWon(false)
        setAttempts(0)
    }, [gameStarted])

    // 클로버 클릭 핸들러
    const handleCloverClick = (id: number) => {
        if (!gameStarted || gameWon) return

        const updatedClovers = clovers.map((clover) => {
            if (clover.id === id && !clover.isFlipped) {
                // 클릭한 클로버 뒤집기
                const newClover = { ...clover, isFlipped: true }

                // 행운의 클로버(세잎)를 찾았는지 확인
                if (newClover.isLucky) {
                    setGameWon(true)
                    // 승리 효과
                    setTimeout(() => {
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 },
                        })
                    }, 300)

                    toast({
                        title: "축하합니다!",
                        description: "행운의 세잎 클로버를 찾았습니다!",
                    })
                }

                return newClover
            }
            return clover
        })

        setClovers(updatedClovers)
        setAttempts((prev) => prev + 1)
    }

    // 게임 시작 핸들러
    const handleStartGame = () => {
        setGameStarted(true)
    }

    // 게임 재시작 핸들러
    const handleRestartGame = () => {
        setGameStarted(false)
        setTimeout(() => {
            setGameStarted(true)
        }, 100)
    }

    return (
        <main className="flex flex-col h-screen max-w-sm mx-auto overflow-hidden">
            {/* 헤더 */}
            <header className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white p-3 flex items-center gap-2">
                <Link to="/events">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-lg font-bold flex-1">클로버 찾기 게임</h1>
            </header>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 overflow-auto bg-[#F5FAF0] p-4">
                {!gameStarted ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-20 h-20 bg-[#75CB3B]/20 rounded-full flex items-center justify-center mb-4">
                            <Clover className="h-10 w-10 text-[#00A949]" />
                        </div>
                        <h2 className="text-xl font-bold text-[#5A3D2B] mb-2">행운의 세잎 클로버 찾기</h2>
                        <p className="text-sm text-gray-600 mb-6 max-w-xs">
                            많은 네잎 클로버 중에서 행운의 세잎 클로버를 찾아보세요! 찾으면 특별한 보상이 기다립니다.
                        </p>
                        <Button
                            className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                            onClick={handleStartGame}
                        >
                            게임 시작하기
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 text-center">
                            <h2 className="text-lg font-bold text-[#5A3D2B] mb-2">
                                {gameWon ? "축하합니다!" : "행운의 세잎 클로버를 찾아보세요!"}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {gameWon ? `${attempts}번 만에 찾았습니다!` : "네잎 클로버 사이에 숨어있는 세잎 클로버를 찾아보세요."}
                            </p>
                            {gameWon && (
                                <div className="mt-4">
                                    <Button
                                        className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                                        onClick={handleRestartGame}
                                    >
                                        다시 도전하기
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* 클로버 그리드 */}
                        <div className="grid grid-cols-4 gap-3">
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

                        {gameWon && (
                            <div className="bg-white rounded-lg p-4 mt-4">
                                <h3 className="font-bold text-[#5A3D2B] mb-2">획득한 보상</h3>
                                <div className="flex items-center gap-3 p-3 bg-[#75CB3B]/10 rounded-lg">
                                    <div className="w-12 h-12 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                                        <Gift className="h-6 w-6 text-[#FFD700]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-[#5A3D2B]">행운의 쿠폰 팩</p>
                                        <p className="text-sm text-gray-600">랜덤 매장 할인 쿠폰 3장</p>
                                    </div>
                                </div>
                                <Button className="w-full mt-3 bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]">
                                    보상 받기
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 하단 내비게이션 */}
            <BottomNavigation />
        </main>
    )
}
