// useLocationTracking.ts
import { useEffect, useRef, useState } from 'react';
import { Store } from '../types/store';

// 위치 정보 타입
interface Location {
    lat: number | null;
    lng: number | null;
}

// 옵션 인터페이스
interface LocationTrackingOptions {
    onLocationChange?: (newPosition: Location) => void;
    fetchNearbyStores: (position: Location) => Promise<Store[]>;
    sendNotification: (stores: Store[]) => void;
    kakaoMapRef: React.MutableRefObject<any>; // 카카오맵 인스턴스
    currentMarkerRef: React.MutableRefObject<any>; // 현재 위치 마커
    minDistance?: number; // 최소 이동 거리 (미터)
    isNotificationOn: boolean; // 알림 활성화 여부
    showNotificationStores: (stores: Store[]) => void;
}

// 반환 타입
interface LocationTrackingReturn {
    currentLocation: Location;
    isTracking: boolean;
    startTracking: () => void;
    stopTracking: () => void;
}

/**
 * 위치 추적 및 주변 혜택 매장 알림 기능을 제공하는 훅
 */
export function useLocationTracking({
    onLocationChange,
    fetchNearbyStores,
    sendNotification,
    showNotificationStores,
    kakaoMapRef,
    currentMarkerRef,
    minDistance = 100, // 기본값 100m
    isNotificationOn
}: LocationTrackingOptions): LocationTrackingReturn {
    const [currentLocation, setCurrentLocation] = useState<Location>({ lat: null, lng: null });
    const lastPositionRef = useRef<Location | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const [isTracking, setIsTracking] = useState<boolean>(false);

    // 두 지점 간 거리 계산 함수 (하버사인 공식)
    const calculateDistance = (pos1: Location, pos2: Location): number => {
        if (pos1.lat === null || pos1.lng === null || pos2.lat === null || pos2.lng === null) {
            return 0;
        }

        const R = 6371e3; // 지구 반지름 (미터)
        const φ1 = pos1.lat * Math.PI / 180;
        const φ2 = pos2.lat * Math.PI / 180;
        const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180;
        const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // 미터 단위 거리
    };

    // 위치 변경 핸들러
    const handlePositionChange = (position: GeolocationPosition): void => {
        const { latitude, longitude } = position.coords;
        //const newPosition: Location = { lat: latitude, lng: longitude };
        const newPosition: Location = { lat: 37.584165, lng: 126.903805 };

        // 현재 위치 상태 업데이트
        setCurrentLocation(newPosition);

        // 외부 위치 변경 핸들러 호출
        if (onLocationChange) {
            onLocationChange(newPosition);
        }

        // 처음이거나 지정된 거리 이상 이동했을 때만 처리
        if (!lastPositionRef.current ||
            calculateDistance(lastPositionRef.current, newPosition) >= minDistance) {

            console.log(`${minDistance}m 이상 이동 감지!`);
            lastPositionRef.current = newPosition;

            // 카카오맵 마커 업데이트
            if (kakaoMapRef.current && currentMarkerRef.current &&
                newPosition.lat !== null && newPosition.lng !== null) {
                const moveLatLng = new window.kakao.maps.LatLng(newPosition.lat, newPosition.lng);
                currentMarkerRef.current.setPosition(moveLatLng);
            }

            // 주변 매장 검색 후 알림 처리
            if (isNotificationOn) {
                fetchNearbyStores(newPosition)
                    .then(stores => {
                        if (stores && stores.length > 0) {
                            // 알림 전송
                            showNotificationStores(stores);
                            sendNotification(stores);
                        }

                    });
            }
        }
    };

    // 오류 핸들러
    const handleError = (error: GeolocationPositionError): void => {
        console.error("위치 추적 오류:", error);
    };

    // 위치 추적 시작
    const startTracking = (): void => {
        console.log("위치 추적")
        if (navigator.geolocation) {
            const options: PositionOptions = {
                enableHighAccuracy: true, // 배터리 절약
                maximumAge: 300000, // 5분
                timeout: 30000 // 30초
            };

            watchIdRef.current = navigator.geolocation.watchPosition(
                handlePositionChange,
                handleError,
                options
            );

            setIsTracking(true);
            console.log("위치 추적 시작");
        } else {
            console.error("브라우저가 Geolocation을 지원하지 않습니다.");
        }
    };

    // 위치 추적 중지
    const stopTracking = (): void => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
            setIsTracking(false);
            console.log("위치 추적 중지");
        }
    };

    // 컴포넌트 마운트 시 위치 추적 시작, 언마운트 시 중지
    useEffect(() => {
        startTracking();

        return () => {
            stopTracking();
        };
    }, []);

    // 알림 설정 변경 시 처리
    useEffect(() => {
        if (isNotificationOn && !isTracking) {
            startTracking();
        }
    }, [isNotificationOn, isTracking]);

    return {
        currentLocation,
        isTracking,
        startTracking,
        stopTracking
    };
}

/**
 * 웹 푸시 알림 관련 유틸리티 함수
 */
export const notificationUtils = {
    // 알림 권한 요청
    requestPermission: async (): Promise<boolean> => {
        if (!("Notification" in window)) {
            console.log("이 브라우저는 알림을 지원하지 않습니다.");
            return false;
        }

        if (Notification.permission === "granted") {
            return true;
        }

        if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            return permission === "granted";
        }

        return false;
    },

    // 알림 전송
    sendNotification: (stores: Store[]): void => {
        if (!stores || stores.length === 0) return;

        // 알림 권한 확인
        if (Notification.permission !== "granted") {
            notificationUtils.requestPermission();
            return;
        }

        const store = stores[0]; // 첫 번째 매장 정보 사용

        const title = '💳 주변에 혜택 매장이 있어요!';
        const options: NotificationOptions = {
            body: `${store.place_name}${stores.length > 1 ? ` 외 ${stores.length - 1}곳` : ''}에서 카드 혜택을 받을 수 있어요!`,
            icon: '/logo.png',
            badge: '/badge.png',
        };

        const notification = new Notification(title, options);

        notification.onclick = function () {
            window.focus();
            // 해당 매장 정보 표시 또는 지도에서 위치 강조 기능 추가 가능
        };
    }
};

/**
 * 주변 혜택 매장 검색 함수
 */
export const fetchNearbyBenefitStores = async (
    position: Location,
    benefitStores: string[],
    kakaoMapInstance: any,
    searchRadius: number
): Promise<Store[]> => {
    if (position.lat === null || position.lng === null) {
        return [];
    }

    const currentPosition = new window.kakao.maps.LatLng(position.lat, position.lng);
    const ps = new window.kakao.maps.services.Places();
    const searchPromises: Promise<any[]>[] = [];

    // 혜택 매장 키워드로 검색
    benefitStores.forEach((bStore) => {
        const searchPromise = new Promise<any[]>((resolve, reject) => {
            ps.keywordSearch(bStore, (data: any, status: any) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    resolve(data);
                } else {
                    console.warn(`'${bStore}' 검색 오류:`, status);
                    resolve([]);
                }
            }, { location: currentPosition, radius: searchRadius, size: 5 });
        });

        searchPromises.push(searchPromise);
    });

    try {
        const allResults = await Promise.all(searchPromises);
        const stores: Store[] = [];

        allResults.forEach(data => {
            data.forEach((item: any) => {
                stores.push({
                    id: item.id,
                    place_name: item.place_name,
                    address_name: item.address_name,
                    road_address_name: item.road_address_name || "",
                    phone: item.phone || "",
                    place_url: item.place_url || "",
                    category_name: item.category_name || "",
                    category_group_code: item.category_group_code || "",
                    category_group_name: item.category_group_name || "",
                    distance: item.distance || "",
                    lng: item.x,
                    lat: item.y,
                });
            });
        });
        console.log("주변 혜택 매장 알려드릴", stores)
        return stores;
    } catch (error) {
        console.error("주변 혜택 매장 검색 중 오류:", error);
        return [];
    }
};