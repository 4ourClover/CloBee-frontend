import React, { useContext } from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { createRoot } from "react-dom/client"
import CategoryBar from "../components/map/category-bar"
import BottomNavigation from "../components/bottom-navigation"
import MapHeader from "../components/map/map-header"
import MapRefresh from "../components/map/map-refresh"
import BottomSheet from "../components/map/bottom-sheet"
import {
    type Store,
    type StoreCategory,
    categoryConfig,
    type BenefitCard,
    type brandCategory,
    validBrands,
    type notificationStore,
} from "../types/store"
import SearchList from "../components/map/search-list"
import { useCurrentUser } from "../hooks/use-current-user"

import { getBenefitStores, getBenefitStoresBrand, getMapMyBenefits, getRecommendedCards } from "../api/map"
import { AuthContext } from "../contexts/AuthContext"

declare global {
    interface Window {
        kakao: any
    }
}

export default function MapPage() {
    const [selectedStore, setSelectedStore] = useState<Store | null>(null)
    const [currentLocation, setCurrentLocation] = useState<{ lat: number | null; lng: number | null }>({
        lat: null,
        lng: null,
    })
    const [showStoreInfo, setShowStoreInfo] = useState(false)
    const kakaoMapRef = useRef<any>(null) // 지도 인스턴스를 저장할 ref
    const currentMarkerRef = useRef<any>(null) // 현재 위치 마커를 저장할 ref

    const [selectedCategory, setSelectedCategory] = useState<StoreCategory | null>(null)
    const [selectedBrand, setSelectedBrand] = useState<brandCategory | null>(null)

    const [nearbyStores, setNearbyStores] = useState<Store[]>([])
    const nearbyStoresRef = useRef<Store[]>([])

    const [showSearchStoreList, setSearchStoreList] = useState(false) // 주변 매장 목록을 보여줄지 여부를 저장하는 ref
    const searchStoreList = useRef<Store[]>([]) // 주변 매장 목록을 저장하는 ref
    const [searchRadius, setSearchRadius] = useState(200) // 초기 검색 반경 (예: 1km)
    const [isNotificationOn, setIsNotificationOn] = useState(false) // 초기 알림 상태 (off)

    const mapInitializedRef = useRef(false)
    const benefitStoresRef = useRef<string[]>([])
    const benefitStoresBrandRef = useRef<Record<string, string[]>>({})

    const { userId } = useContext(AuthContext)

    const [benefitCards, setBenefitCards] = useState<BenefitCard[]>([])
    const [recommendedCards, setRecommendedCards] = useState<BenefitCard[]>([])

    // 알림 매장 상태 추가
    const [nearbyNotificationStores, setNearbyNotificationStores] = useState<notificationStore[]>([])

    useEffect(() => {
        nearbyStoresRef.current = nearbyStores

        if (userId != null) {
            fetchNotificationStore(userId)
        }
        // console.log("nearbyStoresRef 업데이트:", nearbyStoresRef.current);
        // console.log("nearbyStores 업데이트:", nearbyStores);
    }, [nearbyStores])

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
    })

    const brandMarkersRef = useRef<Record<brandCategory, Array<any>>>({
        신한카드: [],
        삼성카드: [],
        현대카드: [],
        KB국민카드: [],
        우리카드: [],
        "": [],
    })

    const fetchBenefitStores = useCallback(async () => {
        if (userId == null) return
        try {
            console.log("userid", userId)
            const data = await getBenefitStores(userId)
            benefitStoresRef.current = data

            if (Array.isArray(data) && data.length === 0) {
                console.warn("⚠️ 혜택 매장이 비어 있습니다 (빈 배열).")
            }
        } catch (error) {
            console.error("조회 실패:", error)
        }
    }, [userId])

    const fetchBenefitStoresBrand = useCallback(async () => {
        if (userId == null) return
        try {
            const data = await getBenefitStoresBrand(userId)
            benefitStoresBrandRef.current = data
            initializeMap()
        } catch (error) {
            console.error("조회 실패:", error)
        }
    }, [userId])

    // 혜택매장 데이터 먼저 로드
    useEffect(() => {
        // userId가 올 때까지 대기
        if (userId != null) {
            fetchBenefitStores()
            fetchBenefitStoresBrand()
        }
    }, [userId, fetchBenefitStores, fetchBenefitStoresBrand])

    useEffect(() => {
        if (selectedStore) {
            console.log("🟢 selectedStore 변경됨:", benefitCards)
            setShowStoreInfo(true)
        }
    }, [selectedStore, benefitCards, recommendedCards, userId])

    // 지도 클릭 핸들러
    const handleMapClick = async (storeId: number, benefitStoreName: string) => {
        console.log("지도 클릭:", typeof storeId, storeId)
        const store = nearbyStoresRef.current.find((s) => Number(s.id) == Number(storeId))
        console.log("선택된 매장:", store)
        if (store) {
            if (userId != null) {
                const data = await getMapMyBenefits(userId, benefitStoreName)
                setBenefitCards(data)
                const cards = await getRecommendedCards(benefitStoreName)
                setRecommendedCards(cards)
            }
            setSelectedStore(store)
        }
    }

    // 카테고리에 따른 아이콘 컴포넌트 반환
    const getCategoryIcon = (category: StoreCategory) => {
        const IconComponent = categoryConfig[category].icon
        return <IconComponent className="h-4 w-4" />
    }

    const initializeMap = useCallback(() => {
        if (mapInitializedRef.current) {
            console.log("🛑 Map은 이미 초기화됨, 중복 방지")
            return
        }
        mapInitializedRef.current = true

        console.log("맵 로딩")
        if (navigator.geolocation) {
            // 현재 위치 가져오기 시도
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // 성공 시: 위도, 경도 가져오기
                    const lat = position.coords.latitude
                    const lng = position.coords.longitude

                    setCurrentLocation({ lat, lng }) // 현재 위치 상태 업데이트

                    const container = document.getElementById("map")
                    if (!container) {
                        console.error("지도를 표시할 컨테이너('#map')를 찾을 수 없습니다.")
                        return
                    }

                    window.kakao.maps.load(() => {
                        //맵 생성
                        const options = {
                            center: new window.kakao.maps.LatLng(lat, lng),
                            level: 3,
                        }
                        const map = new window.kakao.maps.Map(container, options)

                        kakaoMapRef.current = map // 지도 인스턴스를 ref에 저장

                        loadKakaoMap(lat, lng) // 현재 위치로 지도 로드
                    })
                },
                (error) => {
                    // 실패 시: 에러 처리 및 기본 위치로 지도 로드
                    console.log("Geolocation 에러:", error)
                    alert("현재 위치를 가져올 수 없습니다. 기본 위치로 지도를 표시합니다.")
                    // 기본 좌표 (예: 카카오 본사)
                    const defaultLat = 33.450701
                    const defaultLng = 126.570667
                    setCurrentLocation({ lat: defaultLat, lng: defaultLng })
                    loadKakaoMap(defaultLat, defaultLng)
                },
                {
                    enableHighAccuracy: false, // 높은 정확도 요청 활성화
                    timeout: 30000, // 위치 정보를 가져오는 최대 허용 시간 (30초)
                    maximumAge: 0, // 캐시된 위치 정보 사용 안 함 (항상 최신 정보 요청)
                },
            )
        } else {
            // Geolocation API 미지원 시: 기본 위치로 지도 ��드
            console.error("브라우저가 Geolocation을 지원하지 않습니다.")
            alert("브라우저가 위치 정보 기능을 지원하지 않습니다. 기본 위치로 지도를 표시합니다.")
            const defaultLat = 33.450701
            const defaultLng = 126.570667
            setCurrentLocation({ lat: defaultLat, lng: defaultLng })
            loadKakaoMap(defaultLat, defaultLng)
        }
    }, []) // 컴포넌트 마운트 시 1회만 실행

    // 지도 로드 함수 (위도, 경도 받아서 처리)
    const loadKakaoMap = useCallback((lat: number, lng: number) => {
        // 현재 위치 마커
        const currentPosition = new window.kakao.maps.LatLng(lat, lng)
        const currentMarkerContent = (
            <div className="absolute left-1/2 top-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2">
                <div className="p-2 rounded-full bg-blue-500 border-2 border-white shadow-md">
                    <div className="h-3 w-3 bg-white rounded-full"></div>
                </div>
            </div>
        )
        const currentOverlayRoot = document.createElement("div")
        createRoot(currentOverlayRoot).render(currentMarkerContent)
        const currentOverlay = new window.kakao.maps.CustomOverlay({
            position: currentPosition,
            content: currentOverlayRoot,
        })
        currentOverlay.setMap(kakaoMapRef.current) // 지도에 마커 표시
        currentMarkerRef.current = currentOverlay // 현재 위치 마커 ref에 저장

        placesSearch(currentPosition) // 장소 검색 시작
    }, []) // 의존성 배열 업데이트

    const searchPlacesMenu = (keyword: string) => {
        // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
        const currentPosition = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng)
        console.log("currentPosition:", currentPosition)
        var ps = new window.kakao.maps.services.Places()
        ps.keywordSearch(
            keyword,
            (data: any, status: any, pagination: any) => {
                searchPlacesMenuCB(data, status, pagination, keyword)
            },
            { location: currentPosition, size: 5 },
        )
    }

    function searchPlacesMenuCB(data: any, status: any, pagination: any, keyword: string) {
        if (status === window.kakao.maps.services.Status.OK) {
            const newStores: Store[] = []

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
                    benefitStore: keyword,
                }

                newStores.push(store)
            })

            searchStoreList.current = newStores // 검색 결과 저장
            setSearchStoreList(true) // 검색 결과 목록 표시
            console.log("검색 결과:", searchStoreList.current)
        }
    }

    function selectSearchStore(storeId: number) {
        const store = searchStoreList.current.find((s) => s.id === storeId)
        if (store) {
            kakaoMapRef.current.setCenter(new window.kakao.maps.LatLng(store.lat, store.lng)) // 지도 중심 이동
            kakaoMapRef.current.setLevel(3) // 줌 레벨 조정
            setNearbyStores((prev) => [...prev, store])
            displayMarker(store) // 마커 표시
        }
    }

    // 주변 매장 검색
    const placesSearch = useCallback(
        async (currentPosition: any) => {
            const ps = new window.kakao.maps.services.Places()
            const searchPromises: Promise<{ data: any[]; bStore: string }>[] = [] // 각 검색 결과를 담을 Promise 배열
            const allNewStores: Store[] = [] // 모든 검색 결과에서 취합할 매장 배열

            // 현재 저장된 매장 ID를 빠르게 확인하기 위한 Set 생성
            const existingStoreIds = new Set(nearbyStoresRef.current.map((store) => store.id))

            benefitStoresRef.current.forEach((bStore) => {
                const searchPromise = new Promise<{ data: any[]; bStore: string }>((resolve) => {
                    ps.keywordSearch(
                        bStore,
                        (data: any, status: any, pagination: any) => {

                            if (status === window.kakao.maps.services.Status.OK) {
                                resolve({ data, bStore })
                            } else {
                                console.warn(`'${bStore}' 검색 오류:`, status)
                                resolve({ data: [], bStore }) // 빈 배열을 반환하여 Promise.all이 계속 진행되도록 함
                            }
                        },
                        {
                            location: currentPosition,
                            radius: 1000,
                            size: 5,
                        },
                    )
                })
                searchPromises.push(searchPromise)
            })

            try {
                const allResults = await Promise.all(searchPromises)
                const bounds = new window.kakao.maps.LatLngBounds()

                allResults.forEach((result) => {
                    const { data, bStore } = result

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
                            benefitStore: bStore,
                        }

                        if (!existingStoreIds.has(store.id)) {
                            //console.log("중복되지 않는 매장 (취합):", store);
                            allNewStores.push(store)
                            existingStoreIds.add(store.id)
                            displayMarker(store)
                            bounds.extend(new window.kakao.maps.LatLng(Number.parseFloat(item.y), Number.parseFloat(item.x)))
                        }
                    })
                })

                setNearbyStores((prev) => {
                    // 기존 매장과 새 매장을 합친 배열
                    const updatedStores = [...prev, ...allNewStores]

                    // 100개 초과 시 오래된 매장부터 제거
                    if (updatedStores.length > 100) {
                        // 가장 최근 100개만 유지
                        return updatedStores.slice(updatedStores.length - 100)
                    }

                    return updatedStores
                })

                if (kakaoMapRef.current && !bounds.isEmpty()) {
                    kakaoMapRef.current.setBounds(bounds)
                    console.log("카카오 지도 로드/재조정 완료 (placesSearch):", currentPosition)
                } else if (!kakaoMapRef.current) {
                    console.warn("❌ 지도 인스턴스가 준비되지 않았습니다.")
                } else {
                    console.warn("ℹ️ 검색된 신규 매장이 없어 bounds 적용 생략")
                }
            } catch (error) {
                console.log("장소 검색 중 오류 발생:", error)
            }
        },
        [benefitStoresRef, displayMarker, nearbyStoresRef],
    ) // benefitStore 또는 displayMarker가 변경되면 함수 재생성

    // 지도에 마커를 표시하는 함수입니다
    function displayMarker(place: Store) {
        const storeMarkerContent = (
            <div
                data-id={place.id}
                data-keyword={place.place_name.match(/^\S+/)?.[0] || ""}
                data-benefit-store={place.benefitStore}
                className="flex flex-col items-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                onClick={(e) => {
                    const el = e.currentTarget as HTMLElement
                    const id = Number(el.dataset.id)
                    const benefitStoreName = el.dataset.benefitStore ?? ""
                    handleMapClick(id, benefitStoreName)
                }}
            >
                <div
                    className="p-2 rounded-full shadow-md relative"
                    style={{
                        background: (categoryConfig[place.category_group_code] || categoryConfig[""]).color,
                    }}
                >
                    {React.createElement((categoryConfig[place.category_group_code] || categoryConfig[""]).icon, {
                        className: "h-5 w-5 text-white",
                    })}
                </div>
                <div
                    className="bg-transparent rounded-md text-xs max-w-[100px] text-center font-bold border border-transparent text-white"
                    style={{
                        WebkitTextStroke: "0.5px black",
                    }}
                >
                    {place.place_name}
                </div>
            </div>
        )

        const storeOverlayRoot = document.createElement("div")
        createRoot(storeOverlayRoot).render(storeMarkerContent)

        // 마커를 생성하고 지도에 표시합니다
        var marker = new window.kakao.maps.CustomOverlay({
            position: new window.kakao.maps.LatLng(place.lat, place.lng),
            content: storeOverlayRoot,
        })
        marker.setMap(kakaoMapRef.current) // 지도에 마커 표시

        if (categoryMarkersRef.current[place.category_group_code]) {
            categoryMarkersRef.current[place.category_group_code].push(marker)
        } else {
            categoryMarkersRef.current[""].push(marker)
        }

        //let matched = false;

        Object.entries(benefitStoresBrandRef.current).forEach(([brand, storeList]) => {
            if (storeList.includes(place.benefitStore)) {
                if (validBrands.includes(brand as brandCategory)) {
                    brandMarkersRef.current[brand as brandCategory].push(marker)
                } else {
                    console.warn(`⚠️ '${brand}'는 유효하지 않은 브랜드입니다. fallback 키("")에 마커 등록`)
                    brandMarkersRef.current[""].push(marker)
                }
                //matched = true;
            }
        })

        // if (!matched) {
        //     brandMarkersRef.current[""].push(marker); // 어떤 브랜드에도 속하지 않으면 fallback
        // }
    }

    function updateMarkersBySelection<T extends string>(
        ref: React.MutableRefObject<Record<T, any[]>>,
        selected: T | null,
        map: typeof window.kakao.maps.Map,
    ) {
        // 모든 마커 숨기기
        Object.values(ref.current).forEach((markerList: any) => markerList.forEach((marker: any) => marker.setMap(null)))

        // 선택된 키가 있으면 해당 마커만 보여주기, 없으면 모두 다시 표시
        if (selected) {
            ref.current[selected]?.forEach((marker) => marker.setMap(map))
        } else {
            Object.values(ref.current).forEach((markerList: any) => markerList.forEach((marker: any) => marker.setMap(map)))
        }
    }

    useEffect(() => {
        updateMarkersBySelection<StoreCategory>(categoryMarkersRef, selectedCategory, kakaoMapRef.current)
    }, [selectedCategory])

    useEffect(() => {
        updateMarkersBySelection<brandCategory>(brandMarkersRef, selectedBrand, kakaoMapRef.current)
    }, [selectedBrand])

    // MapRefresh 버튼 클릭 핸들러
    const handleRefreshMap = () => {
        if (!currentLocation) {
            console.error("현재 위치 정보가 없습니다.")
            return
        }
        const lat = currentLocation.lat
        const lng = currentLocation.lng
        const moveLatLon = new window.kakao.maps.LatLng(lat, lng)
        currentMarkerRef.current.setPosition(moveLatLon) // 현재 위치 마커 이동
        kakaoMapRef.current.setCenter(moveLatLon) // 지도 중심 이동
        kakaoMapRef.current.setLevel(5) // 줌 레벨 조정
    }

    useEffect(() => {
        console.log("알람 매장 세팅")
    }, [nearbyNotificationStores])

    const fetchNotificationStore = async (userId: number) => {
        const top5Stores = [...nearbyStores]
            .sort((a, b) => a.distance - b.distance) // 거리 오름차순 정렬
            .slice(0, 5)

        const benefitPromises = top5Stores.map(async (store) => {
            const cards = await getMapMyBenefits(userId, store.benefitStore)
            console.log(cards)
            const bestCard = cards[0] // 가장 혜택이 큰 카드
            if (!bestCard) return null

            // ✅ 수동 매핑
            const mapped: notificationStore = {
                id: bestCard.id,
                storeFullName: store.place_name,
                distance: store.distance,
                benefit_store: bestCard.benefit_store,
                discount: bestCard.discount,
                discountPrice: bestCard.discountPrice,
                description: bestCard.description,
                card_name: bestCard.card_name,
            }

            return mapped
        })

        try {
            const results = await Promise.all(benefitPromises)
            const validStores = results.filter((store): store is notificationStore => store !== null)

            setNearbyNotificationStores(validStores) // ✅ 상태를 한 번에 설정
        } catch (error) {
            console.error("❌ 혜택 카드 조회 실패:", error)
        }
    }

    const showAroundStore = () => {
        setSelectedBrand(null)
        setSelectedCategory(null)

        if (userId != null) {
            fetchNotificationStore(userId)
        }

        var center = kakaoMapRef.current.getCenter() // 현재 지도 중심 좌표
        placesSearch(center) // 장소 검색 시작
    }

    return (
        <main className="flex flex-col h-full w-full mx-auto overflow-auto font-gmarket">
            {/* 헤더 */}
            <MapHeader
                searchRadius={searchRadius}
                setSearchRadius={setSearchRadius}
                isNotificationOn={isNotificationOn}
                setIsNotificationOn={setIsNotificationOn}
                selectedBrand={selectedBrand}
                onBrandSelect={(brand: brandCategory) => setSelectedBrand((prev) => (prev === brand ? null : brand))}
                onSearch={searchPlacesMenu}
                nearbyNotificationStores={nearbyNotificationStores} // 추가된 prop
            />

            {/* 카테고리 바 */}
            <CategoryBar
                selectedCategory={selectedCategory}
                onCategorySelect={(category) => setSelectedCategory((prev) => (prev === category ? null : category))}
            />

            {/* 지도 부분 */}
            <div className="flex-1 relative bg-[#f2f2f2] overflow-hidden">
                {/* 현지도에서 검색 */}
                <div
                    className="absolute top-14 left-1/2 transform -translate-x-1/2 z-30 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-md text-sm font-medium text-[#00A949]"
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
            <BottomNavigation floatingActionButton={<MapRefresh onClick={handleRefreshMap} />} />

            {/* 바텀 시트 */}
            <BottomSheet
                showStoreInfo={showStoreInfo}
                setShowStoreInfo={setShowStoreInfo}
                selectedStore={selectedStore}
                benefitCards={benefitCards}
                recommendedCards={recommendedCards}
                getCategoryIcon={getCategoryIcon} //아이콘
            />

            {/* 검색 매장 목록 */}
            {showSearchStoreList && (
                <SearchList
                    searchStores={searchStoreList.current}
                    setShowStoreList={setSearchStoreList}
                    onSearchStoreSelect={(storeId) => {
                        selectSearchStore(storeId) // 매장 선택 시 호출되는 함수
                    }}
                />
            )}
        </main>
    )
}