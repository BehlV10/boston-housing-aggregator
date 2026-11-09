import React from 'react';
import {
  Search,
  RotateCcw,
  SlidersHorizontal,
  ShieldCheck,
  Calendar,
  Home,
  DoorClosed,
  Repeat,
  X,
  Clock,
  Sparkles,
  Camera,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  MapPin,
  DollarSign
} from 'lucide-react';

export default function FilterSidebar({
  filters,
  setFilters,
  totalCount,
  filteredCount,
  theme = 'midnight',
  city = 'nyc',
  quickChips = [],
  maxPriceLimit = 8000,
  isOpen = true,
  onToggleOpen,
  mobileOpen = false,
  onCloseMobile
}) {
  const isDark = theme === 'midnight';
  const isWarm = theme === 'warm';

  const handleReset = () => {
    setFilters({
      search: '',
      fee: 'all',
      source: 'all',
      borough: 'all',
      bedrooms: 'all',
      rentalType: 'all',
      moveInDate: 'all',
      postedWithin: 'all',
      photosOnly: false,
      availableNow: false,
      maxPrice: maxPriceLimit,
    });
  };

  const activeFiltersCount = [
    filters.fee !== 'all',
    filters.source !== 'all',
    Boolean(filters.borough && filters.borough !== 'all'),
    filters.bedrooms !== 'all',
    filters.rentalType !== 'all',
    Boolean(filters.moveInDate && filters.moveInDate !== 'all'),
    Boolean(filters.postedWithin && filters.postedWithin !== 'all'),
    Boolean(filters.photosOnly),
    filters.maxPrice < maxPriceLimit,
    Boolean(filters.availableNow),
    Boolean(filters.search),
  ].filter(Boolean).length;

  // Theming classes
  const sidebarBgClass = isDark
    ? 'bg-[#11192C] border-slate-800 text-slate-200'
    : isWarm
    ? 'bg-[#FFFFFF] border-[#E2DDD2] text-stone-800'
    : 'bg-white border-gray-200 text-gray-800';

  const sectionDividerClass = isDark
    ? 'border-slate-800/80'
    : isWarm
    ? 'border-[#EFECE4]'
    : 'border-gray-100';

  const inputClass = isDark
    ? 'bg-[#0B1120] border-slate-700/80 text-slate-100 placeholder-slate-500 focus:ring-rose-500 focus:border-rose-500'
    : isWarm
    ? 'bg-[#F7F5EE] border-[#DDD7C9] text-stone-900 placeholder-stone-400 focus:ring-boston-brick'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-boston-brick';

  const cardOptionClass = (isSelected, activeColor = 'bg-boston-brick text-white') => {
    if (isSelected) {
      return `${activeColor} shadow-xs font-bold`;
    }
    return isDark
      ? 'bg-[#0B1120] text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/80'
      : isWarm
      ? 'bg-[#F7F5EE] text-stone-600 hover:text-stone-900 hover:bg-[#EDE8DC] border border-[#E7E2D7]'
      : 'bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200';
  };

  const labelClass = isDark
    ? 'text-slate-400 font-semibold'
    : isWarm
    ? 'text-stone-500 font-semibold'
    : 'text-gray-500 font-semibold';

  // Inner Filter Controls Body (Shared between Desktop Sidebar and Mobile Drawer)
  const FilterContent = (
    <div className="flex flex-col gap-4 text-xs">
      {/* 1. Search Bar */}
      <div>
        <label className={`block text-[11px] uppercase tracking-wider mb-1.5 ${labelClass}`}>
          Keywords & Neighborhoods
        </label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
          <input
            type="text"
            placeholder={
              city === 'nyc'
                ? 'Williamsburg, Astoria, West Village...'
                : 'Cambridge, Somerville, Back Bay...'
            }
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className={`w-full pl-8 pr-7 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 transition-all ${inputClass}`}
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Max Price Range Slider */}
      <div className={`pt-3 border-t ${sectionDividerClass}`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-[11px] uppercase tracking-wider ${labelClass}`}>
            Max Monthly Rent
          </span>
          <span className={`font-bold text-xs px-2 py-0.5 rounded-lg border ${
            isDark
              ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
              : 'bg-rose-50 text-boston-brick border-rose-200'
          }`}>
            ${filters.maxPrice.toLocaleString()}/mo
          </span>
        </div>
        <input
          type="range"
          min="500"
          max={maxPriceLimit}
          step="100"
          value={filters.maxPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
          className={`w-full cursor-pointer h-1.5 rounded-lg ${isDark ? 'accent-rose-500' : 'accent-boston-brick'}`}
        />
        {/* Quick price presets */}
        <div className="flex items-center justify-between gap-1 mt-2">
          {[1500, 2500, 3500, maxPriceLimit].map((val) => {
            const isSelected = filters.maxPrice === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, maxPrice: val }))}
                className={`flex-1 py-1 px-1 rounded-lg text-[10px] text-center font-medium transition-all ${
                  isSelected
                    ? isDark ? 'bg-rose-600 text-white font-bold' : 'bg-boston-brick text-white font-bold'
                    : isDark ? 'bg-slate-900 text-slate-400 hover:text-slate-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {val === maxPriceLimit ? 'Max' : `$${(val / 1000).toFixed(val % 1000 !== 0 ? 1 : 0)}k`}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Place / Rental Type */}
      <div className={`pt-3 border-t ${sectionDividerClass}`}>
        <label className={`block text-[11px] uppercase tracking-wider mb-2 ${labelClass}`}>
          Rental Type
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, rentalType: 'all' }))}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${cardOptionClass(
              filters.rentalType === 'all',
              isDark ? 'bg-slate-700 text-white' : 'bg-gray-900 text-white'
            )}`}
          >
            <span>All Types</span>
          </button>
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, rentalType: 'entire_unit' }))}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${cardOptionClass(
              filters.rentalType === 'entire_unit',
              isDark ? 'bg-sky-600 text-white' : 'bg-boston-navy text-white'
            )}`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Condos</span>
          </button>
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, rentalType: 'room' }))}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${cardOptionClass(
              filters.rentalType === 'room',
              'bg-indigo-600 text-white'
            )}`}
          >
            <DoorClosed className="w-3.5 h-3.5" />
            <span>Rooms</span>
          </button>
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, rentalType: 'sublet' }))}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${cardOptionClass(
              filters.rentalType === 'sublet',
              'bg-amber-600 text-white'
            )}`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Sublets</span>
          </button>
        </div>
      </div>

      {/* 4. Broker Fee */}
      <div className={`pt-3 border-t ${sectionDividerClass}`}>
        <label className={`block text-[11px] uppercase tracking-wider mb-2 ${labelClass}`}>
          Broker Fee
        </label>
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, fee: 'all' }))}
            className={`py-1.5 px-1.5 rounded-xl text-center transition-all ${cardOptionClass(
              filters.fee === 'all',
              isDark ? 'bg-slate-700 text-white' : 'bg-gray-900 text-white'
            )}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, fee: 'no-fee' }))}
            className={`py-1.5 px-1.5 rounded-xl flex items-center justify-center gap-1 transition-all ${cardOptionClass(
              filters.fee === 'no-fee',
              'bg-emerald-600 text-white'
            )}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>No Fee</span>
          </button>
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, fee: 'fee' }))}
            className={`py-1.5 px-1.5 rounded-xl text-center transition-all ${cardOptionClass(
              filters.fee === 'fee',
              'bg-blue-600 text-white'
            )}`}
          >
            Fee
          </button>
        </div>
      </div>

      {/* 5. Bedrooms */}
      <div className={`pt-3 border-t ${sectionDividerClass}`}>
        <label className={`block text-[11px] uppercase tracking-wider mb-2 ${labelClass}`}>
          Bedrooms
        </label>
        <div className="grid grid-cols-5 gap-1">
          {[
            { val: 'all', label: 'Any' },
            { val: '0', label: 'Studio' },
            { val: '1', label: '1 BR' },
            { val: '2', label: '2 BR' },
            { val: '3', label: '3+ BR' }
          ].map(({ val, label }) => {
            const isSelected = filters.bedrooms === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, bedrooms: val }))}
                className={`py-1.5 px-1 rounded-xl text-[11px] text-center font-medium transition-all ${cardOptionClass(
                  isSelected,
                  isDark ? 'bg-rose-600 text-white font-bold' : 'bg-boston-brick text-white font-bold'
                )}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. High-Priority Quick Toggles (Photos Only & Move-In Now) */}
      <div className={`pt-3 border-t ${sectionDividerClass} flex flex-col gap-1.5`}>
        {/* Photos Only Toggle */}
        <button
          type="button"
          onClick={() => setFilters((prev) => ({ ...prev, photosOnly: !prev.photosOnly }))}
          className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
            filters.photosOnly
              ? 'bg-sky-600 text-white border-sky-500 font-bold shadow-2xs'
              : isDark
              ? 'bg-[#0B1120] text-slate-300 border-slate-800 hover:bg-slate-800'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span className="font-semibold">Photos Only</span>
          </div>
          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
            filters.photosOnly ? 'bg-white text-sky-600 border-white' : 'border-slate-500'
          }`}>
            {filters.photosOnly ? '✓' : ''}
          </span>
        </button>

        {/* Move-in Now Toggle */}
        <button
          type="button"
          onClick={() => setFilters((prev) => ({ ...prev, availableNow: !prev.availableNow }))}
          className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
            filters.availableNow
              ? isDark
                ? 'bg-rose-600 text-white border-rose-500 font-bold shadow-2xs'
                : 'bg-boston-brick text-white border-boston-brick font-bold shadow-2xs'
              : isDark
              ? 'bg-[#0B1120] text-slate-300 border-slate-800 hover:bg-slate-800'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="font-semibold">Move-In Now / Immediate</span>
          </div>
          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
            filters.availableNow ? 'bg-white text-rose-600 border-white' : 'border-slate-500'
          }`}>
            {filters.availableNow ? '✓' : ''}
          </span>
        </button>
      </div>

      {/* 7. Move-In Target Month */}
      <div className={`pt-3 border-t ${sectionDividerClass}`}>
        <label className={`block text-[11px] uppercase tracking-wider mb-1.5 ${labelClass}`}>
          Target Move-In Month
        </label>
        <select
          value={filters.moveInDate || 'all'}
          onChange={(e) => setFilters((prev) => ({ ...prev, moveInDate: e.target.value }))}
          className={`w-full py-2 px-2.5 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 cursor-pointer ${inputClass}`}
        >
          <option value="all">Any Month</option>
          <option value="immediate">Available Now (Immediate)</option>
          <option value="2026-11">Nov 2026</option>
          <option value="2026-12">Dec 2026</option>
          <option value="2027-01">Jan 2027 (Spring Start)</option>
          <option value="2027-02">Feb 2027</option>
          <option value="2027-06">Jun 2027 (Summer Start)</option>
          <option value="2027-09">Sep 2027 (Fall Lease Cycle)</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>

      {/* 8. Posted Recency (Past 24h, Past Week, etc.) */}
      <div className={`pt-3 border-t ${sectionDividerClass}`}>
        <label className={`block text-[11px] uppercase tracking-wider mb-1.5 ${labelClass}`}>
          Posted Recency
        </label>
        <select
          value={filters.postedWithin || 'all'}
          onChange={(e) => setFilters((prev) => ({ ...prev, postedWithin: e.target.value }))}
          className={`w-full py-2 px-2.5 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 cursor-pointer ${inputClass}`}
        >
          <option value="all">Posted Anytime</option>
          <option value="1d">Past 24 Hours (&lt; 1 day)</option>
          <option value="3d">Past 3 Days</option>
          <option value="7d">Past Week (&lt; 7 days)</option>
          <option value="14d">Past 2 Weeks (&lt; 14 days)</option>
        </select>
      </div>

      {/* 9. NYC Borough Selector (If NYC) */}
      {city === 'nyc' && (
        <div className={`pt-3 border-t ${sectionDividerClass}`}>
          <label className={`block text-[11px] uppercase tracking-wider mb-1.5 ${labelClass}`}>
            NYC Borough / Area
          </label>
          <select
            value={filters.borough || 'all'}
            onChange={(e) => setFilters((prev) => ({ ...prev, borough: e.target.value }))}
            className={`w-full py-2 px-2.5 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 cursor-pointer ${inputClass}`}
          >
            <option value="all">All Boroughs & Areas</option>
            <option value="Manhattan">Manhattan</option>
            <option value="Brooklyn">Brooklyn</option>
            <option value="Queens">Queens</option>
            <option value="Jersey City / Hoboken">Jersey City / Hoboken</option>
            <option value="Bronx">Bronx</option>
          </select>
        </div>
      )}

      {/* 10. Listing Source */}
      <div className={`pt-3 border-t ${sectionDividerClass}`}>
        <label className={`block text-[11px] uppercase tracking-wider mb-1.5 ${labelClass}`}>
          Data Source
        </label>
        <select
          value={filters.source}
          onChange={(e) => setFilters((prev) => ({ ...prev, source: e.target.value }))}
          className={`w-full py-2 px-2.5 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 cursor-pointer ${inputClass}`}
        >
          <option value="all">All Sources</option>
          <option value="craigslist">Craigslist</option>
          <option value="reddit">Reddit (r/NYCapartments, r/bostonhousing)</option>
          <option value="zillow">Zillow</option>
          {city === 'boston' && (
            <>
              <option value="bostonpads">Boston Pads</option>
              <option value="bostonapartments">BostonApartments</option>
              <option value="apartments_com">Apartments.com</option>
              <option value="facebook">FB Marketplace</option>
              <option value="redfin">Redfin</option>
            </>
          )}
        </select>
      </div>

      {/* 11. Quick Neighborhood Tags */}
      {quickChips && quickChips.length > 0 && (
        <div className={`pt-3 border-t ${sectionDividerClass}`}>
          <label className={`block text-[11px] uppercase tracking-wider mb-1.5 ${labelClass}`}>
            Popular Neighborhoods
          </label>
          <div className="flex flex-wrap gap-1">
            {quickChips.map((chip) => {
              const isActive = filters.search.toLowerCase() === chip.toLowerCase();
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, search: isActive ? '' : chip }))}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                    isActive
                      ? isDark
                        ? 'bg-rose-600 text-white border-rose-500 font-bold'
                        : 'bg-boston-brick text-white border-boston-brick font-bold'
                      : isDark
                      ? 'bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ============================================================ */}
      {/* DESKTOP LEFT SIDEBAR (Visible on lg and above)                */}
      {/* ============================================================ */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-72 xl:w-80' : 'w-0 overflow-hidden'
        }`}
      >
        <div
          className={`w-72 xl:w-80 rounded-2xl border p-4 shadow-sm flex flex-col sticky top-20 max-h-[calc(100vh-90px)] overflow-hidden transition-colors ${sidebarBgClass}`}
        >
          {/* Sidebar Top Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-700/40 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600/15 text-rose-500 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-boston-brick text-white text-[10px] font-extrabold">
                  {activeFiltersCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleReset}
                  className={`flex items-center gap-1 text-[11px] font-semibold hover:underline ${
                    isDark ? 'text-rose-400' : 'text-boston-brick'
                  }`}
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
              {onToggleOpen && (
                <button
                  onClick={onToggleOpen}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  title="Collapse sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Filters Body */}
          <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar space-y-4">
            {FilterContent}
          </div>

          {/* Sticky Results Summary at bottom of sidebar */}
          <div className="pt-3 mt-3 border-t border-slate-700/40 flex items-center justify-between text-xs shrink-0">
            <span className={labelClass}>
              Found: <strong className={isDark ? 'text-white' : 'text-gray-900'}>{filteredCount}</strong> of {totalCount}
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleReset}
                className="text-[11px] text-slate-400 hover:text-rose-400 font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MOBILE DRAWER MODAL (Slides in on mobile when toggled)        */}
      {/* ============================================================ */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Content */}
          <div
            className={`relative z-10 w-[85vw] max-w-sm h-full flex flex-col p-4 shadow-2xl transition-transform ${sidebarBgClass}`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-700/40 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-boston-brick" />
                <span className="font-bold text-sm">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-boston-brick text-white text-[10px] font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleReset}
                    className="text-xs text-rose-400 font-semibold"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={onCloseMobile}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Filter List */}
            <div className="flex-1 overflow-y-auto pr-1 pb-4">
              {FilterContent}
            </div>

            {/* Sticky Bottom Done Button */}
            <div className="pt-3 border-t border-slate-700/40 shrink-0">
              <button
                onClick={onCloseMobile}
                className="w-full py-3 bg-boston-brick text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>Show {filteredCount} Apartments</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
