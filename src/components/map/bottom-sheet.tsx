import React, { Dispatch, SetStateAction, useState, useCallback } from 'react';
import { Button } from "../ui/button"
import { Sheet, SheetContent } from "../ui/sheet"
import { Badge } from "../ui/badge";
import CardBenefitModal from "../card-benefit-modal"

import {
    ThumbsUp,
    ThumbsDown,
} from "lucide-react"

import { Store, StoreCategory, categoryConfig, categoryNames } from '../../types/store';

interface BottomSheetProps {
    showStoreInfo: boolean;
    setShowStoreInfo: Dispatch<SetStateAction<boolean>>;
    selectedStore: Store | null;
    benefitCards: any[]; // 카드 혜택 데이터 (예: { cardName: string; discount: string; maxDiscount: string; isRecommended: boolean; }[])
    recommendedCards: any[]; // 추천 카드 혜택 데이터 (예: { cardName: string; discount: string; maxDiscount: string; isRecommended: boolean; image: string }[])
    getCategoryIcon: (category: StoreCategory) => React.ReactNode;
    // 좋아요/싫어요 상태와 핸들러를 부모로부터 받을 수도 있습니다.
    // 만약 BottomSheet 내부에서 관리하려면 아래 주석을 해제하고 부모에게 업데이트 함수를 전달해야 합니다.
    // storeReactions: Record<number, { liked: boolean; disliked: boolean }>;
    // handleReaction: (storeId: number, reaction: "like" | "dislike") => void;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
    showStoreInfo,
    setShowStoreInfo,
    selectedStore,
    benefitCards,
    recommendedCards,
    getCategoryIcon,
    // storeReactions: parentStoreReactions, // 부모로부터 상태를 받는 경우
    // handleReaction: parentHandleReaction, // 부모로부터 핸들러를 받는 경우
}) => {
    const [storeReactions, setStoreReactions] = useState<Record<number, { liked: boolean; disliked: boolean }>>({});
    const [showCardModal, setShowCardModal] = useState(false)

    const handleStoreSelect = (store: any) => {
        console.log("매장 자세히 보기");
        //setSelectedStore(store)
        setShowCardModal(true)
    }

    // useCallback을 사용하여 handleReaction 함수를 메모이제이션합니다.
    const handleReaction = useCallback((storeId: number, reaction: "like" | "dislike") => {
        setStoreReactions((prev) => {
            const currentReaction = prev[storeId] || { liked: false, disliked: false };

            if (reaction === "like") {
                return {
                    ...prev,
                    [storeId]: {
                        liked: !currentReaction.liked,
                        disliked: false,
                    },
                };
            } else {
                return {
                    ...prev,
                    [storeId]: {
                        liked: false,
                        disliked: !currentReaction.disliked,
                    },
                };
            }
        });
        // 만약 부모 컴포넌트에게 상태 업데이트를 알려줘야 한다면 이 부분을 추가합니다.
        // parentHandleReaction?.(storeId, reaction, !storeReactions[storeId]?.[reaction]);
    }, [setStoreReactions]); // 의존성 배열에 setStoreReactions 추가

    if (
        !selectedStore ||
        !benefitCards.some((card) => card.benefit_store === selectedStore.place_name.match(/^\S+/)?.[0])
    ) {
        return showStoreInfo ? (
            <div
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg z-40 max-h-[50%] overflow-hidden"
            >
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <h3 className="text-lg font-medium text-[#5A3D2B]">매장 정보가 없습니다</h3>
                    <p className="text-sm text-[#5A3D2B]/70 mt-1">다른 매장을 선택해보세요</p>
                    <Button
                        variant="outline"
                        className="border-[#75CB3B]/30 text-[#00A949] hover:bg-[#75CB3B]/10 mt-4"
                        onClick={() => setShowStoreInfo(false)}
                    >
                        닫기
                    </Button>
                </div>
            </div>
        ) : null;
    }

    return (
        <div className="w-full">
            {/* 매장 정보 바텀 시트 */}
            < Sheet open={showStoreInfo} onOpenChange={setShowStoreInfo} >
                <SheetContent side="bottom" className="p-0 rounded-t-xl mx-auto w-full">
                    {selectedStore && (
                        <div className="flex flex-col">
                            {/* 헤더 */}
                            <div className="p-4 border-b">
                                <div className="flex items-start gap-4">
                                    {/* 매장 로고/이미지 */}
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden border">
                                        <img
                                            src={"../../images/placeholder.svg"}
                                            alt={selectedStore.place_name}
                                            className="object-cover"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="font-bold text-lg text-[#5A3D2B]">{selectedStore.place_name}</h2>
                                            <Badge
                                                className="flex items-center gap-1 py-1"
                                                style={{
                                                    backgroundColor: `${categoryConfig[selectedStore.category_group_code].color}20`,
                                                    color: categoryConfig[selectedStore.category_group_code].color,
                                                }}
                                            >
                                                {getCategoryIcon(selectedStore.category_group_code)}
                                                <span>{categoryNames[selectedStore.category_group_code]}</span>
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-[#5A3D2B]/70 mt-1">{selectedStore.address_name}</p>

                                        {/* 좋아요/싫어요 버튼 */}
                                        <div className="flex items-center gap-4 mt-2">
                                            <button
                                                className={`flex items-center gap-1 ${storeReactions[selectedStore.id]?.liked ? "text-blue-500 font-medium" : "text-gray-500"}`}
                                                onClick={() => handleReaction(selectedStore.id, "like")}
                                            >
                                                <ThumbsUp className="h-4 w-4" />
                                                {/* <span>{selectedStore.likes + (storeReactions[selectedStore.id]?.liked ? 1 : 0)}</span> */}
                                            </button>

                                            <button
                                                className={`flex items-center gap-1 ${storeReactions[selectedStore.id]?.disliked ? "text-red-500 font-medium" : "text-gray-500"}`}
                                                onClick={() => handleReaction(selectedStore.id, "dislike")}
                                            >
                                                <ThumbsDown className="h-4 w-4" />
                                                {/* <span>{selectedStore.dislikes + (storeReactions[selectedStore.id]?.disliked ? 1 : 0)}</span> */}
                                            </button>

                                            <Badge className="ml-auto bg-[#75CB3B]/20 text-[#00A949] border-none">
                                                {selectedStore.distance}m
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 내용 */}
                            <div className="p-4 space-y-4">
                                <div className="bg-[#f8f9fa] rounded-lg p-4 border border-[#75CB3B]/30">
                                    <h3 className="font-medium text-[#5A3D2B] mb-2">최고 혜택 카드</h3>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-lg text-[#00A949]">{benefitCards[0].name}</p>
                                            <p className="text-sm text-[#5A3D2B]/70">최대 할인</p>
                                        </div>
                                        <div className="text-2xl font-bold text-[#00A949]">{benefitCards[0].discount}</div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
                                    onClick={() => {
                                        setShowStoreInfo(false);
                                        handleStoreSelect(selectedStore);
                                    }}
                                >
                                    카드 혜택 자세히 보기
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet >

            {/* 카드 혜택 모달 */}
            {showCardModal && selectedStore && (
                <CardBenefitModal store={selectedStore} benefitCards={benefitCards} recommendedCards={recommendedCards} onClose={() => setShowCardModal(false)} />
            )}
        </div >
    );
};

export default BottomSheet;