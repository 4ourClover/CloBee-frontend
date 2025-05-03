import {
    Coffee,
    Utensils,
    ShoppingCart,
    Building,
    Train,
    Car,
    Scissors,
    Film,
} from "lucide-react"

export type StoreCategory = "restaurant" | "cafe" | "transportation" | "gas" | "shopping" | "movie" | "convenience" | "beauty";

export interface Store {
    id: number;
    name: string;
    distance: number;
    address: string;
    bestCard: string;
    discount: string;
    lat: number;
    lng: number;
    hasEvent: boolean;
    category: StoreCategory;
    image: string;
    likes: number;
    dislikes: number;
}

// 카테고리별 색상 및 아이콘 정의
export const categoryConfig: Record<StoreCategory, { color: string; icon: React.ElementType }> = {
    restaurant: { color: "#FF9E40", icon: Utensils },
    cafe: { color: "#8B4513", icon: Coffee },
    transportation: { color: "#4A90E2", icon: Train },
    gas: { color: "#FFD700", icon: Car },
    shopping: { color: "#FF66B3", icon: ShoppingCart },
    movie: { color: "#FF0000", icon: Film },
    convenience: { color: "#87CEEB", icon: Building },
    beauty: { color: "#9370DB", icon: Scissors },
}

// 카테고리 한글명 매핑
export const categoryNames: Record<StoreCategory, string> = {
    restaurant: "음식점",
    cafe: "카페",
    transportation: "대중교통",
    gas: "주유소",
    shopping: "쇼핑",
    movie: "영화관",
    convenience: "편의점",
    beauty: "헤어샵",
}
