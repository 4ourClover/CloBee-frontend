import React, { useState, useEffect, useCallback } from "react";

import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import {
  Utensils,
  Coffee,
  Building,
  ShoppingCart,
  Scissors,
  Train,
  Car,
  Film,
} from "lucide-react";

// store.ts에서 타입 및 설정 가져오기
import { StoreCategory, categoryConfig } from '../../types/store';

interface CategoryItemProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  category: StoreCategory;
  selected: boolean;
  onClick: (category: StoreCategory) => void;
}

const CategoryItem = ({ icon, label, color, category, selected, onClick }: CategoryItemProps) => (
  <button
    onClick={() => onClick(category)}
    className={`flex items-center gap-1 rounded-full shadow-sm px-3 py-1.5 mx-1 backdrop-blur-sm
      ${selected ? "bg-white/80 border-2" : "bg-white/80 text-black"}`}
    style={{ borderColor: selected ? color : "transparent" }}
  >
    <div style={{ color }}>{icon}</div>
    <span className="text-xs">{label}</span>
  </button>
);

interface CategoryBarProps {
  selectedCategory: StoreCategory | null; // ✅ null도 전달
  onCategorySelect: (category: StoreCategory | null) => void; // ✅ null도 전달
}

export default function CategoryBar({ selectedCategory, onCategorySelect }: CategoryBarProps) {
  const [selected, setSelected] = useState<StoreCategory | null>(null);

  // const handleClick = (category: StoreCategory) => {
  //   if (selected === category) {
  //     setSelected(null); // ✅ 다시 누르면 해제
  //     onCategorySelect(null);
  //   } else {
  //     setSelected(category);
  //     onCategorySelect(category);
  //   }
  // };

  // ✅ useCallback으로 감싸 함수 재사용
  const handleClick = useCallback((category: StoreCategory | null) => {
    setSelected(category);
    onCategorySelect(category);
  }, [onCategorySelect]);

  useEffect(() => {

    // 상위 컴포넌트에서 전달된 selectedCategory가 변경되면 실행
    if (selectedCategory !== selected) {
      handleClick(selectedCategory);
    }
  }, [selectedCategory, selected, handleClick]); // 의존성 배열에 selected와 handleClick 추가


  return (
    <div className="w-full bg-transparent py-1.5 absolute top-[40px] z-10 left-0 max-w-md mx-auto right-0">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex px-2 py-0.5">
          <CategoryItem icon={<Utensils size={16} />} label="음식점" category="FD6" color={categoryConfig["FD6"].color} selected={selected === "FD6"} onClick={handleClick} />
          <CategoryItem icon={<Coffee size={16} />} label="카페" category="CE7" color={categoryConfig["CE7"].color} selected={selected === "CE7"} onClick={handleClick} />
          <CategoryItem icon={<Train size={16} />} label="대중교통" category="SW8" color={categoryConfig["SW8"].color} selected={selected === "SW8"} onClick={handleClick} />
          <CategoryItem icon={<ShoppingCart size={16} />} label="쇼핑" category="MT1" color={categoryConfig["MT1"].color} selected={selected === "MT1"} onClick={handleClick} />
          <CategoryItem icon={<Scissors size={16} />} label="헤어샵" category="CT1" color={categoryConfig["CT1"].color} selected={selected === "CT1"} onClick={handleClick} />
          <CategoryItem icon={<Car size={16} />} label="주유소" category="OL7" color={categoryConfig["OL7"].color} selected={selected === "OL7"} onClick={handleClick} />
          <CategoryItem icon={<Building size={16} />} label="편의점" category="CS2" color={categoryConfig["CS2"].color} selected={selected === "CS2"} onClick={handleClick} />
          <CategoryItem icon={<Film size={16} />} label="기타" category="" color={categoryConfig[""].color} selected={selected === ""} onClick={handleClick} />
        </div>
        <ScrollBar orientation="horizontal" className="h-1" />
      </ScrollArea>
    </div>
  );
}