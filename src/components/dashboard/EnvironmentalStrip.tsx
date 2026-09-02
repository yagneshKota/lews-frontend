import React from 'react';
import {
  CloudRain,
  Droplets,
  Thermometer,
  Activity,
  Gauge,
  Satellite,
  Radio,
} from 'lucide-react';
import type { EnvironmentalData } from '../../types/dashboard';

interface EnvironmentalStripProps {
  data: EnvironmentalData;
  isSimulatedSurge?: boolean;
}

export const EnvironmentalStrip: React.FC<EnvironmentalStripProps> = ({
  data,
  isSimulatedSurge = false,
}) => {
  const rainfall = data.rainfall24h + (isSimulatedSurge ? 65 : 0);
  const moisture = Math.min(100, data.soilMoisture + (isSimulatedSurge ? 20 : 0));
  const movement = isSimulatedSurge ? 4.8 : data.groundMovement;
  const porePressureKpa = Math.round(18 + (moisture / 100) * 42);

  return (
    <div className="bg-white rounded-2xl border border-[#CBD5E1] p-3 shadow-xs">
      <div className="flex items-center justify-between gap-3 overflow-x-auto py-0.5">
        {/* Strip Title Badge */}
        <div className="flex items-center gap-2 px-3 border-r border-[#E2E8F0] shrink-0">
          <div className="w-6 h-6 rounded-lg bg-[#1B4332] text-white flex items-center justify-center text-[10px]">
            <Radio className="w-3.5 h-3.5 text-[#86EFAC]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0F172A] block">
              IoT Sensor Matrix
            </span>
            <span className="text-[9px] text-[#64748B] block font-mono">
              Live Telemetry 10s
            </span>
          </div>
        </div>

        {/* 1. Rainfall Precipitation */}
        <div className="flex items-center gap-2.5 px-3 border-r border-[#F1F5F9] shrink-0">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#64748B] leading-tight">
              Precipitation (24h)
            </p>
            <p className="text-[13px] font-extrabold text-[#0F172A] leading-tight font-mono">
              {rainfall} mm <span className="text-[10px] text-blue-600 font-bold">({(rainfall / 24).toFixed(1)} mm/h)</span>
            </p>
          </div>
        </div>

        {/* 2. Soil Moisture & Pore Saturation */}
        <div className="flex items-center gap-2.5 px-3 border-r border-[#F1F5F9] shrink-0">
          <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#64748B] leading-tight">
              Volumetric Soil Moisture
            </p>
            <p className="text-[13px] font-extrabold text-[#0F172A] leading-tight font-mono">
              {moisture}% <span className="text-[10px] text-sky-600 font-bold">Saturation</span>
            </p>
          </div>
        </div>

        {/* 3. Piezometer Pore Pressure */}
        <div className="flex items-center gap-2.5 px-3 border-r border-[#F1F5F9] shrink-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#64748B] leading-tight">
              Piezometer Pore Pressure
            </p>
            <p className="text-[13px] font-extrabold text-[#0F172A] leading-tight font-mono">
              {porePressureKpa} kPa <span className="text-[10px] text-indigo-600 font-bold">Hydrostatic</span>
            </p>
          </div>
        </div>

        {/* 4. Borehole Inclinometer Drift */}
        <div className="flex items-center gap-2.5 px-3 border-r border-[#F1F5F9] shrink-0">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#64748B] leading-tight">
              Inclinometer Shear Rate
            </p>
            <p className="text-[13px] font-extrabold text-[#0F172A] leading-tight font-mono">
              {movement} mm/hr <span className={`text-[10px] font-bold ${movement > 2 ? 'text-red-600' : 'text-amber-600'}`}>Drift</span>
            </p>
          </div>
        </div>

        {/* 5. InSAR Satellite Displacement */}
        <div className="flex items-center gap-2.5 px-3 border-r border-[#F1F5F9] shrink-0 hidden md:flex">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Satellite className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#64748B] leading-tight">
              InSAR Surface Velocity
            </p>
            <p className="text-[13px] font-extrabold text-[#0F172A] leading-tight font-mono">
              -4.8 mm/yr <span className="text-[10px] text-emerald-700 font-bold">LOS Line-of-sight</span>
            </p>
          </div>
        </div>

        {/* 6. Temperature */}
        <div className="flex items-center gap-2.5 px-3 shrink-0 hidden lg:flex">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#64748B] leading-tight">
              Ambient Temp
            </p>
            <p className="text-[13px] font-extrabold text-[#0F172A] leading-tight font-mono">
              {data.temperature}°C <span className="text-[10px] text-slate-500">Normal</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
