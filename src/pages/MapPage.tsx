import React from 'react';
import { useState, useEffect, useCallback } from "react"
import { createRoot } from 'react-dom/client';
import CardBenefitModal from "../components/card-benefit-modal"
import CategoryBar from "../components/map/category-bar"
import BottomNavigation from "../components/bottom-navigation"
import MapHeader from "../components/map/map-header"
import MapRefresh from "../components/map/map-refresh"
import BottomSheet from "../components/map/bottom-sheet"
import { Store, StoreCategory, categoryConfig, categoryNames } from '../types/store';

declare global {
    interface Window {
        kakao: any;
    }
}

export default function MapPage() {
    const [showCardModal, setShowCardModal] = useState(false)
    const [selectedStore, setSelectedStore] = useState<Store | null>(null)
    const [currentLocation, setCurrentLocation] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
    const [kakaoMapInstance, setKakaoMapInstance] = useState<any>(null); // 지도 인스턴스 저장
    const [showStoreInfo, setShowStoreInfo] = useState(false)


    // 더미 데이터: 주변 매장
    const nearbyStores: Store[] = [
        {
            id: 1,
            name: "스타벅스 강남점",
            distance: 120,
            address: "서울시 강남구 테헤란로 123",
            bestCard: "신한카드 Deep Dream",
            discount: "30%",
            lat: 36.510046,
            lng: 128.300269,
            hasEvent: true,
            category: "cafe",
            image: "/placeholder.svg?height=80&width=80",
            likes: 42,
            dislikes: 3,
        },
        {
            id: 2,
            name: "올리브영 역삼점",
            distance: 230,
            address: "서울시 강남구 역삼로 45",
            bestCard: "현대카드 The Green",
            discount: "20%",
            lat: 36.509751,
            lng: 128.300033,
            hasEvent: false,
            category: "shopping",
            image: "/placeholder.svg?height=80&width=80",
            likes: 28,
            dislikes: 5,
        },
        {
            id: 3,
            name: "CGV 강남",
            distance: 350,
            address: "서울시 강남구 역삼동 814-6",
            bestCard: "삼성카드 taptap O",
            discount: "최대 8천원",
            lat: 36.394664,
            lng: 128.391894,
            hasEvent: true,
            category: "movie",
            image: "/placeholder.svg?height=80&width=80",
            likes: 56,
            dislikes: 8,
        },
        {
            id: 4,
            name: "교보문고 강남점",
            distance: 450,
            address: "서울시 강남구 테헤란로 152",
            bestCard: "KB국민카드 가온",
            discount: "15%",
            lat: 36.402505,
            lng: 128.393653,
            hasEvent: false,
            category: "shopping",
            image: "/placeholder.svg?height=80&width=80",
            likes: 35,
            dislikes: 2,
        },
        {
            id: 5,
            name: "버거킹 역삼점",
            distance: 480,
            address: "서울시 강남구 역삼동 735-22",
            bestCard: "우리카드 카드의정석",
            discount: "최대 5천원",
            lat: 36.395130,
            lng: 128.396631,
            hasEvent: true,
            category: "restaurant",
            image: "/placeholder.svg?height=80&width=80",
            likes: 47,
            dislikes: 6,
        },
        {
            id: 6,
            name: "강남역 2번 출구",
            distance: 180,
            address: "서울시 강남구 강남대로 396",
            bestCard: "신한카드 Deep Dream",
            discount: "교통비 10%",
            lat: 36.401285,
            lng: 128.397997,
            hasEvent: false,
            category: "transportation",
            image: "/placeholder.svg?height=80&width=80",
            likes: 22,
            dislikes: 1,
        },
        {
            id: 7,
            name: "GS25 역삼점",
            distance: 150,
            address: "서울시 강남구 역삼동 825-20",
            bestCard: "KB국민카드 가온",
            discount: "결제금액 10%",
            lat: 36.394763,
            lng: 128.397177,
            hasEvent: true,
            category: "convenience",
            image: "/placeholder.svg?height=80&width=80",
            likes: 18,
            dislikes: 4,
        },
        {
            id: 8,
            name: "SK주유소 테헤란로점",
            distance: 320,
            address: "서울시 강남구 테헤란로 152",
            bestCard: "현대카드 The Green",
            discount: "리터당 80원",
            lat: 36.391734,
            lng: 128.391108,
            hasEvent: false,
            category: "gas",
            image: "/placeholder.svg?height=80&width=80",
            likes: 31,
            dislikes: 7,
        },
    ]


    const handleStoreSelect = (store: any) => {
        console.log("매장 자세히 보기");
        setSelectedStore(store)
        setShowCardModal(true)
    }

    // 지도 클릭 핸들러
    const handleMapClick = (storeId: number) => {
        const store = nearbyStores.find((s) => s.id === storeId)
        if (store) {
            setSelectedStore(store)

            // 바텀 시트 표시
            setShowStoreInfo(true)
        }
    }

    // 카테고리에 따른 아이콘 컴포넌트 반환
    const getCategoryIcon = (category: StoreCategory) => {
        const IconComponent = categoryConfig[category].icon
        return <IconComponent className="h-4 w-4" />
    }

    useEffect(() => {
        console.log("맵 로딩");
        if (navigator.geolocation) {
            // 현재 위치 가져오기 시도
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // 성공 시: 위도, 경도 가져오기
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    console.log("현재 위치:", lat, lng);
                    setCurrentLocation({ lat, lng }); // 현재 위치 상태 업데이트
                    loadKakaoMap(lat, lng); // 현재 위치로 지도 로드
                },
                (error) => {
                    // 실패 시: 에러 처리 및 기본 위치로 지도 로드
                    console.error("Geolocation 에러:", error);
                    alert("현재 위치를 가져올 수 없습니다. 기본 위치로 지도를 표시합니다.");
                    // 기본 좌표 (예: 카카오 본사)
                    const defaultLat = 33.450701;
                    const defaultLng = 126.570667;
                    setCurrentLocation({ lat: defaultLat, lng: defaultLng });
                    loadKakaoMap(defaultLat, defaultLng);
                }, {
                enableHighAccuracy: true, // 높은 정확도 요청 활성화
                timeout: 10000,          // 위치 정보를 가져오는 최대 허용 시간 (10초)
                maximumAge: 0            // 캐시된 위치 정보 사용 안 함 (항상 최신 정보 요청)
            }
            );
        } else {
            // Geolocation API 미지원 시: 기본 위치로 지도 로드
            console.error("브라우저가 Geolocation을 지원하지 않습니다.");
            alert("브라우저가 위치 정보 기능을 지원하지 않습니다. 기본 위치로 지도를 표시합니다.");
            const defaultLat = 33.450701;
            const defaultLng = 126.570667;
            setCurrentLocation({ lat: defaultLat, lng: defaultLng });
            loadKakaoMap(defaultLat, defaultLng);
        }
    }, []); // 컴포넌트 마운트 시 1회만 실행

    // 지도 로드 함수 (위도, 경도 받아서 처리)
    const loadKakaoMap = useCallback((lat: number, lng: number) => {
        console.log("위치 표시");
        if (!window.kakao?.maps) {
            console.error("Kakao Maps API가 로드되지 않았습니다.");
            setTimeout(() => loadKakaoMap(lat, lng), 500);
            return;
        }

        const container = document.getElementById("map");
        if (!container) {
            console.error("지도를 표시할 컨테이너('#map')를 찾을 수 없습니다.");
            return;
        }

        //맵 생성
        const options = {
            center: new window.kakao.maps.LatLng(lat, lng),
            level: 3,
        };
        const map = new window.kakao.maps.Map(container, options);
        setKakaoMapInstance(map);

        // 현재 위치 마커
        const currentPosition = new window.kakao.maps.LatLng(lat, lng);
        const currentMarkerContent = (
            <div className="absolute left-1/2 top-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2">
                <div className="p-2 rounded-full bg-blue-500 border-2 border-white shadow-md">
                    <div className="h-3 w-3 bg-white rounded-full"></div>
                </div>
            </div>
        );
        const currentOverlayRoot = document.createElement('div');
        createRoot(currentOverlayRoot).render(currentMarkerContent);
        const currentOverlay = new window.kakao.maps.CustomOverlay({
            position: currentPosition,
            content: currentOverlayRoot,
            map: map,
            clickable: true, // 클릭 가능하도록 설정
        });
        currentOverlay.setMap(map);


        //매장 마커
        nearbyStores.forEach((store) => {
            const storePosition = new window.kakao.maps.LatLng(store.lat, store.lng);
            const storeMarkerContent = (
                <div
                    className="flex flex-col items-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                    onClick={() => handleMapClick(store.id)}
                >
                    {/* <Card
                        key={`tooltip-${store.id}`}
                        className="bg-white shadow-lg rounded-lg p-1 text-xs whitespace-nowrap max-w-[150px] border-none z-30"
                    >
                        <div className="flex justify-between items-center">
                            <CreditCard className="h-3 w-3 text-[#00A949]" />
                            <span className="font-bold text-[#5A3D2B]">{store.bestCard}</span>
                            <span className="font-bold text-[#00A949]">{store.discount}</span>
                        </div>
                    </Card> */}
                    {/* <div className="p-2 rounded-full bg-gradient-to-r from-[#75CB3B] to-[#00B959] shadow-md relative">
                        <MapPin className="h-5 w-5 text-white" />
                        {store.hasEvent && (
                            <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
                        )}
                    </div> */}
                    <div
                        className="p-2 rounded-full shadow-md relative"
                        style={{
                            background: categoryConfig[store.category].color,
                        }}
                    >
                        {React.createElement(categoryConfig[store.category].icon, { className: "h-5 w-5 text-white" })}
                    </div>
                    <div className="mt-1 px-2 py-1 bg-transparent rounded-md text-xs max-w-[100px] text-center font-bold border border-white">
                        {store.name}
                    </div>
                </div>
            );
            const storeOverlayRoot = document.createElement('div');
            createRoot(storeOverlayRoot).render(storeMarkerContent);
            const storeOverlay = new window.kakao.maps.CustomOverlay({
                position: storePosition,
                content: storeOverlayRoot,
                map: map,
                clickable: true// 클릭 가능하도록 설정
            });
            storeOverlay.setMap(map);

        });

        console.log("카카오 지도 로드/재조정 완료:", lat, lng);

    }, [nearbyStores, handleMapClick, handleStoreSelect]); // 의존성 배열 업데이트


    // MapRefresh 버튼 클릭 핸들러
    const handleRefreshMap = () => {
        console.log("맵 새로고침 클릭");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setCurrentLocation({ lat, lng });
                    loadKakaoMap(lat, lng); // 현재 위치로 지도 재로드
                },
                (error) => {
                    console.error("Geolocation 에러:", error);
                    alert("현재 위치를 가져올 수 없습니다.");
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            alert("브라우저가 위치 정보 기능을 지원하지 않습니다.");
        }
    };

    console.log("MyComponent 렌더링 시작:");

    return (
        <main className="flex flex-col h-full w-full mx-auto overflow-auto font-gmarket">
            {/* 헤더 */}
            <MapHeader />

            {/* 카테고리 바 */}
            <CategoryBar />

            {/* 지도 부분 */}
            <div className="flex-1 relative bg-[#f2f2f2] overflow-hidden">
                {/* 반경 표시 */}
                {/* <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-30 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-md text-sm font-medium text-[#00A949]">
                    반경 {radius}m
                </div> */}

                {/* 지도 배경 */}
                <div className="absolute inset-0 bg-[#e8f4f8]">
                    <div id="map" style={{ width: "100%", height: "100%" }} />
                </div>

            </div>

            {/* 하단 네비게이션 */}
            <BottomNavigation
                floatingActionButton={
                    <MapRefresh onClick={handleRefreshMap} />
                }
            />

            {/* 카드 혜택 모달 */}
            {showCardModal && selectedStore && (
                <CardBenefitModal store={selectedStore} onClose={() => setShowCardModal(false)} />
            )}

            {/* 바텀 시트 */}
            <BottomSheet
                showStoreInfo={showStoreInfo}
                setShowStoreInfo={setShowStoreInfo}
                selectedStore={selectedStore}
                handleStoreSelect={handleStoreSelect}
                categoryConfig={categoryConfig}
                categoryNames={categoryNames}
                getCategoryIcon={getCategoryIcon}
            />
        </main>
    )
}


