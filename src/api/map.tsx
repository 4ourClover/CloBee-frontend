import api from './axios/index'; // 기존에 만든 axios 인스턴스
import { BenefitCard } from '../types/store';

export const getBenefitStores = async (userId: number): Promise<string[]> => {
    try {
        const response = await api.get<string[]>('/card/benefit-stores', {
            params: { userId }
        });
        return response.data;
    } catch (error) {
        console.error('혜택 매장 조회 실패:', error);
        throw error;
    }
};

export const getBenefitStoresBrand = async (userId: number): Promise<Record<string, string[]>> => {
    try {
        const response = await api.get<Record<string, string[]>>('/card/benefit-stores-brand', {
            params: { userId }
        });
        return response.data;
    } catch (error) {
        console.error(`❌ [getBenefitStores] 유저 ID ${userId}에 대한 혜택 매장 조회 실패:`, error);
        throw error;
    }
};

export const getMapMyBenefits = async (userId: number, store: string): Promise<BenefitCard[]> => {
    try {
        const response = await api.get<BenefitCard[]>("/card/mapMyBenefits", {
            params: {
                userId,
                cardBenefitStore: store,
            },
        });



        return response.data;
    } catch (error) {
        console.error(`❌ [getMapMyBenefits] 유저 ID ${userId}에 대한 혜택 카드 조회 실패:`, error);
        throw error;
    }
};

export const getRecommendedCards = async (store: string): Promise<BenefitCard[]> => {
    try {
        const response = await api.get<any[]>("/card/recommendCard", {
            params: { cardBenefitStore: store },
        });
        console.log("recomended", response)

        // 수동 매핑
        const mapped: BenefitCard[] = response.data.map((item: any) => ({
            id: item.cardBenefitId,
            cardInfoId: item.cardInfoId,
            benefit_store: item.cardBenefitStore,
            discount: item.cardBenefitDiscntPrice,
            discountPrice: item.discountPrice,
            description: item.cardBenefitDesc,
            condition: item.cardBenefitCondition,
            card_name: item.cardName,
            card_image_url: item.cardImageUrl,
        }));

        return mapped;
    } catch (error) {
        console.error(`❌ [getRecommendedCards] 추천 카드 조회 실패:`, error);
        throw error;
    }
};