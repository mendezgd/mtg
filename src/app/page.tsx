"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const App: React.FC = () => {

    return (
        <div className="flex flex-col h-screen w-screen bg-gray-800 text-white">
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-5xl font-bold mb-8">Magic: The Gathering</h1>
                <div className="flex space-x-4">
                    <Link href="/deck-builder" className="text-blue-300 hover:text-blue-500">
                        <Button>Create Deck</Button>
                    </Link>
                    <Link href="/game" className="text-green-300 hover:text-green-500">
                        <Button>Challenge Friend</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default App;
