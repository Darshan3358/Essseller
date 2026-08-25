'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface FrozenAccountModalProps {
    isOpen: boolean;
}

const FrozenAccountModal: React.FC<FrozenAccountModalProps> = ({ isOpen }) => {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm p-8 flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Snowflake Icon Wrapper */}
                <div className="relative mb-8 pt-4">
                    <div className="w-40 h-40 bg-blue-50/50 rounded-full flex items-center justify-center p-8">
                         <div className="w-full h-full relative">
                            {/* Snowflake SVG */}
                            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]">
                                <path d="M12 2V22M12 2L15 5M12 2L9 5M12 22L15 19M12 22L9 19M2 12H22M2 12L5 9M2 12L5 15M22 12L19 9M22 12L19 15M4.93 4.93L19.07 19.07M4.93 4.93L8.46 4.93M4.93 4.93L4.93 8.46M19.07 19.07L15.54 19.07M19.07 19.07L19.07 15.54M4.93 19.07L19.07 4.93M4.93 19.07L8.46 19.07M4.93 19.07L4.93 15.61M19.07 4.93L15.61 4.93M19.07 4.93L19.07 8.46" 
                                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    {/* Decorative stars/dots as seen in image */}
                    <div className="absolute top-4 right-4 w-1 h-1 bg-cyan-400 rounded-full blur-[1px]"></div>
                    <div className="absolute bottom-8 left-2 w-1.5 h-1.5 bg-blue-300 rounded-full blur-[1px]"></div>
                    <div className="absolute top-12 left-6 w-1 h-1 bg-purple-300 rounded-full blur-[1px]"></div>
                    <div className="absolute top-2 right-12 w-1.5 h-1.5 bg-sky-200 rounded-full blur-[1px]"></div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                    Your account has been frozen
                </h2>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-8 px-2">
                    You won't be able to make any bank transfers till then. To know how to continue using your account, 
                    <span className="text-gray-700 font-medium cursor-pointer hover:underline mx-1">tap here</span>
                </p>

                <button 
                    onClick={() => router.push('/support')}
                    className="w-full bg-[#FF7A68] hover:bg-[#FF6550] text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-red-200"
                >
                    Get help
                </button>
            </div>
        </div>
    );
};

export default FrozenAccountModal;
