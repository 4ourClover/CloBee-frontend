export interface CardEvent {
    eventInfoId: number;
    eventTitle: string;
    eventDesc: string;
    eventCardtype: string;
    eventTypeCd?: number;
    eventStartDay?: string;
    eventEndDay?: string;
    eventStatusCd?: number;
    eventCardUrl?: string;
    eventCardCorp?: string;
    haveCard?: boolean;
    eventQr?: string | null;
    eventImage?: string;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface UserDetail {
    userId: number;
    month?: String;
}
