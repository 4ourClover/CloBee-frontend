import api from './axios/index'; // 기존에 만든 axios 인스턴스

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