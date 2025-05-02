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