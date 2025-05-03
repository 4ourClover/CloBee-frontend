export type CardListDTO = {
    cardInfoId: number
    cardRank: number
    cardName: string
    cardBrand: string
    cardDomesticAnnualFee: number
    cardGlobalAnnualFee: number
    cardType: number
    cardImageUrl: string
}

export type CardPageDTO = {
    cardPageList: CardListDTO[]
    totalCount: number
}

export type CardBenefitDetail = {
    cardBenefitId: number;
    cardInfoId: number;
    cardBenefitCategory: number;
    cardBenefitStore: string;
    cardBenefitTitle: string;
    cardBenefitDesc: string;
    cardBenefitDiscntRate: number;
    cardBenefitDiscntPrice: number;
    cardBenefitCondition: string;
};

export type CardBrandUrl = {
    cardBrand: string;
    cardBrandUrl: string;
};