import React from 'react';
import {
  Thermometer,
  Activity,
  Gauge,
  Satellite,
  Radio,
  Wind,
  Droplet,
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
  const moisture = Math.min(100, data.soilMoisture + (isSimulatedSurge ? 20 : 0));
  const movement = isSimulatedSurge ? 4.8 : data.groundMovement;
  const porePressureKpa = Math.round(18 + (moisture / 100) * 42);

  return (
    <div className="bg-white dark:bg-[#0b1f16] rounded-2xl border border-slate-200 dark:border-emerald-800/60 p-3 shadow-xs transition-colors">
      <div className="flex items-center justify-between gap-3 overflow-x-auto py-0.5">
        {/* Strip Title Badge */}
        <div className="flex items-center gap-2 px-3 border-r border-slate-200 dark:border-emerald-900/60 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-[#1B4332] text-emerald-800 dark:text-white flex items-center justify-center text-[10px]">
            <Radio className="w-4 h-4 text-emerald-600 dark:text-[#86EFAC] animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white block">
              IoT Sensor Matrix
            </span>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-mono">
              Live GIS & Geotechnical
            </span>
          </div>
        </div>

        {/* 1. Piezometer Hydrostatic Pore Pressure */}
        <div className="flex items-center gap-2.5 px-3 border-r border-slate-100 dark:border-emerald-900/50 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
              Piezometer Pore Pressure
            </p>
            <p className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight font-mono">
              {porePressureKpa} kPa <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Hydrostatic</span>
            </p>
          </div>
        </div>

        {/* 2. Borehole Inclinometer Drift */}
        <div className="flex items-center gap-2.5 px-3 border-r border-slate-100 dark:border-emerald-900/50 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/70 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
              Inclinometer Shear Rate
            </p>
            <p className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight font-mono">
              {movement} mm/hr <span className={`text-[10px] font-bold ${movement > 2 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>Drift</span>
            </p>
          </div>
        </div>

        {/* 3. InSAR Satellite Displacement */}
        <div className="flex items-center gap-2.5 px-3 border-r border-slate-100 dark:border-emerald-900/50 shrink-0 hidden sm:flex">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
            <Satellite className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
              InSAR Satellite LOS Velocity
            </p>
            <p className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight font-mono">
              -4.8 mm/yr <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Line-of-Sight</span>
            </p>
          </div>
        </div>

        {/* 4. Ambient Temperature (Open-Meteo API) */}
        <div className="flex items-center gap-2.5 px-3 border-r border-slate-100 dark:border-emerald-900/50 shrink-0 hidden md:flex">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
              Ambient Temperature
            </p>
            <p className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight font-mono">
              {data.temperature}°C <span className="text-[10px] text-slate-500 dark:text-slate-400">Open-Meteo</span>
            </p>
          </div>
        </div>

        {/* 5. Relative Humidity */}
        <div className="flex items-center gap-2.5 px-3 border-r border-slate-100 dark:border-emerald-900/50 shrink-0 hidden lg:flex">
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Droplet className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
              Relative Humidity
            </p>
            <p className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight font-mono">
              {data.humidity}% <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">Atmospheric</span>
            </p>
          </div>
        </div>

        {/* 6. Wind Velocity */}
        <div className="flex items-center gap-2.5 px-3 shrink-0 hidden xl:flex">
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
              Ridge Wind Velocity
            </p>
            <p className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight font-mono">
              {data.windSpeed} km/h <span className="text-[10px] text-teal-600 dark:text-teal-400">Sustained</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
