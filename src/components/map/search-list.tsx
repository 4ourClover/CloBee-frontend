import { useState } from 'react';
import { Button } from '../ui/button';
import { MapPin, ChevronRight, X } from 'lucide-react';
import { Store } from '../../types/store';

interface SearchListProps {
    searchStores: Store[] | null;
    setShowStoreList: (show: boolean) => void;
    onSearchStoreSelect: (storeId: number) => void; // 매장 선택 시 호출되는 함수
}

export default function SearchList({ searchStores, setShowStoreList, onSearchStoreSelect }: SearchListProps) {
    if (!searchStores || searchStores.length === 0) {
        return (
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg z-40 max-h-[50%] overflow-hidden">
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <MapPin className="h-12 w-12 text-[#85DB4B]/70 mb-2" />
                    <h3 className="text-lg font-medium text-[#5A3D2B]">검색 매장이 없습니다</h3>
                    <p className="text-sm text-[#5A3D2B]/70 mt-1">다른 매장을 검색해보세요</p>
                    <Button
                        variant="outline"
                        className="border-[#75CB3B]/30 text-[#00A949] hover:bg-[#75CB3B]/10"
                        onClick={() => setShowStoreList(false)}
                    >
                        닫기
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg z-40 max-h-[60%] overflow-hidden">
            <div className="p-3 border-b flex justify-between items-center">
                <h2 className="font-bold text-sm text-[#5A3D2B]">주변 매장 목록</h2>
                <Button variant="ghost" size="sm"
                    onClick={() => setShowStoreList(false)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="overflow-auto max-h-[calc(60vh-48px)]">
                <ul className="divide-y">
                    {searchStores.map((store) => (
                        <li key={store.id} className="p-3 hover:bg-[#85DB4B]/10">
                            <Button
                                variant="ghost"
                                className="w-full flex items-start justify-between p-0 h-auto hover:bg-transparent"
                                onClick={() => {
                                    onSearchStoreSelect(store.id);
                                    setShowStoreList(false);
                                }}
                            >
                                <div className="flex items-start gap-3 text-left">
                                    <div className="mt-1 p-1.5 rounded-full bg-[#85DB4B]/20">
                                        <MapPin className="h-4 w-4 text-[#00B786]" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm text-[#5A3D2B]">{store.place_name}</h3>
                                        <p className="text-xs text-[#5A3D2B]/70 mt-0.5">{store.address_name}</p>
                                        <div className="flex items-center mt-1">
                                            <span className="text-xs bg-[#85DB4B]/20 text-[#00B786] px-1.5 py-0.5 rounded-full">
                                                {store.distance}m
                                            </span>
                                            <span className="mx-1.5 text-gray-300">|</span>
                                            <span className="text-xs text-[#00B786]">최대 30% 할인</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}