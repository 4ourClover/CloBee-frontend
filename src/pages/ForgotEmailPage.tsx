import { useState, FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, ArrowRight, ChevronLeft, PhoneCall } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useToast } from "../hooks/use-toast"
import rabbitClover from '../images/rabbit-clover.png';
import axiosInstance from "../lib/axiosInstance"

interface ForgotEmailResponse {
    email: string;
    errorMessage: string;
}

export default function ForgotEmailPage() {
    const [phone, setPhone] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)
    
    const [email, setEmail] = useState("");
    const { toast } = useToast()
    const navigate = useNavigate()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!phone) {
            toast({
                title: "휴대폰 번호 입력해주세요",
                description: "가입한 이메일을 받을 번호가 필요합니다.",
                variant: "destructive",
            })
            return
        }

        const res = await axiosInstance.get<ForgotEmailResponse>("/user/find-email", {
            params: {
                phone: phone
            }
        });
        
        if (res.status === 200){
            setIsSubmitted(true)
            
            setEmail(res.data.email)
            toast({
                title: "가입한 이메일 발송 완료",
                description: `${phone}로 가입한 이메일이 발송되었습니다.`,
            })
        }else{
            toast({
                title: "오류 발생",
                description: res.data.errorMessage,
                variant: "destructive",
            })
            return
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#75CB3B]/10 to-white px-4 py-8 font-gmarket">
            <div className="w-full max-w-sm mx-auto">
                <div className="mb-6">
                    <Link to="/login" className="inline-flex items-center text-[#00A949] hover:text-[#009149]">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        <span>로그인으로 돌아가기</span>
                    </Link>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-[#75CB3B] to-[#00B959] rounded-full flex items-center justify-center">
                        <img
                            src={rabbitClover}
                            alt="혜택클로버 캐릭터"
                            width={60}
                            height={60}
                            className="rounded-full"
                        />
                    </div>
                    <h1 className="text-xl font-bold text-[#00A949] mt-4">이메일 찾기</h1>
                    <p className="text-sm text-center text-[#5A3D2B]/80 mt-2 px-6 leading-relaxed">
                        가입하신 전화번호를 입력하시면
                        <br />가입된 이메일을 보여드립니다
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="tel" className="text-[#5A3D2B]">전화번호</Label>
                            <div className="relative">
                                <Input
                                    id="tel"
                                    type="tel"
                                    placeholder="휴대폰 번호 입력"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="pl-10 border-[#E5E7EB] focus-visible:ring-[#00A949] rounded-full"
                                    required
                                />
                                <PhoneCall className="absolute left-3 top-3 h-4 w-4 text-[#00A949]" />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full py-5 text-base font-medium bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] text-white rounded-full"
                        >
                            가입한 이메일 확인
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-[#F5FAF0] rounded-lg p-6 text-center">
                            <div className="w-16 h-16 bg-[#75CB3B]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <PhoneCall className="h-8 w-8 text-[#00A949]" />
                            </div>
                            <h2 className="text-lg font-bold text-[#5A3D2B] mb-2">가입한 이메일 확인 완료</h2>
                            <p className="text-sm text-[#5A3D2B]/80 mb-1">{phone}으로 가입한 이메일은 {email} 입니다.</p>
                            
                        </div>

                        <Link to="/login">
                            <Button className="w-full py-5 text-base font-medium bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] text-white rounded-full">
                                로그인 페이지로 이동
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                )}

                <div className="text-center mt-6">
                    <span className="text-sm text-gray-500">계정이 없으신가요?</span>{" "}
                    <Link to="/signup" className="text-sm text-[#00A949] font-medium hover:underline">
                        회원가입
                    </Link>
                </div>
            </div>
        </main>
    )
}
