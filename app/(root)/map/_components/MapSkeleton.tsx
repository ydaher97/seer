import React from 'react';

const MapSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full bg-slate-100 animate-pulse flex flex-col">
      <div className="bg-slate-200 h-10 w-full"></div>
      <div className="flex-grow relative">
        <div className="absolute top-4 left-4 bg-white rounded-md shadow-md h-8 w-32"></div>
        <div className="absolute top-4 right-4 bg-white rounded-md shadow-md h-28 w-8"></div>
        <div className="absolute bottom-4 right-4 bg-white rounded-md shadow-md h-8 w-8"></div>
        
        {/* Map landmarks */}
        <div className="absolute top-1/4 left-1/4 bg-slate-300 rounded-full h-6 w-6"></div>
        <div className="absolute top-1/3 left-1/2 bg-slate-300 rounded-full h-6 w-6"></div>
        <div className="absolute top-2/3 left-1/3 bg-slate-300 rounded-full h-6 w-6"></div>
        <div className="absolute top-1/2 left-3/4 bg-slate-300 rounded-full h-6 w-6"></div>
      </div>
    </div>
  );
};

export default MapSkeleton;