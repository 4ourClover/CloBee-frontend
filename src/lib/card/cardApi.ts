import axios from "axios"
import type { CardPageDTO, CardBenefitDetail } from "./cardTypes"

export const fetchAllCards = async (cardType: string, page: number, size: number): Promise<CardPageDTO> => {
    const response = await axios.get("http://localhost:8080/api/card/getCardList", {
        params: { cardType, page, size },
    })
    return response.data
}

export const fetchCardDetail = async (cardInfoId: number): Promise<CardBenefitDetail[]> => {
    const response = await axios.get("http://localhost:8080/api/card/getCardDetail", {
        params: { cardInfoId },
    })
    return response.data
}

export const applyCard = async (cardInfoId: number, cardBrand: number): Promise<string | null> => {
    try {
        const response = await axios.get("http://localhost:8080/api/card/apply", {
            params: { cardInfoId, cardBrand },
        })
        return response.data
    } catch (e) {
        console.error("카드 신청 URL API 호출 실패:", e)
        return null
    }
}