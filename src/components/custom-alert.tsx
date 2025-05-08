"use client"
import { Button } from "./ui/button"

interface CustomAlertProps {
    isOpen: boolean
    message: string
    onClose: () => void
}

export function CustomAlert({ isOpen, message, onClose }: CustomAlertProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="w-[80%] max-w-sm rounded-lg bg-white p-6 shadow-xl">
                <div className="mb-6 text-center text-base font-medium">{message}</div>
                <div className="flex justify-end">
                    <Button
                        onClick={onClose}
                        className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-6 py-2 rounded-md"
                    >
                        확인
                    </Button>
                </div>
            </div>
        </div>
    )
}
