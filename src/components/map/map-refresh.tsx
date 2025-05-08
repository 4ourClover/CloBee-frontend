import React, { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"
import { Button } from "../ui/button"

interface MapRefreshProps {
    onClick: () => void; // onClick prop 타입 정의
}


const MapRefresh: React.FC<MapRefreshProps> = ({ onClick }) => {
    return (
        <Button
            onClick={onClick}
            variant="secondary"
            size="icon"
            className="h-14 w-14 rounded-full shadow-md bg-white hover:bg-gray-100"
        >
            <MapPin className="h-5 w-5 text-[#00A949]" />
        </Button>
    )
}

export default MapRefresh
