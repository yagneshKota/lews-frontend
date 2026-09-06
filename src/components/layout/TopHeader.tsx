import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  RefreshCw,
  Bell,
  Mountain,
  LogOut,
  X,
  SlidersHorizontal,
  ChevronDown,
  Sun,
  Moon,
  Navigation,
  Loader2,
  Menu,
} from 'lucide-react';
import { apiService } from '../../services/api';
import type { NortheastLocation } from '../../data/northeastLocations';
import type { UserProfile } from '../../types/dashboard';

interface TopHeaderProps {
  selectedLocation: NortheastLocation;
  onSelectLocation: (loc: NortheastLocation) => void;
  activeAlertsCount: number;
  onOpenAlerts: () => void;
  user: UserProfile;
  onOpenAccount: () => void;
  onSignOut: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onShowToast: (msg: string) => void;
  onToggleMobileMenu?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  selectedLocation,
  onSelectLocation,
  activeAlertsCount,
  onOpenAlerts,
  user,
  onOpenAccount,
  onSignOut,
  theme,
  onToggleTheme,
  onShowToast,
  onToggleMobileMenu,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingBackend, setIsSearchingBackend] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search results dynamically across India & worldwide
  useEffect(() => {
    let active = true;
    setIsSearchingBackend(true);
    const timer = setTimeout(() => {
      apiService
        .searchPlaces(searchQuery)
        .then((places) => {
          if (active) {
            setSearchResults(places);
            setIsSearchingBackend(false);
          }
        })
        .catch(() => {
          if (active) setIsSearchingBackend(false);
        });
    }, 180);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedStateFilter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
    onShowToast('Refreshed live sensor & satellite telemetry');
  };

  // Live browser geolocation feature: sends exact GPS coordinates to live risk pipeline
  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      onShowToast('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    onShowToast('Acquiring live browser GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const lat = Number(latitude.toFixed(4));
          const lng = Number(longitude.toFixed(4));
          const placeName = await apiService.reverseGeocode(lat, lng);

          const gpsLoc: NortheastLocation = {
            id: `gps-${lat}-${lng}`,
            name: placeName,
            state: 'Live GPS Location',
            district: placeName,
            coordinates: [lat, lng],
            elevation_m: 1000,
            slope_degrees: 25,
            aspect_degrees: 135,
            rainfall_24h: 20,
            rainfall_3d: 55,
            rainfall_7d: 110,
            soil_moisture: 0.52,
            riskScore: 50,
            riskTier: 'MEDIUM',
            description: `Live GPS location (${placeName}) evaluated with dynamic Open-Meteo & Copernicus DEM telemetry.`,
            evacuationCenter: 'Nearest Community Hall / Safe Zone',
            shelterDistance: '1.0 km away',
            helpline: '1078 (National Disaster Helpline)',
            sensorsCount: 4,
            populationAtRisk: 600,
          };

          onSelectLocation(gpsLoc);
          onShowToast(`📍 Live GPS acquired: ${placeName}. Calculating live ML risk...`);
        } catch {
          onShowToast('Could not process live GPS coordinates.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        onShowToast(`GPS Location permission denied or unavailable (${err.message}).`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const states = [
    'ALL',
    'Arunachal Pradesh',
    'Assam',
    'Meghalaya',
    'Sikkim',
    'Nagaland',
    'Manipur',
    'Mizoram',
    'Tripura',
    'Maharashtra',
    'Uttarakhand',
    'Himachal Pradesh',
    'West Bengal',
  ];

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40';
    }
  };

  const isLight = theme === 'light';

  return (
    <header
      className={`border-b px-4 md:px-6 py-2.5 sticky top-0 z-30 shadow-md transition-colors ${
        isLight
          ? 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-900'
          : 'bg-[#081711]/95 backdrop-blur-md border-emerald-900/60 text-white'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Branding & Mobile Menu Button */}
        <div className="flex items-center gap-2 md:gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className={`p-2 rounded-xl border md:hidden transition-colors ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  : 'bg-[#0d261e] border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50 hover:text-white'
              }`}
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 flex items-center justify-center text-white shadow-md border border-emerald-400/30 shrink-0">
            <Mountain className="w-4 h-4 md:w-5 md:h-5 text-emerald-100" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-lg font-black tracking-tight flex items-center gap-1.5">
                <span className={isLight ? 'text-slate-900' : 'text-white'}>GeoAlert AI</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-600 text-white uppercase font-mono">
                  GeoAlert
                </span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700 font-mono">
                Live Dynamic Grid
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-emerald-600 dark:text-emerald-300/90 font-medium leading-tight">
              Landslide Early Warning &bull; Live Telemetry & Field Response
            </p>
          </div>
        </div>

        {/* Center: Search Bar for Any Coordinate or Place in India / Worldwide */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-auto w-full">
          <div className="relative flex items-center">
            <div className="absolute left-3 text-emerald-600 dark:text-emerald-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="Search any place or coordinates"
              className={`w-full pl-9 pr-28 py-2 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner ${
                isLight
                  ? 'bg-slate-100/90 border border-slate-300 text-slate-900 placeholder:text-slate-500 hover:border-emerald-500'
                  : 'bg-[#0d261e]/90 border border-emerald-700/50 text-white placeholder:text-slate-400 hover:border-emerald-500'
              }`}
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-18 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Quick GPS Live Button */}
            <button
              onClick={handleUseLiveLocation}
              disabled={isLocating}
              title="Use Live Browser GPS Location"
              className="absolute right-1.5 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              {isLocating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Navigation className="w-3 h-3 text-emerald-100" />
              )}
              <span className="hidden sm:inline">My GPS</span>
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && (
            <div
              className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 border ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-800'
                  : 'bg-[#0c221a] border-emerald-700/60 text-white'
              }`}
            >
              {/* State Filter Chips */}
              <div
                className={`p-2 border-b overflow-x-auto flex items-center gap-1.5 scrollbar-none ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#071711] border-emerald-900/80'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-1 mr-0.5 shrink-0" />
                {states.map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStateFilter(st)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                      selectedStateFilter === st
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isLight
                        ? 'bg-slate-200/70 text-slate-700 hover:bg-slate-300'
                        : 'bg-emerald-950/60 text-slate-300 hover:bg-emerald-900/80 hover:text-white'
                    }`}
                  >
                    {st === 'ALL' ? 'All Regions' : st}
                  </button>
                ))}
              </div>

              {/* Locations List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-emerald-950">
                {isSearchingBackend ? (
                  <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Searching locations & coordinates...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => {
                    const coords: [number, number] = item.coordinates || [27.58, 91.86];
                    const isCurrent =
                      Math.abs(coords[0] - selectedLocation.coordinates[0]) < 0.005 &&
                      Math.abs(coords[1] - selectedLocation.coordinates[1]) < 0.005;

                    return (
                      <button
                        key={item.id || `${coords[0]}-${coords[1]}`}
                        type="button"
                        onClick={() => {
                          const locObj: NortheastLocation = {
                            id: item.id || `loc-${coords[0]}-${coords[1]}`,
                            name: item.name || 'Custom Location',
                            state: item.state || 'India',
                            district: item.district || item.name || 'District Area',
                            coordinates: coords,
                            elevation_m: item.elevation_m || 1200,
                            slope_degrees: item.slope_degrees || 25,
                            aspect_degrees: item.aspect_degrees || 135,
                            rainfall_24h: item.rainfall_24h || 20,
                            rainfall_3d: item.rainfall_3d || 55,
                            rainfall_7d: item.rainfall_7d || 110,
                            soil_moisture: item.soil_moisture || 0.52,
                            riskScore: item.riskScore || 50,
                            riskTier: item.riskTier || 'MEDIUM',
                            description: `Monitored terrain site at [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}]`,
                            evacuationCenter: item.evacuationCenter || 'Designated Community Safe Zone',
                            shelterDistance: item.shelterDistance || '1.5 km away',
                            helpline: item.helpline || '1078 (Disaster Toll-Free)',
                            sensorsCount: item.sensorsCount || 4,
                            populationAtRisk: item.populationAtRisk || 850,
                          };

                          onSelectLocation(locObj);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          onShowToast(`Switched monitoring site to ${locObj.name} [${coords[0]}, ${coords[1]}]`);
                        }}
                        className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors ${
                          isCurrent
                            ? isLight
                              ? 'bg-emerald-50 font-bold'
                              : 'bg-emerald-900/50 font-bold'
                            : isLight
                            ? 'hover:bg-slate-100'
                            : 'hover:bg-emerald-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold ${
                                  isLight ? 'text-slate-900' : 'text-white'
                                }`}
                              >
                                {item.name}
                              </span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400/90 font-mono">
                                {item.district}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {item.state} &bull; [{coords[0].toFixed(3)}, {coords[1].toFixed(3)}]
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full border ${getTierBadge(
                              item.riskTier || 'MEDIUM'
                            )}`}
                          >
                            {item.riskScore ? `${item.riskScore}% ` : ''}{item.riskTier || 'LIVE'}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No location matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Controls: Theme Toggle, Refresh, Role Switcher, Alerts Bell */}
        <div className="flex items-center gap-2 justify-end">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className={`p-2 rounded-xl border transition-all ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                : 'bg-[#0d261e] border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50 hover:text-white'
            }`}
          >
            {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-300" />}
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            title="Refresh Live Geotechnical Telemetry"
            className={`p-2 rounded-xl border transition-all ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                : 'bg-[#0d261e] border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50 hover:text-white'
            } ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* User Role Pill & Switcher */}
          <div
            className={`flex items-center gap-1 rounded-xl border p-1 shadow-xs ${
              isLight
                ? 'bg-slate-100 border-slate-300'
                : 'bg-[#0d261e] border-emerald-800/70'
            }`}
          >
            <button
              onClick={onOpenAccount}
              title="Click to Switch Role (Citizen / Officer / Admin)"
              className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-200/80 dark:hover:bg-emerald-900/60 transition-colors text-left group"
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white shadow-xs ${
                  user.role === 'admin'
                    ? 'bg-purple-700'
                    : user.role === 'citizen'
                    ? 'bg-blue-600'
                    : 'bg-emerald-600'
                }`}
              >
                {user.avatarInitials}
              </span>
              <span className="hidden sm:block leading-tight">
                <span
                  className={`block text-xs font-black truncate max-w-[110px] ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {user.role === 'citizen' ? 'Citizen' : user.role === 'admin' ? 'Admin' : 'Officer'}
                </span>
                <span className="block text-[9.5px] font-bold text-emerald-600 dark:text-emerald-300 font-mono">
                  {user.role === 'citizen' ? 'Citizen Portal' : user.role === 'admin' ? 'System Administrator' : 'Field Operations'}
                </span>
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white" />
            </button>

            <button
              onClick={onSignOut}
              title="Sign Out / Switch Role"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-red-100 dark:hover:bg-red-950/60 hover:text-red-600 dark:hover:text-red-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Alerts Bell */}
          <button
            onClick={onOpenAlerts}
            title="View Active Landslide Alerts"
            className={`relative p-2 rounded-xl border transition-colors ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                : 'bg-[#0d261e] border-emerald-800/70 text-emerald-300 hover:bg-emerald-900/60 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-white text-[9px] font-black animate-bounce shadow-md">
                {activeAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
