import React from 'react';
import { useState, useEffect, useCallback, useRef } from "react"
import { createRoot } from 'react-dom/client';
import CategoryBar from "../components/map/category-bar"
import BottomNavigation from "../components/bottom-navigation"
import MapHeader from "../components/map/map-header"
import MapRefresh from "../components/map/map-refresh"
import BottomSheet from "../components/map/bottom-sheet"
import { Store, StoreCategory, categoryConfig, BenefitCard, brandCategory } from '../types/store';
import SearchList from '../components/map/search-list';

declare global {
    interface Window {
        kakao: any;
    }
}

export default function MapPage() {
    const [selectedStore, setSelectedStore] = useState<Store | null>(null)
    const [currentLocation, setCurrentLocation] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
    const [showStoreInfo, setShowStoreInfo] = useState(false)
    const kakaoMapRef = useRef<any>(null); // 지도 인스턴스를 저장할 ref
    const currentMarkerRef = useRef<any>(null); // 현재 위치 마커를 저장할 ref
    const [nearbyStores, setNearbyStores] = useState<Store[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<StoreCategory | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<brandCategory | null>(null);
    const nearbyStoresRef = useRef<Store[]>([]);
    const [showSearchStoreList, setSearchStoreList] = useState(false) // 주변 매장 목록을 보여줄지 여부를 저장하는 ref
    const searchStoreList = useRef<Store[]>([]); // 주변 매장 목록을 저장하는 ref

    useEffect(() => {
        nearbyStoresRef.current = nearbyStores;
        // console.log("nearbyStoresRef 업데이트:", nearbyStoresRef.current);
        // console.log("nearbyStores 업데이트:", nearbyStores);
    }, [nearbyStores]);


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

    const brandMarkersRef = useRef<Record<brandCategory, Array<any>>>({
        신한카드: [],
        삼성카드: [],
        현대카드: [],
        KB국민카드: [],
        우리카드: [],
        "": [],
    });


    const benefitStore = ["스타벅스", "이마트", "GS25"]

    const starbucksBenefitCards: BenefitCard[] = [
        {
            id: 1,
            card_name: "신한카드",
            card_brand: "신한카드",
            benefit_store: "스타벅스",
            discount: "30%",
            max_discount: "10,000원",
            image: "/placeholder.svg?height=200&width=320",
        },
        {
            id: 2,
            card_name: "삼성카드 taptap O",
            card_brand: "삼성카드",
            benefit_store: "이마트",
            discount: "25%",
            max_discount: "10,000원",
            image: "/placeholder.svg?height=200&width=320",
        },
        {
            id: 3,
            card_name: "신한카드 Deep Dream",
            card_brand: "신한카드",
            benefit_store: "GS25",
            discount: "20%",
            max_discount: "5,000원",
            image: "/placeholder.svg?height=200&width=320",
        },
        {
            id: 4,
            card_name: "현대카드 The Green",
            card_brand: "현대카드",
            benefit_store: "스타벅스",
            discount: "15%",
            max_discount: "3,000원",
            image: "/placeholder.svg?height=200&width=320",
        },
    ]


    // 지도 클릭 핸들러
    const handleMapClick = (storeId: number) => {
        console.log("지도 클릭:", typeof storeId, storeId);
        const store = nearbyStoresRef.current.find((s) => Number(s.id) == Number(storeId))
        console.log("선택된 매장:", store);
        if (store) {
            setSelectedStore(store)

            // 바텀 시트 표시
            setShowStoreInfo(true)
            console.log("바텀 시트 열기:", store.place_name);
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
        if (!window.kakao?.maps) {
            console.error("Kakao Maps API가 로드되지 않았습니다.");
            setTimeout(() => loadKakaoMap(lat, lng), 500);
            return;
        }

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
        });
        currentOverlay.setMap(kakaoMapRef.current); // 지도에 마커 표시
        currentMarkerRef.current = currentOverlay; // 현재 위치 마커 ref에 저장


        placesSearch(currentPosition); // 장소 검색 시작

    }, []); // 의존성 배열 업데이트

    const searchPlacesMenu = (keyword: string) => {
        console.log("검색어:", keyword);

        // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
        const currentPosition = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
        console.log("currentPosition:", currentPosition);
        var ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(keyword, searchPlacesMenuCB, { location: currentPosition, size: 5 });
    }

    function searchPlacesMenuCB(data: any, status: any, pagination: any) {
        if (status === window.kakao.maps.services.Status.OK) {
            const bounds = new window.kakao.maps.LatLngBounds();

            const newStores: Store[] = [];

            data.forEach((item: any) => {
                const store: Store = {
                    id: item.id,
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

                newStores.push(store);
            });

            searchStoreList.current = newStores; // 검색 결과 저장
            setSearchStoreList(true); // 검색 결과 목록 표시
            console.log("검색 결과:", searchStoreList.current);
        }
    }

    function selectSearchStore(storeId: number) {
        const store = searchStoreList.current.find((s) => s.id === storeId);
        if (store) {
            console.log("선택된 매장:", store);

            kakaoMapRef.current.setCenter(new window.kakao.maps.LatLng(store.lat, store.lng)); // 지도 중심 이동
            kakaoMapRef.current.setLevel(3); // 줌 레벨 조정
            setNearbyStores((prev) => [...prev, store]);
            displayMarker(store); // 마커 표시
        }
    }


    const placesSearch = useCallback(async (currentPosition: any) => {
        const ps = new window.kakao.maps.services.Places();
        const searchPromises: Promise<any[]>[] = []; // 각 검색 결과를 담을 Promise 배열
        const allNewStores: Store[] = []; // 모든 검색 결과에서 취합할 매장 배열
        const addedStoreIds = new Set<number>(); // 중복 방지를 위한 Set

        benefitStore.forEach((bStore) => {
            const searchPromise = new Promise<any[]>((resolve, reject) => {
                ps.keywordSearch(bStore, (data: any, status: any, pagination: any) => {
                    if (status === window.kakao.maps.services.Status.OK) {
                        resolve(data);
                    } else {
                        console.error(`'${bStore}' 검색 오류:`, status);
                        reject(status);
                    }
                }, { location: currentPosition, size: 5 });
            });
            searchPromises.push(searchPromise);
        });

        try {
            const allResults = await Promise.all(searchPromises);
            const bounds = new window.kakao.maps.LatLngBounds();

            allResults.forEach(data => {
                data.forEach((item: any) => {
                    const store: Store = {
                        id: item.id,
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

                    if (!addedStoreIds.has(store.id)) {
                        //console.log("중복되지 않는 매장 (취합):", store);
                        allNewStores.push(store);
                        addedStoreIds.add(store.id);
                        displayMarker(store);
                        bounds.extend(new window.kakao.maps.LatLng(parseFloat(item.y), parseFloat(item.x)));
                    }
                });
            });

            setNearbyStores((prev) => [...prev, ...allNewStores]);
            //console.log("최종 주변 매장:", allNewStores);
            // console.log("최종 bounds:", bounds);

            if (kakaoMapRef.current) {
                kakaoMapRef.current.setBounds(bounds);
            } else {
                console.warn("지도 인스턴스가 준비되지 않았습니다 (최종 bounds 설정 시).");
            }
            console.log("카카오 지도 로드/재조정 완료 (placesSearch):", currentPosition);

        } catch (error) {
            console.error("장소 검색 중 오류 발생:", error);
        }
    }, [benefitStore, displayMarker]); // benefitStore 또는 displayMarker가 변경되면 함수 재생성


    // 지도에 마커를 표시하는 함수입니다
    function displayMarker(place: Store) {
        const storeMarkerContent = (
            <div
                data-id={place.id}
                data-keyword={place.place_name.match(/^\S+/)?.[0] || ""}
                className="flex flex-col items-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                onClick={(e) => {
                    const id = Number((e.currentTarget as HTMLElement).dataset.id);
                    handleMapClick(id);
                }}
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
                {/* <div className="bg-transparent rounded-md text-xs max-w-[100px] text-center font-bold border border-transparent"> */}
                <div
                    className="bg-transparent rounded-md text-xs max-w-[100px] text-center font-bold border border-transparent text-white"
                    style={{
                        WebkitTextStroke: '0.5px black',
                    }}
                >
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

        const keyword = place.place_name.match(/^\S+/)?.[0];

        starbucksBenefitCards.forEach((card) => {

            if (card.benefit_store === keyword) {
                //console.log("카드 마커 추가:", card.benefit_store, keyword);
                brandMarkersRef.current[card.card_brand].push(marker); // 카드 마커 추가
            } else {
                brandMarkersRef.current[""].push(marker);
            }
            //console.log("카드 마커 추가:", brandMarkersRef.current);
        });

    }


    function updateMarkersBySelection<T extends string>(
        ref: React.MutableRefObject<Record<T, any[]>>,
        selected: T | null,
        map: typeof window.kakao.maps.Map
    ) {
        // 모든 마커 숨기기
        Object.values(ref.current).forEach((markerList: any) =>
            markerList.forEach((marker: any) => marker.setMap(null))
        );

        // 선택된 키가 있으면 해당 마커만 보여주기, 없으면 모두 다시 표시
        if (selected) {
            ref.current[selected]?.forEach((marker) => marker.setMap(map));
        } else {
            Object.values(ref.current).forEach((markerList: any) =>
                markerList.forEach((marker: any) => marker.setMap(map))
            );
        }
    }

    useEffect(() => {
        console.log("selectedCategory", selectedCategory);
        updateMarkersBySelection<StoreCategory>(categoryMarkersRef, selectedCategory, kakaoMapRef.current);
    }, [selectedCategory]);

    useEffect(() => {
        console.log("selectedBrand", selectedBrand);
        updateMarkersBySelection<brandCategory>(brandMarkersRef, selectedBrand, kakaoMapRef.current);
    }, [selectedBrand]);



    // MapRefresh 버튼 클릭 핸들러
    const handleRefreshMap = () => {
        if (!currentLocation) {
            console.error("현재 위치 정보가 없습니다.");
            return;
        }
        const lat = currentLocation.lat;
        const lng = currentLocation.lng;
        const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
        currentMarkerRef.current.setPosition(moveLatLon); // 현재 위치 마커 이동
        kakaoMapRef.current.setCenter(moveLatLon); // 지도 중심 이동
        kakaoMapRef.current.setLevel(5); // 줌 레벨 조정
    };

    const showAroundStore = () => {
        console.log("주변 매장 검색 시작");

        setSelectedBrand(null);
        setSelectedCategory(null);
        var center = kakaoMapRef.current.getCenter(); // 현재 지도 중심 좌표
        placesSearch(center); // 장소 검색 시작
    }

    return (
        <main className="flex flex-col h-full w-full mx-auto overflow-auto font-gmarket">
            {/* 헤더 */}
            <MapHeader
                selectedBrand={selectedBrand}
                onBrandSelect={(brand: brandCategory) =>
                    setSelectedBrand(prev => (prev === brand ? null : brand))
                }
                onSearch={searchPlacesMenu}
            />

            {/* 카테고리 바 */}
            <CategoryBar
                selectedCategory={selectedCategory}
                onCategorySelect={(category) =>
                    setSelectedCategory(prev => (prev === category ? null : category))
                }
            />

            {/* 지도 부분 */}
            <div className="flex-1 relative bg-[#f2f2f2] overflow-hidden">
                {/* 현지도에서 검색 */}
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-30 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-md text-sm font-medium text-[#00A949]"
                    onClick={showAroundStore}
                >
                    ↻ 현 지도에서 검색
                </div>

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

            {/* 바텀 시트 */}
            <BottomSheet
                showStoreInfo={showStoreInfo}
                setShowStoreInfo={setShowStoreInfo}
                selectedStore={selectedStore}
                benefitCards={starbucksBenefitCards}
                recommendedCards={starbucksBenefitCards}
                getCategoryIcon={getCategoryIcon} //아이콘
            />

            {/* 검색 매장 목록 */}
            {showSearchStoreList && (
                <SearchList
                    searchStores={searchStoreList.current}
                    setShowStoreList={setSearchStoreList}
                    onSearchStoreSelect={(storeId) => {
                        selectSearchStore(storeId); // 매장 선택 시 호출되는 함수
                        // 여기서 setSelectedStore 등 원하는 작업 수행
                    }}
                />
            )}
        </main>
    )
}


