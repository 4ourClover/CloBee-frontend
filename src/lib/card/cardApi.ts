import api from '../../api/axios/index';
import type { CardPageDTO, CardBenefitDetail, CardListDTO, UserCardPerformanceDetail, UserCardListDTO } from "./cardTypes"

// fetchAllCards 함수 수정 - 페이지 인덱스 조정 및 에러 처리 개선
export const fetchAllCards = async (cardType: string, page: number, size: number): Promise<CardPageDTO> => {
    try {
        console.log("API 호출:", { cardType, page, size })
        const response = await api.get<CardPageDTO>("/card/getCardList", {
            params: { cardType, page, size },
        })
        console.log("API 응답:", response.data)
        return response.data
    } catch (error) {
        console.error("API 에러:", error)
        // 기본 응답 구조 반환
        return { cardPageList: [], totalCount: 0 }
    }
}

export const fetchCardDetail = async (cardInfoId: number): Promise<CardBenefitDetail[]> => {
    const response = await api.get<CardBenefitDetail[]>("/card/getCardDetail", {
        params: { cardInfoId },
    })
    return response.data
}

// applyCard 함수를 컨트롤러 응답 형식에 맞게 수정
export const applyCard = async (cardInfoId: number, cardBrand: number, userId: number): Promise<string> => {
    try {
        const response = await api.get<string>("/card/apply", {
            params: { cardInfoId, cardBrand, userId },
        })

        // 컨트롤러에서 URL을 직접 반환하므로 response.data가 URL 문자열입니다
        console.log("카드 신청 응답:", response.data)
        return response.data
    } catch (error) {
        console.error("카드 신청 URL 가져오기 실패:", error)
        throw error
    }
}


// 내 카드 목록 가져오기 함수 추가

export const fetchMyCards = async (userId: number): Promise<UserCardListDTO[]> => {
    const response = await api.get<UserCardListDTO[]>("/card/getMyCardList", {
        params: { userId },
        withCredentials: true,
    })
    return response.data
}

// 카드 실적 정보 조회 함수 (백엔드 컨트롤러에 맞게 수정)
export const fetchCardPerformance = async (
    userCardId: number,
    year: number,
    month: number,
): Promise<UserCardPerformanceDetail> => {
    try {
        console.log(`API call: fetchCardPerformance - userCardId: ${userCardId}, year: ${year}, month: ${month}`)

        // 백엔드에서는 userCardId를 Long 타입으로 처리하므로 명시적으로 숫자로 변환
        const params = {
            userCardId: Number(userCardId),
            year: Number(year),
            month: Number(month),
        }

        console.log("API params:", params)

        const response = await api.get<UserCardPerformanceDetail>("/card/getPerformance", { params })
        console.log("API response:", response.data)

        // 응답이 없거나 비어있는 경우 기본값 반환
        if (!response.data) {
            console.log("Empty response, returning default value")
            return {
                performanceId: 0,
                userCardId,
                year,
                month,
                monthlyAmount: 0,
            }
        }

        return response.data
    } catch (error) {
        console.error("카드 실적 정보 조회 실패:", error)
        // 에러 발생 시 기본값 반환
        return {
            performanceId: 0,
            userCardId,
            year,
            month,
            monthlyAmount: 0,
        }
    }
}

// searchCards 함수 수정 - 에러 처리 개선
export const searchCards = async (cardName: string): Promise<CardListDTO[]> => {
    try {
        console.log("검색 API 호출:", { cardName })
        const response = await api.get<CardListDTO[]>("/card/search", {
            params: { cardName },
        })
        console.log("검색 API 응답:", response.data)
        return response.data
    } catch (error) {
        console.error("검색 API 에러:", error)
        // 에러 발생 시 빈 배열 반환
        return []
    }
}

// 내 카드 추가하기 함수 추가
export const addUserCard = async (userId: number, cardInfoId: number, userCardType: number): Promise<string> => {
    try {
        const response = await api.post<string>("/card/addCard", {
            userId,
            cardInfoId,
            userCardType,
        })
        return response.data
    } catch (error) {
        console.error("카드 추가 실패:", error)
        throw error
    }
}

// 내 카드 삭제하기 함수 추가
export const deleteUserCard = async (userId: number, cardInfoId: number): Promise<string> => {
    const response = await api.delete<string>("/card/delCard", {
        params: { userId, cardInfoId },
    })
    return response.data
}