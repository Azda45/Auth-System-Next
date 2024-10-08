'use client'
import { useState } from 'react';


const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className={`bg-blue-500  transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} h-full relative`}>

                {/* Tombol untuk membuka/menutup sidebar */}
                <button
                    className="absolute top-4 right-4 bg-red-500 rounded-full w-4 h-4"
                    onClick={() => setIsOpen(!isOpen)}
                ></button>

                {/* Konten di dalam sidebar */}
                <div className="flex flex-col mt-10 space-y-4">
                    <div className="bg-orange-400 rounded-md h-10  transition-all duration-300" style={{ width: isOpen ? '100%' : '40px' }}></div>
                    <div className="bg-orange-400 rounded-md h-10  transition-all duration-300" style={{ width: isOpen ? '100%' : '40px' }}></div>
                    <div className="bg-orange-400 rounded-md h-10  transition-all duration-300" style={{ width: isOpen ? '100%' : '40px' }}></div>
                    <div className="bg-orange-400 rounded-md h-10  transition-all duration-300" style={{ width: isOpen ? '100%' : '40px' }}></div>
                    <div className="bg-orange-400 rounded-md h-10  transition-all duration-300" style={{ width: isOpen ? '100%' : '40px' }}></div>
                </div>
            </div>

        </div>
    );
};

export default Sidebar;
