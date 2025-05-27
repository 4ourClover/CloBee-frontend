import { Button } from "components/ui/button"
import { X, ThumbsUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { BenefitCard, Store } from "../types/store"

type CardBenefitModalProps = {
  store: Store;
  onClose: () => void;
  benefitCards: BenefitCard[];
  recommendedCards: BenefitCard[];
};

export default function CardBenefitModal({ store, onClose, benefitCards, recommendedCards }: CardBenefitModalProps) {

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
            </TabsContent>

            <TabsContent value="recommended" className="p-4 pt-0 space-y-4">
              {recommendedCards.map((card, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="relative h-32 bg-gray-100">
                    {/* <Image
                      src={card.image || "/placeholder.svg"}
                      alt={card.cardName}
                      fill
                      className="object-contain p-4"
                    /> */}
                    {/* {card.isRecommended && (
                      
                    )} */}
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white text-xs px-2 py-1 rounded-full">
                      추천
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
                      <Button className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] border-none">
                        신청하기
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
