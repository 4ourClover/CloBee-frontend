import {
    Coffee,
    Utensils,
    ShoppingCart,
    Building,
    Train,
    Car,
    Clover,
    Film,
} from "lucide-react"

//export type StoreCategory = "restaurant" | "cafe" | "transportation" | "gas" | "shopping" | "movie" | "convenience" | "beauty";
export type StoreCategory = "FD6" | "CE7" | "SW8" | "OL7" | "MT1" | "CT1" | "CS2" | "";
export type brandCategory = "신한카드" | "삼성카드" | "현대카드" | "KB국민카드" | "우리카드" | "";

export const validBrands: brandCategory[] = [
    "신한카드",
    "삼성카드",
    "현대카드",
    "KB국민카드",
    "우리카드",
    ""
];

export type BenefitCard = {
    id: number;                 // cardBenefitId
    cardInfoId: number;         // cardInfoId
    benefit_store: string;      // cardBenefitStore
    discount: string;           // cardBenefitDiscntPrice ("50%")
    discountPrice: number;      // discountPrice (5000)
    description: string;        // cardBenefitDesc ("할인")
    condition: string;          // cardBenefitCondition ("전월실적 30만원 이상")
    card_name: string;          // cardName ("삼성카드 taptap O")
    card_image_url: string | null;  // cardImageUrl
    cardBrand: number;
};


export type notificationStore = {
    id: number;                 // cardBenefitId
    storeFullName: string
    distance: number,
    benefit_store: string;      // cardBenefitStore
    discount: string;           // cardBenefitDiscntPrice ("50%")
    discountPrice: number;      // discountPrice (5000)
    description: string;        // cardBenefitDesc ("할인")
    card_name: string;          // cardName ("삼성카드 taptap O")
};


export interface Store {
    id: number;                    // 카카오 place_id (문자열)
    place_name: string;            // 장소명 (예: "올리브영 상주점")
    address_name: string;          // 지번 주소
    road_address_name: string;     // 도로명 주소
    phone: string;                 // 전화번호
    place_url: string;             // 카카오 장소 상세 URL
    category_name: string;         // 카테고리 전체 이름
    category_group_code: StoreCategory;   // 대분류 카테고리 코드 (예: "PM9")
    category_group_name: string;   // 대분류 카테고리 이름 (예: "약국")
    distance: number;              // 중심좌표로부터 거리 (미터, 문자열)
    lat: number;                     // 경도 (문자열)
    lng: number;                     // 위도 (문자열)
    benefitStore: string
}


export const categoryConfig: Record<StoreCategory, { color: string; icon: React.ElementType }> = {
    FD6: { color: "#FF9E40", icon: Utensils },       // 음식점
    CE7: { color: "#8B4513", icon: Coffee },         // 카페
    SW8: { color: "#4A90E2", icon: Train },          // 지하철역
    OL7: { color: "#FFD700", icon: Car },            // 주유소, 충전소
    MT1: { color: "#FF66B3", icon: ShoppingCart },   // 대형마트
    CT1: { color: "#FF0000", icon: Film },           // 문화시설 (영화관 등)
    CS2: { color: "#87CEEB", icon: Building },       // 편의점
    "": { color: "#A9A9A9", icon: Clover },     // 미분류/기타
};

export const categoryNames: Record<StoreCategory, string> = {
    FD6: "음식점",        // restaurant
    CE7: "카페",          // cafe
    SW8: "대중교통",      // transportation
    OL7: "주유소",        // gas
    MT1: "쇼핑",          // shopping
    CT1: "영화관",        // movie
    CS2: "편의점",        // convenience
    "": "기타",           // fallback (unknown)
};