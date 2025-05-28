import { useState } from "react"
import { Button } from "./ui/button"
import { X, ThumbsUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { useToast } from "../hooks/use-toast"
import type { BenefitCard, Store } from "../types/store"
import { applyCard } from "../lib/card/cardApi"



type CardBenefitModalProps = {
  store: Store;
  onClose: () => void;
  benefitCards: BenefitCard[];
  recommendedCards: BenefitCard[];
};

export default function CardBenefitModal({ store, onClose, benefitCards, recommendedCards }: CardBenefitModalProps) {
  const [isApplying, setIsApplying] = useState<number | null>(null)
  const { toast } = useToast()

  const handleApplyCard = async (card: BenefitCard) => {
    // 디버깅을 위한 로그 추가
    console.log("카드 데이터:", card)
    // console.log("카드 타입 확인:", {
    //   hasCardInfoId: "cardInfoId" in card,
    //   hasCardBrand: "cardBrand" in card,
    //   hasCardBenefitId: "cardBenefitId" in card,
    //   cardKeys: Object.keys(card),
    // })

    let cardInfoId: number
    let cardBrand: number
    let cardId: number

    // // 더 정확한 타입 가드 사용
    cardInfoId = card.cardInfoId
    cardBrand = card.cardBrand
    cardId = card.id
    console.log("인식:", { cardInfoId, cardBrand, cardId })

    setIsApplying(cardId)
    try {
      const url = await applyCard(cardInfoId, cardBrand)

      if (url) {
        // 새 창에서 카드 신청 페이지 열기
        window.open(url, "_blank")

        toast({
          title: "카드 신청 페이지로 이동",
          description: "카드 신청 페이지가 새 창에서 열렸습니다.",
        })
      } else {
        throw new Error("카드 신청 URL이 없습니다.")
      }
    } catch (error) {
      console.error("카드 신청 실패:", error)
      toast({
        title: "카드 신청 실패",
        description: "카드 신청 페이지로 이동할 수 없습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsApplying(null)
    }
  }
  // 컴포넌트 렌더링 시 데이터 확인
  console.log("recommendedCards 데이터:", recommendedCards)

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-lg sm:rounded-lg w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="p-3 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg text-[#5A3D2B]">{store.place_name} 혜택</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 space-y-2">
            <p className="text-sm text-[#5A3D2B]/70">{store.address_name}</p>
            <div className="flex items-center">
              <span className="text-xs bg-[#75CB3B]/20 text-[#00A949] px-2 py-1 rounded-full">{store.distance}m</span>
            </div>
          </div>

          <Tabs defaultValue="my-cards" className="w-full">
            <div className="px-4">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger
                  value="my-cards"
                  className="data-[state=active]:bg-[#75CB3B]/10 data-[state=active]:text-[#00A949]"
                >
                  내 카드 혜택
                </TabsTrigger>
                <TabsTrigger
                  value="recommended"
                  className="data-[state=active]:bg-[#75CB3B]/10 data-[state=active]:text-[#00A949]"
                >
                  카드 추천
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="my-cards" className="p-4 pt-0 space-y-6">
              {benefitCards.length > 0 ? (
                <>
                  {/* 가장 혜택이 좋은 카드 */}
                  <div className="bg-[#f8f9fa] rounded-lg p-4 border border-[#75CB3B]/30">
                    <h3 className="font-medium text-[#5A3D2B] mb-2">최고 혜택 카드</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg text-[#00A949]">{benefitCards[0].card_name}</p>
                        <p className="text-sm text-[#5A3D2B]/70">최대 할인: {benefitCards[0].discount}</p>
                      </div>
                      <div className="text-2xl font-bold text-[#00A949]">{benefitCards[0].discount}</div>
                    </div>
                  </div>

                  {/* 혜택 순위 */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-[#5A3D2B]">혜택 순위</h3>
                    <div className="space-y-2">
                      {benefitCards.map((card, index) => (
                        <div
                          key={index}
                          className={`flex items-center p-3 rounded-lg ${index === 0 ? "bg-[#75CB3B]/20 border border-[#75CB3B]/30" : "bg-gray-50"
                            }`}
                        >
                          <div className="w-6 h-6 rounded-full bg-[#75CB3B]/30 flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-[#00A949]">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${index === 0 ? "text-[#00A949]" : "text-[#5A3D2B]"}`}>
                              {card.card_name}
                            </p>
                            <p className="text-xs text-[#5A3D2B]/70">최대 {card.discount} 할인</p>
                          </div>
                          <div className="text-lg font-bold text-[#00A949]">{card.discount}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg font-medium mb-1">등록된 카드가 없습니다</p>
                  <p className="text-sm">카드를 등록하고 혜택을 확인해보세요.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recommended" className="p-4 pt-0 space-y-4">
              {recommendedCards.length > 0 ? (
                recommendedCards.map((card, index) => {
                  console.log(`추천 카드 ${index}:`, card);

                  return (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="relative h-32 bg-gray-100">
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white text-xs px-2 py-1 rounded-full">
                          추천
                        </div>
                        <div className="flex items-center justify-center h-full">
                          <img
                            alt={card.card_name}
                            src={(card as any).card_image_url}
                            loading="lazy"
                            decoding="async"
                            data-nimg="fill"
                            className="object-contain p-4"
                            style={{
                              position: 'absolute',
                              height: '100%',
                              width: '100%',
                              top: 0,
                              right: 0,
                              bottom: 0,
                              left: 0,
                              color: 'transparent',
                            }}
                          />
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <h3 className="font-medium text-[#5A3D2B]">{card.card_name}</h3>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-[#5A3D2B]/70">할인율</p>
                            <p className="font-bold text-lg text-[#00A949]">{card.discount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[#5A3D2B]/70">최대 할인</p>
                            <p className="font-medium text-[#5A3D2B]">{card.discount}</p>
                          </div>
                          <Button
                            className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] border-none"
                            onClick={() => handleApplyCard(card)}
                            disabled={isApplying === card.id}
                          >
                            {isApplying === card.id ? "신청 중..." : "신청하기"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg font-medium mb-1">추천 카드가 없습니다</p>
                  <p className="text-sm">이 매장에서 사용할 수 있는 추천 카드를 찾을 수 없습니다.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* 하단 버튼 */}
        <div className="p-4 border-t">
          <Button
            className="w-full bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] border-none"
            onClick={onClose}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            확인
          </Button>
        </div>
      </div>
    </div>
  )
}
