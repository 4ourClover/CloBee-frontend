export type CardListDTO = {
    cardInfoId: number
    cardRank: number
    cardName: string
    cardBrand: string
    cardBrandName: string
    cardDomesticAnnualFee: number
    cardGlobalAnnualFee: number
    cardType: number
    cardImageUrl: string
    userCardId?: number // 내 카드 목록에서 사용할 userCardId 추가
}

export type CardPageDTO = {
    cardPageList: CardListDTO[]
    totalCount: number
}

export type CardBenefitDetail = {
    cardBenefitId: number
    cardInfoId: number
    cardBenefitStore: string
    cardBenefitDesc: string
    cardBenefitDiscntPrice: number
    cardBenefitCondition: string
    cardName: string
    discountPrice: number
    cardRank: number
    cardImageUrl: string
}

export type CardBrandUrl = {
    cardBrand: number
    cardBrandUrl: string
}

// 백엔드 모델에 맞게 수정된 카드 실적 상세 정보 타입
export type UserCardPerformanceDetail = {
    performanceId: number
    userCardId: number
    year: number
    month: number
    monthlyAmount: number
}

// 사용자 카드 상세 정보 타입 추가
export type UserCardDetail = {
    userCardId: number
    userId: number
    cardInfoId: number
    userCardType: number
}

export type UserCardListDTO = {
    userCardId: number
    cardInfoId: number
    cardRank: number
    cardName: string
    cardBrand: string
    cardBrandName: string;
    cardDomesticAnnualFee: number
    cardGlobalAnnualFee: number
    cardType: number
    cardImageUrl: string
}