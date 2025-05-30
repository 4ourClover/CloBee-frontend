import { useEffect, useState } from "react"
import { Switch } from "../../components/ui/switch"
import { Button } from "../../components/ui/button"
import { useNavigate } from "react-router-dom"
import {
    ChevronLeft,
    Gift,
    Clover,
    Check,
    ChevronRight,
    Bell,
    Ticket,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs"
import { Badge } from "../../components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import BottomNavigation from "../../components/bottom-navigation"
import { CardEvent, UserDetail } from "@/types/event";

import { useCurrentUser } from "../../hooks/use-current-user";
import { getCardEvents } from "../../api/event";

export default function EventsPage() {
    const [activeTab, setActiveTab] = useState("app")
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const user = useCurrentUser();
    const userId: number = user?.userId ?? 0;

    // 더미 데이터: 앱 이벤트
    const appEvents = [
        {
            id: 1,
            title: "출석체크 이벤트",
            description: "매일 출석체크하고 포인트 받기",
            icon: <Check className="h-6 w-6 text-white" />,
            iconBg: "bg-blue-500",
            link: "/event/attendance",
        },
        {
            id: 2,
            title: "친구초대 이벤트",
            description: "친구에게 선물상자 보내기",
            icon: <Gift className="h-6 w-6 text-white" />,
            iconBg: "bg-purple-500",
            link: "/event/invite",
        },
        {
            id: 3,
            title: "클로버 찾기 이벤트",
            description: "행운의 클로버를 찾아보세요",
            icon: <Clover className="h-6 w-6 text-white" />,
            iconBg: "bg-green-500",
            link: "/event/clover",
        },
        {
            id: 4,
            title: "쿠폰 받기 이벤트",
            description: "매장 방문하고 클로버 모으기",
            icon: <Ticket className="h-6 w-6 text-white" />,
            iconBg: "bg-orange-500",
            link: "/event/coupon",
        },
    ]

    const [cardEvents, setCardEvents] = useState<CardEvent[]>([]);

    // 주변 이벤트 매장 데이터 (예시)
    const nearbyEventStores = [
        {
            id: 1,
            name: "스타벅스 강남점",
            distance: 30,
            eventType: "카드 할인",
        },
        {
            id: 2,
            name: "CGV 강남",
            distance: 45,
            eventType: "1+1 이벤트",
        },
    ]

    const [isFetching, setIsFetching] = useState(false);

    const fetchCardEvents = async () => {
        if (isFetching) return; // 중복 방지
        setIsFetching(true);
        try {
            const userDetail: UserDetail = {
                userId: userId
            };
            const pageSize = 6;
            const response = await getCardEvents(userDetail, pageSize, page);
            const data: CardEvent[] = response.data;

            const newData: CardEvent[] = data.map((event) => ({
                eventInfoId: event.eventInfoId,
                eventTitle: event.eventTitle,
                eventDesc: event.eventDesc,
                eventCardUrl: event.eventCardUrl,
                eventCardtype: event.eventCardtype,
                haveCard: event.haveCard,
                eventStartDay: event.eventStartDay,
                eventEndDay: event.eventEndDay
            }));
            // console.log(newData)

            setCardEvents(prevData => [...prevData, ...newData]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsFetching(false);
        }
    }

    useEffect(() => {
        fetchCardEvents();
    }, [page]);

    useEffect(() => {
        if (activeTab !== "card") return;

        const el = document.getElementById("card-events-scroll");
        if (!el) return;

        const handleScroll = () => {
            const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;

            if (nearBottom) {
                setPage(prev => prev + 1);
            }
        };

        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, [activeTab]);

    return (
        <main className="flex flex-col h-full w-full mx-auto overflow-hidden font-gmarket">
            {/* 헤더 */}
            <header className="bg-gradient-to-r from-[#75CB3B] to-[#00B959] text-white p-1.5 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-6 w-6" onClick={() => navigate(-1)}>
                    <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <h1 className="text-base font-bold flex-1">이벤트</h1>

                {/* 주변 매장 알림 */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-6 w-6 relative">
                            <Bell className="h-3.5 w-3.5" />
                            {nearbyEventStores.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center">
                                    {nearbyEventStores.length}
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="end">
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-[#5A3D2B]">주변 50m 이벤트 알림</h3>
                            {nearbyEventStores.length > 0 ? (
                                <div className="max-h-40 overflow-auto space-y-2">
                                    {nearbyEventStores.map((store) => (
                                        <div key={store.id} className="text-xs p-2 bg-gray-50 rounded-md">
                                            <div className="font-medium">{store.name}</div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-gray-500">{store.distance}m</span>
                                                <Badge className="text-[8px] py-0 px-1.5 bg-[#75CB3B]/20 text-[#00A949] border-none">
                                                    {store.eventType}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500">주변 50m 내 이벤트가 없습니다.</p>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </header>

            {/* 탭 선택 */}
            <Tabs defaultValue="app" className="w-full flex-1 flex flex-col overflow-auto min-h-0" onValueChange={setActiveTab}>
                <div className="bg-transparent border-b border-[#00A949]/20">
                    <TabsList className="w-full grid grid-cols-2 bg-transparent">
                        <TabsTrigger
                            value="app"
                            className="data-[state=active]:bg-transparent data-[state=active]:text-[#00A949] data-[state=active]:border-b-2 data-[state=active]:border-[#00A949] rounded-none"
                        >
                            앱 이벤트
                        </TabsTrigger>
                        <TabsTrigger
                            value="card"
                            className="data-[state=active]:bg-transparent data-[state=active]:text-[#00A949] data-[state=active]:border-b-2 data-[state=active]:border-[#00A949] rounded-none"
                        >
                            카드사 이벤트
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* 앱 이벤트 콘텐츠 */}
                <TabsContent value="app" className="flex-1 overflow-auto p-0 m-0 data-[state=inactive]:hidden">
                    <div className="bg-[#F5FAF0] min-h-full p-4">
                        <div className="grid grid-cols-1 gap-4">
                            {appEvents.map((event, index) => (
                                <Link to={event.link} key={event.id}>
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="flex items-center p-4">
                                            <div
                                                className={`w-12 h-12 rounded-full ${event.iconBg} flex items-center justify-center flex-shrink-0 mr-4`}
                                            >
                                                {event.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-[#5A3D2B]">{event.title}</h3>
                                                <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </div>
                                        {index < appEvents.length - 1 && <div className="border-t border-gray-100"></div>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                {/* 카드사 이벤트 콘텐츠 */}
                <TabsContent value="card" className="flex-1 overflow-hidden p-0 m-0 data-[state=inactive]:hidden">
                    <div id="card-events-scroll" className="bg-[#F5FAF0] flex flex-col h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b bg-white">
                            <div className="flex justify-between items-center">
                                <h2 className="font-bold text-[#5A3D2B]">전체</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">참여중 광고</span>
                                    <Switch id="ad-toggle" />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 space-y-4 flex-1">
                            {cardEvents.map((event) => (
                                <div key={event.eventInfoId} className={`relative bg-white rounded-lg overflow-hidden shadow-sm ${event.haveCard ? 'border border-amber-400' : 'border'
                                    }`}
                                    onClick={() => { window.location.href = `${event.eventCardUrl}` }}>
                                    {/* <div className="relative h-40">
                                        <img src={event.eventImage || "/placeholder.svg"} alt={event.eventTitle} className="w-full h-full object-cover" />
                                    </div> */}
                                    {event.haveCard && (
                                        <div className="absolute top-2 right-2">
                                            <Badge className="bg-amber-400 hover:bg-amber-400 text-amber-900 border-none font-medium">
                                                내 카드 혜택
                                            </Badge>
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center mb-3">
                                                <span className="text-sm text-gray-500">{event.eventCardtype}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-[#5A3D2B]">{event.eventTitle}</h3>
                                                <p className="text-sm text-gray-500 mt-1">{event.eventDesc}</p>
                                            </div>
                                            {/* <Badge className="bg-[#75CB3B]/20 text-[#00A949] border-none">{event.event}</Badge> */}
                                        </div>
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-500">{event.eventStartDay} ~ {event.eventEndDay}</span>
                                                {/* <span className="text-[#00A949] font-medium ml-1">쿠키 {event.cookies}개</span> */}
                                            </div>
                                            {/* <Button className="bg-[#4CD964] hover:bg-[#3BC953] text-white border-none">쿠키받기</Button> */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </TabsContent>
            </Tabs>

            {/* 하단 내비게이션 - 앱 이벤트 탭에만 표시 */}
            <BottomNavigation />

        </main>
    )
}
