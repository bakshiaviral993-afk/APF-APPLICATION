import React from 'react';
import { useAPF } from '../../context/APFContext';
import { TrendingUp, BarChart3, MapPin, Compass, ChevronRight } from 'lucide-react';

export const Screen21_MarketIntelligence: React.FC = () => {
  const { setCurrentScreen, selectedProject } = useAPF();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#102a43] tracking-tight">Micro-Market Intelligence & Supply-Demand</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#e8f1f5] text-[#19638c] border border-[#19638c]/20">
              Absorption & Overhang
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Micro-Market: Kanjurmarg / Powai Extension, Mumbai MMR • Quarterly Absorption Velocity & Unsold Overhang
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('22')}
            className="px-3.5 py-2 rounded-lg bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Open Financial Assessment & Cash Flow (Screen 22) →
          </button>
          <div className="text-xs text-[#627d98] font-medium hidden md:flex items-center gap-1.5">
            <span>Bank POC</span>
            <span>|</span>
            <span>Relationship Manager</span>
          </div>
        </div>
      </div>

      {/* 3 Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-[#102a43]">Micro-Market Absorption</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#627d98]">Quarterly Absorption:</span>
              <span className="font-bold text-[#137333]">840 Units / Quarter</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#627d98]">Inventory Overhang:</span>
              <span className="font-semibold text-[#102a43]">16.4 Months (Healthy &lt; 24 mo)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#627d98]">Capital Appreciation (YoY):</span>
              <span className="font-bold text-[#137333]">+7.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#627d98]">Rental Yield:</span>
              <span className="font-semibold text-[#102a43]">3.4%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-[#102a43]">Infrastructure Drivers</h3>
          <div className="space-y-2 text-xs text-[#486581]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#137333] shrink-0" />
              <span>Metro Line 6 (Swami Samarth Nagar - Vikhroli) under construction</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#137333] shrink-0" />
              <span>Direct access to Jogeshwari-Vikhroli Link Road (JVLR)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#137333] shrink-0" />
              <span>Proximity to IT hubs (Kanjurmarg & Powai SEZ)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-[#102a43]">Micro-Market Sourcing Risk</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#627d98]">Price Volatility Risk:</span>
              <span className="font-bold text-[#137333]">Low (Stable Demand)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#627d98]">Over-Supply Risk:</span>
              <span className="font-medium text-[#b06000]">Moderate (2 upcoming launches)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#627d98]">Customer Profile:</span>
              <span className="font-semibold text-[#102a43]">Salaried Corporate Professionals (82%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
