import type React from "react"

import { ScrollArea, ScrollBar } from "../components/ui/scroll-area"
import {
  Utensils,
  Coffee,
  Bed,
  Percent,
  ShoppingCart,
  Pill,
  Scissors,
  Car,
  Building,
  CreditCard,
  Gift,
  MoreHorizontal,
} from "lucide-react"

interface CategoryItemProps {
  icon: React.ReactNode
  label: string
  color: string
  onClick?: () => void
}

const CategoryItem = ({ icon, label, color, onClick }: CategoryItemProps) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm px-3 py-1.5 mx-1"
  >
    <div style={{ color }}>{icon}</div>
    <span className="text-xs text-black">{label}</span>
  </button>
)

export default function CategoryBar() {
  // 다양한 색상 정의
  const colors = {
    food: "#FF6B6B",
    cafe: "#6B66FF",
    pension: "#FF9E40",
    coupon: "#FF66B3",
    order: "#40C9FF",
    pharmacy: "#66D173",
    convenience: "#FF8066",
    hair: "#C566FF",
    parking: "#FFD166",
    bank: "#668CFF",
    gas: "#FF6666",
    mart: "#66B3FF",
    more: "#888888",
  }

  return (
    <div className="w-full bg-transparent py-1.5 absolute top-[40px] z-10 left-0 max-w-sm mx-auto right-0">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex px-2 py-0.5">
          <CategoryItem icon={<Utensils size={16} />} label="음식점" color={colors.food} />
          <CategoryItem icon={<Coffee size={16} />} label="카페" color={colors.cafe} />
          <CategoryItem icon={<Bed size={16} />} label="펜션" color={colors.pension} />
          <CategoryItem icon={<Percent size={16} />} label="쿠폰" color={colors.coupon} />
          <CategoryItem icon={<ShoppingCart size={16} />} label="N주문" color={colors.order} />
          <CategoryItem icon={<Pill size={16} />} label="약국" color={colors.pharmacy} />
          <CategoryItem icon={<ShoppingCart size={16} />} label="편의점" color={colors.convenience} />
          <CategoryItem icon={<Scissors size={16} />} label="헤어샵" color={colors.hair} />
          <CategoryItem icon={<Car size={16} />} label="주차장" color={colors.parking} />
          <CategoryItem icon={<Building size={16} />} label="은행" color={colors.bank} />
          <CategoryItem icon={<CreditCard size={16} />} label="주유소" color={colors.gas} />
          <CategoryItem icon={<Gift size={16} />} label="마트" color={colors.mart} />
          <CategoryItem icon={<MoreHorizontal size={16} />} label="더보기" color={colors.more} />
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>
    </div>
  )
}
