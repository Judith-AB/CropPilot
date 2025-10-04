// F1: This is the route for the Globe/Character Selection UI. 
// F2 will build the interactive map here.

'use client'; 
import React from 'react';

export default function SelectPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">TerraForm: Global Selection</h1>
      <p className="text-xl text-gray-400 mb-8">F2: Build the interactive globe here!</p>
      
      {/* F2 will link this button to the /game page */}
      <a 
        href="/game"
        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-lg font-semibold rounded-lg transition"
      >
        Continue to Farm
      </a>
    </div>
  );
}
