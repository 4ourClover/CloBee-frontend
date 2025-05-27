"use client"

import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, Gift, Copy, Share2, Check, Zap } from "lucide-react"

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useToast } from "../../hooks/use-toast"
import BottomNavigation from "../../components/bottom-navigation"

// 룰렛 상품 데이터
const PRIZES = [
    { name: "5,000원 쿠폰", textColor: "#333333" },
    { name: "2,000원 쿠폰", textColor: "#333333" },
    { name: "3,000원 쿠폰", textColor: "#333333" },
    { name: "1,000원 쿠폰", textColor: "#333333" },
    { name: "3,000원 쿠폰", textColor: "#333333" },
    { name: "다음 기회에", textColor: "#333333" },
    { name: "1,000원 쿠폰", textColor: "#333333" },
    { name: "500원 쿠폰", textColor: "#333333" },
]

export default function InviteEventPage() {
    const [inviteCode] = useState("ADFTKMKD")
    const [copied, setCopied] = useState(false)
    const [rouletteChances, setRouletteChances] = useState(3) // 현재 보유 룰렛 기회
    const [isSpinning, setIsSpinning] = useState(false)
    const [selectedPrize, setSelectedPrize] = useState<number | null>(null)
    const [rotationDegrees, setRotationDegrees] = useState(0)
    const [showWinModal, setShowWinModal] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { toast } = useToast()

    // 초대 현황 데이터
    const inviteData = [
        { name: "민성", date: "2025.05.20", status: "가입완료", reward: "룰렛 기회 1회 지급완료" },
        { name: "슬기", date: "2025.05.18", status: "가입완료", reward: "룰렛 기회 1회 지급완료" },
        { name: "창성", date: "2025.05.15", status: "가입완료", reward: "룰렛 기회 1회 지급완료" },
        { name: "소연", date: "2025.05.19", status: "가입완료", reward: "룰렛 기회 1회 지급완료" }
    ]

    // 룰렛 그리기
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const radius = Math.min(centerX, centerY) - 20

        // 배경 지우기
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // 베이지색 배경 추가 (약간 불투명하게)
        ctx.fillStyle = "rgba(235, 225, 205, 0.7)" // 베이지색 배경 (불투명도 0.7)
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // 룰렛 그리기
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate((rotationDegrees * Math.PI) / 180)

        const sliceAngle = (2 * Math.PI) / PRIZES.length

        for (let i = 0; i < PRIZES.length; i++) {
            const startAngle = i * sliceAngle
            const endAngle = (i + 1) * sliceAngle

            // 룰렛 조각 그리기 (연두색과 흰색 번갈아가며)
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.arc(0, 0, radius, startAngle, endAngle)
            ctx.closePath()
            ctx.fillStyle = i % 2 === 0 ? "#AEDD94" : "#FFFFFF"
            ctx.fill()
            ctx.strokeStyle = "#75CB3B"
            ctx.lineWidth = 2
            ctx.stroke()

            // 텍스트 그리기
            ctx.save()
            ctx.rotate(startAngle + sliceAngle / 2)
            ctx.textAlign = "right"
            ctx.fillStyle = PRIZES[i].textColor
            ctx.font = "bold 14px Arial"

            // 텍스트를 여러 줄로 나누기
            const words = PRIZES[i].name.split(" ")
            if (words.length > 1) {
                ctx.fillText(words[0], radius - 30, -5)
                ctx.fillText(words.slice(1).join(" "), radius - 30, 15)
            } else {
                ctx.fillText(PRIZES[i].name, radius - 30, 5)
            }

            ctx.restore()
        }

        // 룰렛 외부 테두리
        ctx.beginPath()
        ctx.arc(0, 0, radius, 0, 2 * Math.PI)
        ctx.strokeStyle = "#75CB3B"
        ctx.lineWidth = 3
        ctx.stroke()

        ctx.restore()

        // 중앙 원 그리기 (고정)
        ctx.beginPath()
        ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI)
        ctx.fillStyle = "#FFFFFF"
        ctx.fill()
        ctx.strokeStyle = "#75CB3B"
        ctx.lineWidth = 3
        ctx.stroke()

        // 중앙 원 안에 귀여운 이모티콘 추가 (고정)
        ctx.fillStyle = "#75CB3B"
        ctx.font = "20px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("🎁", centerX, centerY)

        // 고정된 화살표 그리기 (맨 위 중앙)
        ctx.save()
        ctx.translate(centerX, centerY - radius - 5)

        // 삼각형 화살표
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(-10, -15)
        ctx.lineTo(10, -15)
        ctx.closePath()
        ctx.fillStyle = "#FF5252"
        ctx.fill()
        ctx.strokeStyle = "#CC0000"
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.restore()
    }, [rotationDegrees])

    // 룰렛 돌리기
    const spinRoulette = () => {
        if (isSpinning || rouletteChances <= 0) return

        setIsSpinning(true)
        setRouletteChances((prev) => prev - 1)

        // 랜덤하게 당첨 항목 선택 (0부터 PRIZES.length-1 사이의 정수)
        const prizeIndex = Math.floor(Math.random() * PRIZES.length)
        setSelectedPrize(prizeIndex)

        // 회전 각도 계산 수정
        // 화살표가 위에 고정되어 있으므로, 당첨 항목이 화살표 위치(맨 위)에 오도록 계산
        const sliceAngle = 360 / PRIZES.length

        // prizeIndex 0이 맨 위에 오도록 조정s
        const targetDegree = -prizeIndex * sliceAngle // 음수로 변경하여 올바른 방향으로 회전
        const spins = 4.7 // 5바퀴 돌기
        const newRotationDegrees = spins * 360 + targetDegree

        // 애니메이션 시작
        let startTime: number | null = null
        const duration = 5000 // 5초 동안 돌기

        const animateSpin = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const elapsed = timestamp - startTime
            const progress = Math.min(elapsed / duration, 1)

            // easeOutCubic 이징 함수 사용
            const easeOut = 1 - Math.pow(1 - progress, 3)
            const currentRotation = easeOut * newRotationDegrees

            setRotationDegrees(currentRotation)

            if (progress < 1) {
                requestAnimationFrame(animateSpin)
            } else {
                // 애니메이션 종료
                setIsSpinning(false)
                setShowWinModal(true)
            }
        }

        requestAnimationFrame(animateSpin)
    }

    // 코드 복사 핸들러
    const handleCopyCode = () => {
        navigator.clipboard.writeText(inviteCode)
        setCopied(true)


        setTimeout(() => setCopied(false), 2000)
    }

    // 공유하기 핸들러
    // 카카오톡 공유가 추가된 handleShare 핸들러
const handleShare = async () => {
    // 카카오 SDK 로드 확인 및 초기화
    const ensureKakaoSDK = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            // 이미 Kakao 객체가 있는 경우
            if (typeof window !== 'undefined' && (window as any).Kakao) {
                const Kakao = (window as any).Kakao
                if (!Kakao.isInitialized()) {
                    try {
                        const kakaoKey = process.env.REACT_APP_JAVASCRIPT_KEY
                        
                        if (!kakaoKey) {
                            throw new Error('카카오 JavaScript 키가 설정되지 않았습니다.')
                        }
                        
                        Kakao.init(kakaoKey)
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
                        const kakaoKey = process.env.REACT_APP_JAVASCRIPT_KEY
                        
                        if (!kakaoKey) {
                            throw new Error('카카오 JavaScript 키가 설정되지 않았습니다.')
                        }
                        
                        Kakao.init(kakaoKey)
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
            const Kakao = await ensureKakaoSDK()
            
            const shareUrl = "http://localhost:3000"
            
            toast({
                title: "카카오톡 공유창을 여는 중...",
                description: "친구에게 공유해주세요!",
            })

            const shareResult = Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: '🍀Clobee 친구초대 이벤트',
                    description: `초대 코드 ${inviteCode}를 입력하고 가입하면 특별 혜택을 받을 수 있어요! 함께 Clobee를 이용해보세요! 🎁`,
                    imageUrl: 'https://via.placeholder.com/300x200/75CB3B/FFFFFF?text=🎁', // 실제 이벤트 이미지로 교체
                    link: {
                        mobileWebUrl: shareUrl,
                        webUrl: shareUrl,
                    },
                },
                buttons: [
                    {
                        title: 'Clobee 가입하기',
                        link: {
                            mobileWebUrl: shareUrl,
                            webUrl: shareUrl,
                        },
                    }
                ]
            })

            if (shareResult && typeof shareResult.then === 'function') {
                shareResult
                    .then((result: any) => {
                        console.log('카카오톡 공유 성공:', result)
                        toast({
                            title: "공유 완료! 🎉",
                            description: "친구가 가입하면 룰렛 기회를 받을 수 있어요!",
                        })
                    })
                    .catch((error: any) => {
                        console.error('카카오톡 공유 실패:', error)
                        handleShareError(error)
                    })
            } else {
                // Promise가 아닌 경우 (구버전 SDK)
                setTimeout(() => {
                    toast({
                        title: "공유 완료! 🎉",
                        description: "친구가 가입하면 룰렛 기회를 받을 수 있어요!",
                    })
                }, 1000)
            }

        } catch (error: any) {
            console.error('카카오톡 공유 처리 중 오류:', error)
            handleShareError(error)
        }
    }

    // 공유 실패 처리
    const handleShareError = (error: any) => {
        if (error?.code === -2 || error?.message?.includes('cancel')) {
            // 사용자가 공유창에서 취소한 경우
            toast({
                title: "공유가 취소되었습니다",
                description: "다시 시도해주세요.",
            })
        } else if (error?.code === -1) {
            // 카카오톡이 설치되지 않은 경우
            toast({
                title: "카카오톡이 설치되지 않았습니다",
                description: "카카오톡을 설치한 후 다시 시도해주세요.",
            })
        } else {
            // 기타 오류 - 네이티브 공유 API로 대체
            handleNativeShare()
        }
    }

    // 네이티브 공유 API 처리
    const handleNativeShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Clobee 친구초대",
                text: `Clobee에서 함께해요! 내 초대 코드: ${inviteCode}를 입력하고 가입하면 특별 혜택이 제공됩니다!`,
                url: process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || "http://localhost:3000",
            }).then(() => {
                toast({
                    title: "공유 완료! 🎉",
                    description: "친구가 가입하면 룰렛 기회를 받을 수 있어요!",
                })
            }).catch((error) => {
                if (error.name !== 'AbortError') {
                    toast({
                        title: "공유하기를 지원하지 않는 브라우저입니다",
                        description: "초대 코드를 복사해서 공유해주세요.",
                    })
                }
            })
        } else {
            toast({
                title: "공유하기를 지원하지 않는 브라우저입니다",
                description: "초대 코드를 복사해서 공유해주세요.",
            })
        }
    }

    // 메인 실행부 - 카카오톡 공유 우선 시도
    try {
        await handleKakaoShare()
    } catch (error: any) {
        console.error('카카오톡 공유 실패, 네이티브 공유로 대체:', error)
        handleNativeShare()
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
                <h1 className="text-lg font-bold flex-1">친구초대 이벤트</h1>
            </header>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 overflow-auto bg-gradient-to-b from-[#F8FFF4] to-white p-4">
                <div className="space-y-6">

                    {/* 친구와 함께 혜택 받기 섹션 */}
                    <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                        <div className="flex justify-center mb-3">
                            <div className="w-16 h-16 bg-[#4285F4] rounded-full flex items-center justify-center">
                                <Gift className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-lg font-bold text-[#5A3D2B] mb-1">친구와 함께 혜택 받기</h2>
                        <p className="text-sm text-gray-600 mb-5">친구 초대하고 룰렛 기회를 받으세요!</p>

                        <div className="flex items-center gap-2 mb-4">
                            <Input
                                value={inviteCode}
                                readOnly
                                className="text-center font-bold text-[#00A949] border-[#75CB3B]/30 text-lg"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="border-[#75CB3B]/30 text-[#00A949]"
                                onClick={handleCopyCode}
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>

                        <Button
                            className="w-full bg-[#4CD964] hover:bg-[#3CB954] text-white h-12 rounded-full"
                            onClick={handleShare}
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            친구에게 공유하기
                        </Button>
                    </div>

                    {/* 룰렛 섹션 - 베이지색 배경 적용 */}
                    <div className="bg-[#EBE1CD] rounded-lg p-6 text-center shadow-sm">
                        <h2 className="text-xl font-bold text-[#5A3D2B] mb-4">
                            <span className="text-[#75CB3B]">행</span>
                            <span className="text-[#FF5252]">운</span>
                            <span className="text-[#75CB3B]">의</span>
                            <span> </span>
                            <span className="text-[#FF5252]">룰</span>
                            <span className="text-[#75CB3B]">렛</span>
                            <span className="text-[#FF5252]">!</span>
                        </h2>

                        <div className="relative mx-auto mb-6" style={{ width: "300px", height: "300px" }}>
                            <canvas ref={canvasRef} width={300} height={300} className="mx-auto" />
                        </div>

                        <Button
                            onClick={spinRoulette}
                            disabled={isSpinning || rouletteChances <= 0}
                            className="w-full bg-[#75CB3B] hover:bg-[#5BA92B] text-white h-12 rounded-full disabled:opacity-50 font-bold text-lg"
                        >
                            {isSpinning ? "룰렛 돌아가는 중..." : "룰렛 돌리기"}
                        </Button>

                        {/* 현재 보유 룰렛 기회 */}
                        <div className="mt-4 bg-[#FFF8E1] rounded-lg p-3 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-[#5A3D2B] text-sm">현재 보유 룰렛 기회</h3>
                            </div>
                            <div className="flex items-center bg-[#FFD54F] px-3 py-1 rounded-full">
                                <Zap className="h-4 w-4 text-[#FF9800] mr-1" />
                                <span className="font-bold">{rouletteChances}회</span>
                            </div>
                        </div>
                    </div>


                    {/* 초대 현황 */}
                    <div>
                        <h3 className="font-bold text-[#5A3D2B] mb-3">초대 현황 (3/10명)</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">이름</th>
                                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">가입일</th>
                                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">상태</th>
                                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">리워드</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {inviteData.map((invite, index) => (
                                        <tr key={index}>
                                            <td className="py-2 px-3">{invite.name}</td>
                                            <td className="py-2 px-3">{invite.date}</td>
                                            <td className="py-2 px-3 text-[#00A949]">{invite.status}</td>
                                            <td className="py-2 px-3 text-gray-500">{invite.reward}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* 당첨 모달 */}
            {showWinModal && selectedPrize !== null && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
                        <div className="text-4xl mb-2">🎉</div>
                        <h3 className="text-xl font-bold mb-2">축하합니다!</h3>
                        <div className="bg-[#FFF8E1] p-4 rounded-lg mb-4">
                            <p className="text-lg font-bold text-[#FF5252]">{PRIZES[selectedPrize].name}</p>
                            <p className="text-sm text-gray-600">에 당첨되었습니다!</p>
                        </div>
                        <Button
                            onClick={() => setShowWinModal(false)}
                            className="w-full bg-[#75CB3B] hover:bg-[#5BA92B] text-white font-bold"
                        >
                            확인하기
                        </Button>
                    </div>
                </div>
            )}

            {/* 하단 내비게이션 */}
            <BottomNavigation />
        </main>
    )
}
