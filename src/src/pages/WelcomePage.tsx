import React from 'react';
import { Link } from 'react-router-dom';
import rabbitClover from '../images/rabbit-clover.png';

const WelcomePage: React.FC = () => {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#75CB3B]/10 to-white px-4 py-8 font-gmarket">
            <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center space-y-8">
                {/* 토끼 이미지 */}
                <div className="w-32 h-32 relative bg-gradient-to-r from-[#75CB3B] to-[#00B959] rounded-full flex items-center justify-center">
                    <img
                        src={rabbitClover}
                        alt="혜택클로버 토끼"
                        className="object-contain"
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>

                {/* 앱 설명 */}
                <div className="text-center space-y-2">
                    <h1 className="text-xl font-bold text-[#00A949]">혜택클로버</h1>
                    <p className="text-sm text-[#5A3D2B]/80 px-6 leading-relaxed">
                        좋고 저렴한 혜택 알려주기,
                        <br />
                        지금 내 주변을 선택하고 시작해보세요!
                    </p>
                </div>

                {/* 시작하기 버튼 */}
                <div className="w-full space-y-4 mt-8">
                    <Link to="/login" className="w-full block">
                        <button className="w-full py-5 text-base font-medium bg-gradient-to-r from-[#75CB3B] to-[#00B959] hover:from-[#00A949] hover:to-[#009149] text-white border-none shadow-md rounded-full">
                            시작하기
                        </button>
                    </Link>

                    {/* 회원가입 링크 */}
                    <div className="text-center">
                        <span className="text-sm text-gray-500">아직 계정이 없으신가요?</span>{' '}
                        <Link to="/signup" className="text-sm text-[#00A949] font-medium hover:underline">
                            회원가입
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default WelcomePage;