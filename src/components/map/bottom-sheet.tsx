// import React, { Dispatch, SetStateAction, useState, useCallback } from 'react';
// import { Button } from "../ui/button"
// import { Sheet, SheetContent } from "../ui/sheet"
// import { Badge } from "../ui/badge";

// import {
//     ThumbsUp,
//     ThumbsDown,
// } from "lucide-react"

// import { Store, StoreCategory } from '../../types/store';

// interface BottomSheetProps {
//     showStoreInfo: boolean;
//     setShowStoreInfo: Dispatch<SetStateAction<boolean>>;
//     selectedStore: Store | null;
//     handleStoreSelect: (store: Store) => void;
//     categoryConfig: Record<StoreCategory, { color: string; icon: React.ElementType }>;
//     categoryNames: Record<StoreCategory, string>;
//     getCategoryIcon: (category: StoreCategory) => React.ReactNode;
//     // 좋아요/싫어요 상태와 핸들러를 부모로부터 받을 수도 있습니다.
//     // 만약 BottomSheet 내부에서 관리하려면 아래 주석을 해제하고 부모에게 업데이트 함수를 전달해야 합니다.
//     // storeReactions: Record<number, { liked: boolean; disliked: boolean }>;
//     // handleReaction: (storeId: number, reaction: "like" | "dislike") => void;
// }

// const BottomSheet: React.FC<BottomSheetProps> = ({
//     showStoreInfo,
//     setShowStoreInfo,
//     selectedStore,
//     handleStoreSelect,
//     categoryConfig,
//     categoryNames,
//     getCategoryIcon,
//     // storeReactions: parentStoreReactions, // 부모로부터 상태를 받는 경우
//     // handleReaction: parentHandleReaction, // 부모로부터 핸들러를 받는 경우
// }) => {
//     const [storeReactions, setStoreReactions] = useState<Record<number, { liked: boolean; disliked: boolean }>>({});

//     // useCallback을 사용하여 handleReaction 함수를 메모이제이션합니다.
//     const handleReaction = useCallback((storeId: number, reaction: "like" | "dislike") => {
//         setStoreReactions((prev) => {
//             const currentReaction = prev[storeId] || { liked: false, disliked: false };

//             if (reaction === "like") {
//                 return {
//                     ...prev,
//                     [storeId]: {
//                         liked: !currentReaction.liked,
//                         disliked: false,
//                     },
//                 };
//             } else {
//                 return {
//                     ...prev,
//                     [storeId]: {
//                         liked: false,
//                         disliked: !currentReaction.disliked,
//                     },
//                 };
//             }
//         });
//         // 만약 부모 컴포넌트에게 상태 업데이트를 알려줘야 한다면 이 부분을 추가합니다.
//         // parentHandleReaction?.(storeId, reaction, !storeReactions[storeId]?.[reaction]);
//     }, [setStoreReactions]); // 의존성 배열에 setStoreReactions 추가

//     if (!selectedStore) {
//         return null;
//     }

//     return (
//         <div className="w-full">
//             {/* 매장 정보 바텀 시트 */}
//             < Sheet open={showStoreInfo} onOpenChange={setShowStoreInfo} >
//                 <SheetContent side="bottom" className="p-0 rounded-t-xl mx-auto w-full">
//                     {selectedStore && (
//                         <div className="flex flex-col">
//                             {/* 헤더 */}
//                             <div className="p-4 border-b">
//                                 <div className="flex items-start gap-4">
//                                     {/* 매장 로고/이미지 */}
//                                     <div className="relative w-16 h-16 rounded-full overflow-hidden border">
//                                         <img
//                                             src={selectedStore.image || "/placeholder.svg"}
//                                             alt={selectedStore.name}
//                                             className="object-cover"
//                                         />
//                                     </div>

//                                     <div className="flex-1">
//                                         <div className="flex items-center gap-2">
//                                             <h2 className="font-bold text-lg text-[#5A3D2B]">{selectedStore.name}</h2>
//                                             <Badge
//                                                 className="flex items-center gap-1 py-1"
//                                                 style={{
//                                                     backgroundColor: `${categoryConfig[selectedStore.category].color}20`,
//                                                     color: categoryConfig[selectedStore.category].color,
//                                                 }}
//                                             >
//                                                 {getCategoryIcon(selectedStore.category)}
//                                                 <span>{categoryNames[selectedStore.category]}</span>
//                                             </Badge>
//                                         </div>

//                                         <p className="text-sm text-[#5A3D2B]/70 mt-1">{selectedStore.address}</p>

//                                         {/* 좋아요/싫어요 버튼 */}
//                                         <div className="flex items-center gap-4 mt-2">
//                                             <button
//                                                 className={`flex items-center gap-1 ${storeReactions[selectedStore.id]?.liked ? "text-blue-500 font-medium" : "text-gray-500"}`}
//                                                 onClick={() => handleReaction(selectedStore.id, "like")}
//                                             >
//                                                 <ThumbsUp className="h-4 w-4" />
//                                                 <span>{selectedStore.likes + (storeReactions[selectedStore.id]?.liked ? 1 : 0)}</span>
//                                             </button>

//                                             <button
//                                                 className={`flex items-center gap-1 ${storeReactions[selectedStore.id]?.disliked ? "text-red-500 font-medium" : "text-gray-500"}`}
//                                                 onClick={() => handleReaction(selectedStore.id, "dislike")}
//                                             >
//                                                 <ThumbsDown className="h-4 w-4" />
//                                                 <span>{selectedStore.dislikes + (storeReactions[selectedStore.id]?.disliked ? 1 : 0)}</span>
//                                             </button>

//                                             <Badge className="ml-auto bg-[#75CB3B]/20 text-[#00A949] border-none">
//                                                 {selectedStore.distance}m
//                                             </Badge>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* 내용 */}
//                             <div className="p-4 space-y-4">
//                                 <div className="bg-[#f8f9fa] rounded-lg p-4 border border-[#75CB3B]/30">
//                                     <h3 className="font-medium text-[#5A3D2B] mb-2">최고 혜택 카드</h3>
//                                     <div className="flex justify-between items-center">
//                                         <div>
//                                             <p className="font-bold text-lg text-[#00A949]">{selectedStore.bestCard}</p>
//                                             <p className="text-sm text-[#5A3D2B]/70">최대 할인</p>
//                                         </div>
//                                         <div className="text-2xl font-bold text-[#00A949]">{selectedStore.discount}</div>
//                                     </div>
//                                 </div>

//                                 <Button
//                                     className="w-full bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149]"
//                                     onClick={() => {
//                                         setShowStoreInfo(false);
//                                         handleStoreSelect(selectedStore);
//                                     }}
//                                 >
//                                     카드 혜택 자세히 보기
//                                 </Button>
//                             </div>
//                         </div>
//                     )}
//                 </SheetContent>
//             </Sheet >
//         </div >
//     );
// };

// export default BottomSheet;