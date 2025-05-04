import React from 'react';
import { useState, useEffect, useCallback, useRef } from "react"
import { createRoot } from 'react-dom/client';
import CardBenefitModal from "../components/card-benefit-modal"
import CategoryBar from "../components/map/category-bar"
import BottomNavigation from "../components/bottom-navigation"
import MapHeader from "../components/map/map-header"
import MapRefresh from "../components/map/map-refresh"
//import BottomSheet from "../components/map/bottom-sheet"
import { Store, StoreCategory, categoryConfig, categoryNames } from '../types/store';
import { Content } from '@radix-ui/react-tabs';

declare global {
    interface Window {
        kakao: any;
    }
}

export default function MapPage() {
    const [showCardModal, setShowCardModal] = useState(false)
    const [selectedStore, setSelectedStore] = useState<Store | null>(null)
    const [currentLocation, setCurrentLocation] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
    const [showStoreInfo, setShowStoreInfo] = useState(false)
    const kakaoMapRef = useRef<any>(null); // 지도 인스턴스를 저장할 ref
    const [nearbyStores, setNearbyStores] = useState<Store[]>([]);
    const nextStoreIdRef = useRef(1);
    const [selectedCategory, setSelectedCategory] = useState<StoreCategory | null>(null);

    // 카테고리별로 마커를 저장하는 객체
    const categoryMarkersRef = useRef<Record<StoreCategory, Array<any>>>({
        FD6: [],
        CE7: [],
        SW8: [],
        OL7: [],
        MT1: [],
        CT1: [],
        CS2: [],
        "": [],
    });


    // 더미 데이터: 주변 매장
    // const nearbyStores: Store[] = [
    //     {
    //         id: 1,
    //         name: "스타벅스 강남점",
    //         distance: 120,
    //         address: "서울시 강남구 테헤란로 123",
    //         bestCard: "신한카드",
    //         discount: "30%",
    //         lat: 36.510046,
    //         lng: 128.300269,
    //         hasEvent: true,
    //         category: "cafe",
    //         image: "/placeholder.svg?height=80&width=80",
    //         likes: 42,
    //         dislikes: 3,
    //     },
    //     {
    //         id: 2,
    //         name: "올리브영 역삼점",
    //         distance: 230,
    //         address: "서울시 강남구 역삼로 45",
    //         bestCard: "현대카드",
    //         discount: "20%",
    //         lat: 36.509751,
    //         lng: 128.300033,
    //         hasEvent: false,
    //         category: "shopping",
    //         image: "/placeholder.svg?height=80&width=80",
    //         likes: 28,
    //         dislikes: 5,
    //     },
    // ]


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
        kakaoMapRef.current = map; // 지도 인스턴스를 ref에 저장

        // 현재 위치 마커
        const currentPosition = new window.kakao.maps.LatLng(lat, lng);
        const currentMarkerContent =
            <div className="absolute left-1/2 top-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2">
                <div className="p-2 rounded-full bg-blue-500 border-2 border-white shadow-md">
                    <div className="h-3 w-3 bg-white rounded-full"></div>
                </div>
            </div>
        const currentOverlayRoot = document.createElement('div');
        createRoot(currentOverlayRoot).render(currentMarkerContent);
        const currentOverlay = new window.kakao.maps.CustomOverlay({
            position: currentPosition,
            content: currentOverlayRoot,
            map: map,
        });

        // 장소 검색 객체를 생성합니다
        var ps = new window.kakao.maps.services.Places();

        // 키워드로 장소를 검색합니다
        ps.keywordSearch('음식점', placesSearchCB, { location: currentPosition });

        console.log("카카오 지도 로드/재조정 완료:", lat, lng);

    }, [nearbyStores, handleMapClick, handleStoreSelect]); // 의존성 배열 업데이트

    // 키워드 검색 완료 시 호출되는 콜백함수 입니다
    function placesSearchCB(data: any, status: any, pagination: any) {
        if (status === window.kakao.maps.services.Status.OK) {
            console.log("장소 검색 완료:", data);

            var bounds = new window.kakao.maps.LatLngBounds();

            const storesToAdd: Store[] = [];

            for (let i = 0; i < data.length; i++) {
                const item = data[i];

                const store: Store = {
                    id: Number(nextStoreIdRef.current++), // ✅ 문자열 ID 자동 증가
                    place_name: item.place_name,
                    address_name: item.address_name,
                    road_address_name: item.road_address_name,
                    phone: item.phone,
                    place_url: item.place_url,
                    category_name: item.category_name,
                    category_group_code: item.category_group_code || "",
                    category_group_name: item.category_group_name,
                    distance: item.distance,
                    lng: item.x,
                    lat: item.y,
                };

                storesToAdd.push(store);

                displayMarker(store);
                bounds.extend(new window.kakao.maps.LatLng(parseFloat(item.y), parseFloat(item.x)));
            }

            setNearbyStores((prev) => [...prev, ...storesToAdd]);
            kakaoMapRef.current.setBounds(bounds);
        }
    }

    // 지도에 마커를 표시하는 함수입니다
    function displayMarker(place: Store) {
        console.log("마커 표시:", place);
        const storeMarkerContent = (
            <div
                className="flex flex-col items-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                onClick={() => handleMapClick(place.id)}
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
                <div
                    className="p-2 rounded-full shadow-md relative"
                    style={{
                        background: categoryConfig[place.category_group_code].color,
                    }}
                >
                    {React.createElement(categoryConfig[place.category_group_code].icon, { className: "h-5 w-5 text-white" })}
                </div>
                <div className="bg-transparent rounded-md text-xs max-w-[100px] text-center font-bold border border-transparent">
                    {place.place_name}
                </div>
            </div>
        );

        const storeOverlayRoot = document.createElement('div');
        createRoot(storeOverlayRoot).render(storeMarkerContent);


        // 마커를 생성하고 지도에 표시합니다
        var marker = new window.kakao.maps.CustomOverlay({
            position: new window.kakao.maps.LatLng(place.lat, place.lng),
            content: storeOverlayRoot,
        });
        marker.setMap(kakaoMapRef.current); // 지도에 마커 표시

        if (categoryMarkersRef.current[place.category_group_code]) {
            categoryMarkersRef.current[place.category_group_code].push(marker);
        }
    }

    function showCategoryMarkers(category: StoreCategory, map: typeof window.kakao.maps.Map) {
        console.log("카테고리 마커 표시:", category);
        categoryMarkersRef.current[category].forEach((marker) => marker.setMap(map));
        console.log("카테고리 완료");
    }

    function hideAllMarkers() {
        console.log("모든 마커 숨기기");
        Object.values(categoryMarkersRef.current).forEach((markerList) => {
            console.log("지워줘");
            markerList.forEach((marker) => marker.setMap(null));
        });
    }

    useEffect(() => {
        console.log(categoryMarkersRef.current);
        if (selectedCategory) {
            console.log("카테고리 변경:");
            hideAllMarkers();
            showCategoryMarkers(selectedCategory, kakaoMapRef.current);
        } else {
            console.log("모든 카테고리 표시");
            Object.keys(categoryMarkersRef.current).forEach((category) => {
                categoryMarkersRef.current[category as StoreCategory].forEach((marker) => marker.setMap(kakaoMapRef.current));
            });
        }
    }, [selectedCategory]);

    // MapRefresh 버튼 클릭 핸들러
    const handleRefreshMap = () => {
        console.log("맵 새로고침 클릭");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setCurrentLocation({ lat, lng });
                    const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
                    kakaoMapRef.current.setCenter(moveLatLon); // 지도 중심 이동
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
    console.log(selectedCategory);

    return (
        <main className="flex flex-col h-full w-full mx-auto overflow-auto font-gmarket">
            {/* 헤더 */}
            <MapHeader />

            {/* 카테고리 바 */}
            <CategoryBar
                onCategorySelect={(category) =>
                    setSelectedCategory(prev => (prev === category ? null : category))
                }
            />

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
            {/* {showCardModal && selectedStore && (
                <CardBenefitModal store={selectedStore} onClose={() => setShowCardModal(false)} />
            )} */}

            {/* 바텀 시트 */}
            {/* <BottomSheet
                showStoreInfo={showStoreInfo}
                setShowStoreInfo={setShowStoreInfo}
                selectedStore={selectedStore}
                handleStoreSelect={handleStoreSelect}
                categoryConfig={categoryConfig}
                categoryNames={categoryNames}
                getCategoryIcon={getCategoryIcon}
            /> */}
        </main>
    )
}


