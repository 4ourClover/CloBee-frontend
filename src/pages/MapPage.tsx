import { useState, useEffect, useCallback } from "react"
import { createRoot } from 'react-dom/client';
import { MapPin, CreditCard } from "lucide-react"

import { Card } from "../components/ui/card"
import CardBenefitModal from "../components/card-benefit-modal"
import CategoryBar from "../components/category-bar"
import BottomNavigation from "../components/bottom-navigation"
import MapHeader from "../components/map/map-header"
import MapRefresh from "../components/map/map-refresh"

declare global {
    interface Window {
        kakao: any;
    }
}

export default function MapPage() {
    const [showCardModal, setShowCardModal] = useState(false)
    const [selectedStore, setSelectedStore] = useState<any>(null)
    const [radius, setRadius] = useState(500) // 기본 반경 500m
    const [showBenefitTooltip, setShowBenefitTooltip] = useState<number | null>(null)
    const [currentLocation, setCurrentLocation] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
    const [kakaoMapInstance, setKakaoMapInstance] = useState<any>(null); // 지도 인스턴스 저장
    const [currentPositionMarker, setCurrentPositionMarker] = useState<any>(null); // 현재 위치 마커 상태

    // 주변 매장 더미 데이터
    const nearbyStores = [
        {
            id: 1,
            name: "스타벅스 강남점",
            distance: 120,
            address: "서울시 강남구 테헤란로 123",
            bestCard: "신한카드 Deep Dream",
            discount: "30%",
            lat: 37.583,
            lng: 126.8838,
            hasEvent: true,
        },
        {
            id: 2,
            name: "올리브영 역삼점",
            distance: 230,
            address: "서울시 강남구 역삼로 45",
            bestCard: "현대카드 The Green",
            discount: "20%",
            lat: 37.584554,
            lng: 126.878736,
            hasEvent: false,
        },
        {
            id: 3,
            name: "CGV 강남",
            distance: 350,
            address: "서울시 강남구 역삼동 814-6",
            bestCard: "삼성카드 taptap O",
            discount: "최대 8천원",
            lat: 37.586412,
            lng: 126.878890,
            hasEvent: true,
        },
        {
            id: 4,
            name: "교보문고 강남점",
            distance: 450,
            address: "서울시 강남구 테헤란로 152",
            bestCard: "KB국민카드 가온",
            discount: "15%",
            lat: 37.504476,
            lng: 127.024761,
            hasEvent: false,
        },
        {
            id: 5,
            name: "버거킹 역삼점",
            distance: 480,
            address: "서울시 강남구 역삼동 735-22",
            bestCard: "우리카드 카드의정석",
            discount: "최대 5천원",
            lat: 37.583094,
            lng: 126.880392,
            hasEvent: true,
        },
    ]

    const handleStoreSelect = (store: any) => {
        setSelectedStore(store)
        setShowCardModal(true)
    }

    const handleMapClick = (storeId: number) => {
        setShowBenefitTooltip(storeId)
        setTimeout(() => {
            setShowBenefitTooltip(null)
        }, 3000)
    }

    useEffect(() => {
        // Geolocation API를 지원하는지 확인
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
        if (window.kakao && window.kakao.maps) {
            const container = document.getElementById("map");
            if (container) {
                const options = {
                    center: new window.kakao.maps.LatLng(lat, lng),
                    level: 3,
                };
                const map = new window.kakao.maps.Map(container, options);
                setKakaoMapInstance(map);

                const currentPosition = new window.kakao.maps.LatLng(lat, lng);

                // React 요소를 CustomOverlay의 content로 사용하기 위한 div 생성
                const overlayRoot = document.createElement('div');

                // React 요소
                const currentMarker = (
                    <div className="absolute left-1/2 top-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="p-2 rounded-full bg-blue-500 border-2 border-white shadow-md">
                            <div className="h-3 w-3 bg-white rounded-full"></div>
                        </div>
                    </div>
                );

                // React 18 이상에서는 createRoot를 사용합니다.
                const root = createRoot(overlayRoot);
                root.render(currentMarker);

                var customOverlay = new window.kakao.maps.CustomOverlay({
                    position: currentPosition,
                    content: overlayRoot, // 렌더링된 DOM 컨테이너를 content로 설정
                    map: map // CustomOverlay를 지도에 설정 (초기 생성 시)
                });

                // 필요하다면 CustomOverlay를 지도에 표시
                customOverlay.setMap(map);



                // 매장 마커 (CustomOverlay 사용)
                nearbyStores.forEach((store) => {
                    const storePosition = new window.kakao.maps.LatLng(store.lat, store.lng);
                    const storeOverlayRoot = document.createElement('div');
                    const storeMarkerContent = (
                        <div
                            className="flex flex-col items-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                            onClick={() => handleMapClick(store.id)}
                            onDoubleClick={() => handleStoreSelect(store)}
                        >
                            <div className="p-2 rounded-full bg-gradient-to-r from-[#75CB3B] to-[#00B959] shadow-md relative">
                                <MapPin className="h-5 w-5 text-white" />
                                {store.hasEvent && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
                                )}
                            </div>
                            <div className="mt-1 px-2 py-1 bg-white rounded-md shadow-sm text-xs max-w-[100px] text-center">
                                {store.name}
                            </div>
                        </div>
                    );
                    const storeRoot = createRoot(storeOverlayRoot);
                    storeRoot.render(storeMarkerContent);
                    const storeOverlay = new window.kakao.maps.CustomOverlay({
                        position: storePosition,
                        content: storeOverlayRoot,
                        map: map
                    });
                    storeOverlay.setMap(map);
                });


                console.log("카카오 지도 로드/재조정 완료:", lat, lng);
            } else {
                console.error("지도를 표시할 컨테이너('#map')를 찾을 수 없습니다.");
            }
        } else {
            console.error("Kakao Maps API가 로드되지 않았습니다.");
            setTimeout(() => loadKakaoMap(lat, lng), 500);
        }
    }, [currentPositionMarker, nearbyStores, handleMapClick, handleStoreSelect]); // 의존성 배열 업데이트


    // MapRefresh 버튼 클릭 핸들러
    const handleRefreshMap = () => {
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


    return (
        <main className="flex flex-col h-full max-w-[1170px] mx-auto overflow-auto font-gmarket">
            {/* 헤더 */}
            <MapHeader />

            {/* 카테고리 바 */}
            <CategoryBar />

            {/* 지도 부분 */}
            <div className="flex-1 relative bg-[#f2f2f2] overflow-hidden">
                {/* 반경 표시 */}
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-30 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-md text-sm font-medium text-[#00A949]">
                    반경 {radius}m
                </div>

                {/* 지도 배경 */}
                <div className="absolute inset-0 bg-[#e8f4f8]" onClick={() => setShowBenefitTooltip(null)}>
                    <div id="map" style={{ width: "100%", height: "100%" }} />
                </div>

                {/* 매장 마커 */}
                {/* {nearbyStores.map((store, index) => (
                    <div
                        key={store.id}
                        className="absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: `${20 + index * 15}%`,
                            top: `${30 + index * 10}%`,
                        }}
                        onClick={() => handleMapClick(store.id)}
                        onDoubleClick={() => handleStoreSelect(store)}
                    >
                        <div className="flex flex-col items-center">
                            <div className="p-2 rounded-full bg-gradient-to-r from-[#75CB3B] to-[#00B959] shadow-md relative">
                                <MapPin className="h-5 w-5 text-white" />
                                {store.hasEvent && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
                                )}
                            </div>
                            <div className="mt-1 px-2 py-1 bg-white rounded-md shadow-sm text-xs max-w-[100px] text-center">
                                {store.name}
                            </div>


                            {showBenefitTooltip === store.id && (
                                <Card className="absolute top-0 -mt-16 bg-white shadow-lg rounded-lg p-2 text-xs whitespace-nowrap max-w-[150px] border-none z-20">
                                    <div className="flex items-center gap-1 mb-1">
                                        <CreditCard className="h-3 w-3 text-[#00A949]" />
                                        <span className="font-bold text-[#5A3D2B]">{store.bestCard}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#5A3D2B]">{store.name}</span>
                                        <span className="font-bold text-[#00A949]">{store.discount}</span>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                ))} */}

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
        </main>
    )
}


