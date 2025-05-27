import { Link, useLocation } from "react-router-dom"
import { Button } from "../components/ui/button"
import { MapPin, CreditCard, Calendar, User } from "lucide-react"
import { ReactNode } from "react";

interface BottomNavigationProps {
    floatingActionButton?: ReactNode;
}

export default function BottomNavigation({ floatingActionButton }: BottomNavigationProps) {
    const location = useLocation();
    const currentPath = location.pathname;
    const isActive = [
        "/event",
        "/event/attendance",
        "/event/invite",
        "/event/clover",
        "/event/coupon",
    ].includes(currentPath);

    return (
        <div className="bg-white border-t py-1.5 px-4 flex justify-around items-center relative">
            {floatingActionButton && (
                <div className="absolute -top-16 right-4 z-30">
                    {floatingActionButton}
                </div>
            )}

            <Link to="/map">
                <Button variant="ghost" className={`flex flex-col items-center h-auto py-1 rounded-full ${currentPath === "/map" ? "text-[#00A949]" : ""}`}>
                    <MapPin className="h-6 w-6" />
                    <span className="text-[10px] mt-0.5">지도</span>
                </Button>
            </Link>
            <Link to="/card">
                <Button variant="ghost" className={`flex flex-col items-center h-auto py-1 rounded-full ${currentPath === "/card" ? "text-[#00A949]" : ""}`}>
                    <CreditCard className="h-6 w-6" />
                    <span className="text-[10px] mt-0.5">내 카드</span>
                </Button>
            </Link>
            <Link to="/event">
                <Button variant="ghost" className={`flex flex-col items-center h-auto py-1 rounded-full ${isActive ? "text-[#00A949]" : ""}`}>
                    <Calendar className="h-6 w-6" />
                    <span className="text-[10px] mt-0.5">이벤트</span>
                </Button>
            </Link>
            <Link to="/profile">
                <Button variant="ghost" className={`flex flex-col items-center h-auto py-1 rounded-full ${currentPath === "/profile" ? "text-[#00A949]" : ""}`}>
                    <User className="h-6 w-6" />
                    <span className="text-[10px] mt-0.5">내 정보</span>
                </Button>
            </Link>
        </div>
    )
}