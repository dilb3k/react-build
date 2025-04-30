import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 py-16">
            <div className="text-center max-w-lg">
                {/* 404 Header */}
                <h1 className="text-9xl font-bold text-blue-600">404</h1>

                {/* Animated car imagery */}
                <div className="my-8 relative">
                    <div className="w-24 h-10 bg-blue-500 rounded-lg mx-auto relative">
                        <div className="absolute -bottom-4 left-3 w-6 h-6 bg-gray-800 rounded-full"></div>
                        <div className="absolute -bottom-4 right-3 w-6 h-6 bg-gray-800 rounded-full"></div>
                        <div className="absolute -top-2 right-3 w-4 h-4 bg-blue-300 rounded-sm"></div>
                    </div>
                    <div className="w-full border-b-4 border-dashed border-gray-400 mt-6"></div>
                </div>

                {/* Error message */}
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Sahifa topilmadi</h2>
                <p className="text-gray-600 mb-8">
                    Siz qidirayotgan sahifa mavjud emas yoki o'chirilgan. Bosh sahifaga qaytib, boshqa bo'limlarni ko'rishingiz mumkin.
                </p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link to="/" className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700">
                        <Home size={20} />
                        <span>Bosh sahifa</span>
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors hover:bg-gray-300"
                    >
                        <ArrowLeft size={20} />
                        <span>Orqaga qaytish</span>
                    </button>
                </div>
            </div>

            {/* Optional footer */}
            <div className="mt-16 text-gray-500 text-sm">
                © {new Date().getFullYear()} Sizning Kompaniyangiz
            </div>
        </div>
    );
};

export default NotFound;