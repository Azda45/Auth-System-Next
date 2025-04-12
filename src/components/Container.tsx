'use client';

import React, { ReactNode } from 'react';

interface containerProps {
    children: ReactNode;
}

export default function Container({ children }: containerProps) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-sm border border-gray-300 dark:border-gray-600 outline outline-1 outline-gray-300 dark:outline-gray-600">
                {children}
            </div>
        </div>
    );
}