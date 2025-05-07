import api from './index';

export interface EventsAttendDetail {
    userId: number;
    month?: String;
}

// 출석체크 이벤트
export const getTotalAttend = (data: EventsAttendDetail) => api.get(`/event/getTotalAttend?userId=${data.userId}&month=${data.month}`);
export const addAttend = (data: EventsAttendDetail) => api.post('/event/addAttend', data);
