import type React from "react";

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
  onClick?: () => void;
}

const CategoryItem = ({ icon, label, color, onClick }: CategoryItemProps) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm px-3 py-1.5 mx-1"
  >
    <div style={{ color }}>{icon}</div>
    <span className="text-xs text-black">{label}</span>
  </button>
);

export default function CategoryBar() {
  return (
    <div className="w-full bg-transparent py-1.5 absolute top-[40px] z-10 left-0 max-w-sm mx-auto right-0">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex px-2 py-0.5">
          <CategoryItem
            icon={<Utensils size={16} />}
            label="음식점"
            color={categoryConfig.restaurant.color}
          />
          <CategoryItem
            icon={<Coffee size={16} />}
            label="카페"
            color={categoryConfig.cafe.color}
          />
          <CategoryItem
            icon={<Train size={16} />}
            label="대중교통"
            color={categoryConfig.transportation.color}
          />
          <CategoryItem
            icon={<ShoppingCart size={16} />}
            label="쇼핑"
            color={categoryConfig.shopping.color}
          />
          <CategoryItem
            icon={<Scissors size={16} />}
            label="헤어샵"
            color={categoryConfig.beauty.color}
          />
          <CategoryItem
            icon={<Car size={16} />}
            label="주유소"
            color={categoryConfig.gas.color}
          />
          <CategoryItem
            icon={<Building size={16} />}
            label="편의점"
            color={categoryConfig.convenience.color}
          />
          <CategoryItem
            icon={<Film size={16} />}
            label="영화관"
            color={categoryConfig.movie.color}
          />
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>
    </div>
  );
}