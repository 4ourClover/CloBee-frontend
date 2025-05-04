import axios from "axios"
import type { CardPageDTO, CardBenefitDetail, CardListDTO, CardSpendingInfo } from "./cardTypes"

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

export const applyCard = async (cardInfoId: number, cardBrand: number): Promise<string> => {
    try {
        const response = await axios.get("http://localhost:8080/api/card/apply", {
            params: { cardInfoId, cardBrand },
        })
        // 백엔드에서 리다이렉트 URL을 반환하지만,
        // 프론트엔드에서는 window.open()을 사용할 것이므로 URL만 추출
        return response.request.responseURL || ""
    } catch (error) {
        console.error("카드 신청 URL 가져오기 실패:", error)
        throw error
    }
}

// 내 카드 목록 가져오기 함수 추가
export const fetchMyCards = async (userId: number): Promise<CardListDTO[]> => {
    const response = await axios.get("http://localhost:8080/api/card/getMyCardList", {
        params: { userId },
    })
    return response.data
}

// 카드 실적 정보 가져오기 함수 추가
export const fetchCardSpending = async (cardInfoId: number, userId: number): Promise<CardSpendingInfo> => {
    // 실제 API 엔드포인트로 변경 필요
    const response = await axios.get("http://localhost:8080/api/card/getCardSpending", {
        params: { cardInfoId, userId },
    })
    return response.data
}

// 카드 검색 함수 추가
export const searchCards = async (cardName: string): Promise<CardListDTO[]> => {
    const response = await axios.get("http://localhost:8080/api/card/search", {
        params: { cardName },
    })
    return response.data
}
