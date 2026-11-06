import React, { useState, useEffect, useMemo } from 'react';
import { Home, Map as MapIcon, List as ListIcon, RefreshCw, Sparkles, Building2, ExternalLink, Share2, Moon, Sun, Landmark } from 'lucide-react';
import MapView from './components/MapView';
import ListingCard from './components/ListingCard';
import FilterBar from './components/FilterBar';
import ListingModal from './components/ListingModal';
import CrossListHub from './components/CrossListHub';

export const CITIES = {
  nyc: {
    id: 'nyc',
    name: 'New York City',
    shortName: 'NYC',
    tagline: 'Manhattan • Brooklyn • Queens • JC/Hoboken • Bronx',
    icon: '🗽',
    dataPath: './data/nyc_listings.json',
    metaPath: './data/nyc_metadata.json',
    cacheKey: 'nyc_housing_cache',
    metaCacheKey: 'nyc_housing_meta',
    communityKey: 'nyc_community_listings',
    center: [40.730, -73.960],
    defaultZoom: 11,
    maxPriceDefault: 8000,
    quickChips: ['Manhattan', 'Brooklyn', 'Queens', 'JC / Hoboken', 'Williamsburg', 'Astoria', 'East Village', 'Bushwick'],
  },
  boston: {
    id: 'boston',
    name: 'Greater Boston',
    shortName: 'Boston',
    tagline: 'Boston • Cambridge • Somerville • Brookline',
    icon: '🦞',
    dataPath: './data/listings.json',
    metaPath: './data/metadata.json',
    cacheKey: 'boston_housing_cache',
    metaCacheKey: 'boston_housing_meta',
    communityKey: 'boston_community_listings',
    center: [42.368, -71.095],
    defaultZoom: 12,
    maxPriceDefault: 6000,
    quickChips: ['Cambridge', 'Somerville', 'Boston', 'Brookline', 'Allston', 'Fenway'],
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'cross-list'

  // Selected City: 'nyc' | 'boston' (defaults to NYC as requested by user)
  const [city, setCity] = useState(() => {
    return localStorage.getItem('housing_city') || 'nyc';
  });

  const currentCityConfig = CITIES[city] || CITIES.nyc;

  const [listings, setListings] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalListing, setModalListing] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split' on desktop, 'map' or 'list' on mobile
  const [sortBy, setSortBy] = useState('newest');

  // Theme state: 'midnight' | 'warm' | 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('boston_theme') || 'midnight';
  });

  useEffect(() => {
    try {
      localStorage.setItem('boston_theme', theme);
    } catch (e) {}
    document.body.className = `theme-${theme} ${
      theme === 'midnight'
        ? 'bg-[#0B1120] text-slate-100'
        : theme === 'warm'
        ? 'bg-[#F6F4EE] text-stone-900'
        : 'bg-slate-50 text-slate-900'
    } antialiased font-['Plus_Jakarta_Sans',sans-serif]`;
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('housing_city', city);
    } catch (e) {}
  }, [city]);

  const isDark = theme === 'midnight';
  const isWarm = theme === 'warm';

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    fee: 'all', // 'all' | 'no-fee' | 'fee'
    source: 'all',
    borough: 'all',
    bedrooms: 'all',
    rentalType: 'all', // 'all' | 'entire_unit' | 'room' | 'sublet'
    moveInDate: 'all',
    maxPrice: currentCityConfig.maxPriceDefault,
    availableNow: false,
  });

  const [visibleCount, setVisibleCount] = useState(24);

  // Load aggregated listings whenever city changes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const conf = CITIES[city] || CITIES.nyc;

      const getCommunityListings = () => {
        try {
          const raw = localStorage.getItem(conf.communityKey);
          return raw ? JSON.parse(raw) : [];
        } catch (e) {
          return [];
        }
      };

      // 1. Instant Cache Load from localStorage for 0ms startup
      try {
        const cachedListings = localStorage.getItem(conf.cacheKey);
        const cachedMeta = localStorage.getItem(conf.metaCacheKey);
        const community = getCommunityListings();

        if (cachedListings) {
          const parsed = JSON.parse(cachedListings);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setListings([...community, ...parsed.filter((p) => !community.some((c) => c.id === p.id))]);
            setLoading(false);
          }
        }
        if (cachedMeta) {
          setMetadata(JSON.parse(cachedMeta));
        }
      } catch (e) {
        // Ignore localStorage error
      }

      // 2. Fetch fresh listings from server (SWR pattern with cache-busting)
      try {
        const cacheBuster = `?t=${Date.now()}`;
        const listingsRes = await fetch(`${conf.dataPath}${cacheBuster}`, {
          cache: 'no-cache',
          headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' }
        });
        if (listingsRes.ok) {
          const data = await listingsRes.json();
          const community = getCommunityListings();
          setListings([...community, ...data.filter((p) => !community.some((c) => c.id === p.id))]);
          try {
            localStorage.setItem(conf.cacheKey, JSON.stringify(data));
          } catch (e) {}
        }

        const metaRes = await fetch(`${conf.metaPath}${cacheBuster}`, {
          cache: 'no-cache',
          headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' }
        });
        if (metaRes.ok) {
          const meta = await metaRes.json();
          setMetadata(meta);
          try {
            localStorage.setItem(conf.metaCacheKey, JSON.stringify(meta));
          } catch (e) {}
        }
      } catch (err) {
        console.error('Failed to load listings data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [city]);

  const handleCityChange = (newCity) => {
    if (newCity === city) return;
    setCity(newCity);
    setSelectedListing(null);
    setModalListing(null);
    const conf = CITIES[newCity] || CITIES.nyc;
    setFilters({
      search: '',
      fee: 'all',
      source: 'all',
      borough: 'all',
      bedrooms: 'all',
      rentalType: 'all',
      moveInDate: 'all',
      availableNow: false,
      maxPrice: conf.maxPriceDefault,
    });
  };

  const handleAddCommunityListing = (newListing) => {
    const conf = CITIES[city] || CITIES.nyc;
    setListings((prev) => {
      const filtered = prev.filter((l) => l.id !== newListing.id);
      const updated = [newListing, ...filtered];
      try {
        const saved = JSON.parse(localStorage.getItem(conf.communityKey) || '[]');
        const updatedSaved = [newListing, ...saved.filter((l) => l.id !== newListing.id)];
        localStorage.setItem(conf.communityKey, JSON.stringify(updatedSaved));
      } catch (e) {}
      return updated;
    });
    setActiveTab('browse');
    setSelectedListing(newListing);
    setModalListing(newListing);
  };

  // Reset pagination when filters or sort change
  useEffect(() => {
    setVisibleCount(24);
  }, [filters, sortBy]);

  // Filter & Sort Logic
  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => {
        // Price filter
        if (filters.maxPrice && item.price > filters.maxPrice) {
          return false;
        }

        // Fee filter
        if (filters.fee === 'no-fee' && item.has_broker_fee !== false) {
          return false;
        }
        if (filters.fee === 'fee' && item.has_broker_fee !== true) {
          return false;
        }

        // Borough filter (NYC)
        if (filters.borough && filters.borough !== 'all' && item.borough !== filters.borough) {
          return false;
        }

        // Source filter
        if (filters.source !== 'all' && item.source !== filters.source) {
          return false;
        }

        // Bedrooms filter
        if (filters.bedrooms !== 'all') {
          const bedNum = Number(filters.bedrooms);
          if (bedNum === 3) {
            if ((item.bedrooms || 0) < 3) return false;
          } else {
            if ((item.bedrooms || 0) !== bedNum) return false;
          }
        }

        // Move-in Period filter
        if (filters.moveInDate && filters.moveInDate !== 'all') {
          const periods =
            Array.isArray(item.move_in_periods) && item.move_in_periods.length > 0
              ? item.move_in_periods
              : item.move_in_period
              ? [item.move_in_period]
              : [];
          if (!periods.includes(filters.moveInDate)) {
            return false;
          }
        }

        // Move-in Now Toggle
        if (filters.availableNow) {
          const isImmediate =
            item.move_in_period === 'immediate' ||
            (Array.isArray(item.move_in_periods) && item.move_in_periods.includes('immediate'));
          if (!isImmediate) return false;
        }

        // Rental Type filter (Entire Unit vs Single Room)
        if (filters.rentalType !== 'all' && item.rental_type !== filters.rentalType) {
          return false;
        }

        // Text search
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const matchTitle = item.title?.toLowerCase().includes(query);
          const matchNeigh = item.neighborhood?.toLowerCase().includes(query);
          const matchBorough = item.borough?.toLowerCase().includes(query);
          const matchDesc = item.description?.toLowerCase().includes(query);
          if (!matchTitle && !matchNeigh && !matchBorough && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
        // newest first (default)
        const dateA = a.first_seen ? new Date(a.first_seen).getTime() : 0;
        const dateB = b.first_seen ? new Date(b.first_seen).getTime() : 0;
        return dateB - dateA;
      });
  }, [listings, filters, sortBy]);

  const displayedListings = useMemo(() => {
    return filteredListings.slice(0, visibleCount);
  }, [filteredListings, visibleCount]);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark
          ? 'bg-[#0B1120] text-slate-100'
          : isWarm
          ? 'bg-[#F6F4EE] text-stone-900'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Navbar */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
          isDark
            ? 'bg-[#0F172A]/90 border-slate-800'
            : isWarm
            ? 'bg-[#FAF8F5]/90 border-[#E2DDD2]'
            : 'bg-white/90 border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-boston-brick flex items-center justify-center text-white shadow-md shadow-boston-brick/30 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-sm sm:text-lg font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="hidden sm:inline">{city === 'nyc' ? 'New York City Rentals Hub' : 'Greater Boston Rentals Hub'}</span>
                <span className="sm:hidden">{city === 'nyc' ? 'NYC Rentals' : 'Boston Rentals'}</span>
              </h1>
              <p className={`text-[10px] sm:text-xs line-clamp-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {currentCityConfig.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* City Switcher */}
            <div
              className={`flex items-center p-0.5 sm:p-1 rounded-2xl border text-xs font-bold ${
                isDark
                  ? 'bg-slate-900/90 border-slate-700/80'
                  : isWarm
                  ? 'bg-[#EFECE4] border-[#DDD7C9]'
                  : 'bg-gray-100 border-gray-200'
              }`}
            >
              <button
                onClick={() => handleCityChange('nyc')}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl transition-all ${
                  city === 'nyc'
                    ? isDark
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-boston-brick text-white shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Switch to New York City Rentals"
              >
                <span>🗽</span>
                <span>NYC</span>
              </button>
              <button
                onClick={() => handleCityChange('boston')}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl transition-all ${
                  city === 'boston'
                    ? isDark
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-boston-brick text-white shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Switch to Greater Boston Rentals"
              >
                <span>🦞</span>
                <span className="hidden sm:inline">Boston</span>
                <span className="sm:hidden">BOS</span>
              </button>
            </div>

            {/* Theme Selector Toggle */}
            <div
              className={`flex items-center p-0.5 sm:p-1 rounded-2xl border text-xs font-semibold ${
                isDark
                  ? 'bg-slate-900/90 border-slate-700/80'
                  : isWarm
                  ? 'bg-[#EFECE4] border-[#DDD7C9]'
                  : 'bg-gray-100 border-gray-200'
              }`}
            >
              <button
                onClick={() => setTheme('midnight')}
                className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-xl transition-all ${
                  theme === 'midnight'
                    ? 'bg-slate-800 text-sky-400 shadow-xs border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Midnight Slate Theme"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Midnight</span>
              </button>
              <button
                onClick={() => setTheme('warm')}
                className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-xl transition-all ${
                  theme === 'warm'
                    ? 'bg-white text-boston-brick shadow-xs border border-stone-200'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Beacon Hill Warm Linen Theme"
              >
                <Landmark className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Beacon Hill</span>
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-xl transition-all ${
                  theme === 'light'
                    ? 'bg-white text-blue-600 shadow-xs border border-gray-200'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Modern Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Light</span>
              </button>
            </div>

            {/* Top Navigation Tabs */}
            <nav
              className={`flex items-center gap-1 p-0.5 sm:p-1 rounded-2xl border ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800'
                  : isWarm
                  ? 'bg-[#EFECE4] border-[#DDD7C9]'
                  : 'bg-gray-100 border-gray-200'
              }`}
            >
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 ${
                  activeTab === 'browse'
                    ? isDark
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white shadow-xs text-boston-brick'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Browse</span>
              </button>
              <button
                onClick={() => setActiveTab('cross-list')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 ${
                  activeTab === 'cross-list'
                    ? isDark
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white shadow-xs text-boston-brick'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-boston-brick" />
                <span className="hidden sm:inline">List a Room</span>
                <span className="sm:hidden">List</span>
                <span className="hidden lg:inline-block px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-boston-brick/20 text-rose-400">
                  Cross-Poster
                </span>
              </button>
            </nav>

            {metadata && (
              <div
                className={`hidden xl:flex items-center gap-2.5 text-xs py-1.5 px-3.5 rounded-full border ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                    : isWarm
                    ? 'bg-[#EFECE4] border-[#DDD7C9] text-stone-700'
                    : 'bg-gray-100 border-gray-200 text-gray-600'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-emerald-400">
                    {(metadata.no_broker_fee_listings ?? metadata.no_fee_count) || 0} No-Fee
                  </span>
                </span>
                <span className="opacity-30">&bull;</span>
                <span>{(metadata.types_summary?.['Condo / Apt'] ?? metadata.entire_count) || 0} Condos</span>
                <span className="opacity-30">&bull;</span>
                <span className="text-indigo-400 font-semibold">{(metadata.types_summary?.['Single Room'] ?? metadata.room_count) || 0} Rooms</span>
                <span className="opacity-30">&bull;</span>
                <span className="text-amber-400 font-semibold">{(metadata.types_summary?.['Sublet'] ?? metadata.sublet_count) || 0} Sublets</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {activeTab === 'cross-list' ? (
        <CrossListHub onAddCommunityListing={handleAddCommunityListing} theme={theme} />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 flex flex-col">
          {/* Filter Controls */}
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            totalCount={listings.length}
            filteredCount={filteredListings.length}
            theme={theme}
            city={city}
            quickChips={currentCityConfig.quickChips}
            maxPriceLimit={currentCityConfig.maxPriceDefault}
          />

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mb-3 text-boston-brick" />
              <p className="font-semibold text-sm">Loading {currentCityConfig.name} listings...</p>
            </div>
          ) : (
            /* Split View Layout */
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 min-h-[600px]">
              {/* Interactive Map (Left Panel, 7 cols on desktop, responsive full-height on mobile) */}
              <div
                className={`lg:col-span-7 h-[calc(100vh-210px)] min-h-[440px] lg:h-[720px] lg:sticky lg:top-24 rounded-2xl overflow-hidden ${
                  viewMode === 'list' ? 'hidden lg:block' : 'block'
                }`}
              >
                <MapView
                  listings={filteredListings}
                  selectedListing={selectedListing}
                  onSelectListing={(listing) => {
                    setSelectedListing(listing);
                    // Ensure card is in the visible batch
                    const idx = filteredListings.findIndex((l) => l.id === listing.id);
                    if (idx >= visibleCount) {
                      setVisibleCount(idx + 12);
                    }
                    setTimeout(() => {
                      const el = document.getElementById(`card-${listing.id}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }
                    }, 50);
                  }}
                  theme={theme}
                  cityCenter={currentCityConfig.center}
                  cityZoom={currentCityConfig.defaultZoom}
                  cityId={city}
                />
              </div>

              {/* Listings Grid (Right Panel, 5 cols on desktop, natural page scroll on mobile) */}
              <div
                className={`lg:col-span-5 flex flex-col gap-3 sm:gap-4 overflow-y-auto max-h-none lg:max-h-[720px] pr-1 pb-24 lg:pb-0 ${
                  viewMode === 'map' ? 'hidden lg:flex' : 'flex'
                }`}
              >
                {/* Sort header */}
                <div className={`flex items-center justify-between text-xs pb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  <span>{filteredListings.length} apartments found</span>
                  <div className="flex items-center gap-1.5">
                    <span>Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`bg-transparent font-bold focus:outline-none cursor-pointer ${
                        isDark ? 'text-white' : isWarm ? 'text-stone-900' : 'text-gray-800'
                      }`}
                    >
                      <option value="newest" className={isDark ? 'bg-slate-900 text-white' : ''}>Newest Added</option>
                      <option value="price-asc" className={isDark ? 'bg-slate-900 text-white' : ''}>Price: Low to High</option>
                      <option value="price-desc" className={isDark ? 'bg-slate-900 text-white' : ''}>Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {filteredListings.length === 0 ? (
                  <div
                    className={`p-8 text-center rounded-2xl border ${
                      isDark
                        ? 'bg-[#131C31] border-slate-800 text-slate-400'
                        : isWarm
                        ? 'bg-[#FCFBF8] border-[#E3DFD5] text-stone-600'
                        : 'bg-white border-gray-200 text-gray-500'
                    }`}
                  >
                    <p className="font-medium text-sm">No listings match your filters.</p>
                    <button
                      onClick={() =>
                        setFilters({
                          search: '',
                          fee: 'all',
                          source: 'all',
                          borough: 'all',
                          bedrooms: 'all',
                          rentalType: 'all',
                          moveInDate: 'all',
                          availableNow: false,
                          maxPrice: currentCityConfig.maxPriceDefault,
                        })
                      }
                      className={`mt-3 text-xs font-bold hover:underline ${
                        isDark ? 'text-rose-400' : 'text-boston-brick'
                      }`}
                    >
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  <>
                    {displayedListings.map((listing) => (
                      <div id={`card-${listing.id}`} key={listing.id}>
                        <ListingCard
                          listing={listing}
                          isSelected={selectedListing?.id === listing.id}
                          onSelect={(item) => setSelectedListing(item)}
                          onOpenDetails={(item) => setModalListing(item)}
                          theme={theme}
                        />
                      </div>
                    ))}

                    {/* Incremental Load More Button */}
                    {visibleCount < filteredListings.length && (
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 24)}
                        className={`w-full py-3.5 border font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs ${
                          isDark
                            ? 'bg-[#131C31] border-slate-800 text-slate-200 hover:border-rose-500 hover:text-white'
                            : isWarm
                            ? 'bg-[#FCFBF8] border-[#E3DFD5] text-stone-800 hover:border-boston-brick hover:text-boston-brick'
                            : 'bg-white border-gray-200 text-gray-800 hover:border-boston-brick hover:text-boston-brick'
                        }`}
                      >
                        <span>Load 24 More Listings</span>
                        <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                          (Showing {displayedListings.length} of {filteredListings.length})
                        </span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {/* Floating Mobile Map / List Toggle Button */}
      {activeTab === 'browse' && !loading && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden pointer-events-auto">
          <button
            onClick={() => setViewMode((prev) => (prev === 'map' ? 'list' : 'map'))}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-extrabold shadow-2xl backdrop-blur-md border transition-all active:scale-95 ${
              isDark
                ? 'bg-slate-900/95 text-white border-slate-700 shadow-slate-950/90 hover:bg-slate-800'
                : isWarm
                ? 'bg-[#FAF8F5]/95 text-stone-900 border-[#E2DDD2] shadow-stone-900/30 hover:bg-white'
                : 'bg-gray-900 text-white border-gray-800 shadow-gray-900/40 hover:bg-black'
            }`}
          >
            {viewMode === 'map' ? (
              <>
                <ListIcon className="w-4 h-4 text-boston-brick" />
                <span>View List ({filteredListings.length})</span>
              </>
            ) : (
              <>
                <MapIcon className="w-4 h-4 text-boston-brick" />
                <span>View Map</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Listing Details Modal */}
      {modalListing && (
        <ListingModal listing={modalListing} onClose={() => setModalListing(null)} theme={theme} />
      )}

      {/* Footer */}
      <footer
        className={`border-t py-6 mt-12 text-center text-xs transition-colors ${
          isDark
            ? 'bg-[#0F172A] border-slate-800 text-slate-500'
            : isWarm
            ? 'bg-[#FAF8F5] border-[#E2DDD2] text-stone-500'
            : 'bg-white border-gray-200 text-gray-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            &copy; {new Date().getFullYear()} Greater Boston Rentals Hub
          </div>
          <div className="flex items-center gap-4 opacity-75">
            <span>Boston &bull; Cambridge &bull; Somerville &bull; Brookline &bull; Allston</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
