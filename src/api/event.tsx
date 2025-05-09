import api from './index';
import { CardEvent } from '@/types/event';
import { UserDetail } from '@/types/event';

// 출석체크 이벤트
export const getTotalAttend = (data: UserDetail) => api.get(`/event/getTotalAttend?userId=${data.userId}&month=${data.month}`);
export const addAttend = (data: UserDetail) => api.post('/event/addAttend', data);

// 카드사 이벤트
//export const getCardEvents = (data: UserDetail) => api.get<CardEvent[]>(`/event/getCardEvent?userId=${data.userId}`);
export const getCardEvents = (userDetail: UserDetail, size: number, pageNumber: number) => {
  return api.get<CardEvent[]>('/api/card-events', {
      params: {
          userId: userDetail.userId,
          pageSize: size,
          pageNumber: pageNumber
      }
  });
};