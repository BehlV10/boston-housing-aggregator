import React, { useState } from 'react';
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
  Check, 
  MapPin,
  Clock,
  Sparkles,
  Camera
} from 'lucide-react';

export default function FilterBar({ 
  filters, 
  setFilters, 
  totalCount, 
  filteredCount, 
  theme = 'midnight',
  city = 'boston',
  quickChips = ['Cambridge', 'Somerville', 'Boston', 'Brookline', 'Allston', 'Fenway'],
  maxPriceLimit = 6000
}) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const isDark = theme === 'midnight';
  const isWarm = theme === 'warm';

  const handleFeeChange = (val) => {
    setFilters((prev) => ({ ...prev, fee: val }));
  };

  const handleSourceChange = (val) => {
    setFilters((prev) => ({ ...prev, source: val }));
  };

  const handleBedroomsChange = (val) => {
    setFilters((prev) => ({ ...prev, bedrooms: val }));
  };

  const handleRentalTypeChange = (val) => {
    setFilters((prev) => ({ ...prev, rentalType: val }));
  };

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

  const containerClass = isDark
    ? 'bg-[#131C31] border-slate-800 text-slate-200 shadow-slate-950/40'
    : isWarm
    ? 'bg-[#FFFFFF] border-[#E2DDD2] text-stone-800'
    : 'bg-white border-gray-200 text-gray-800';

  const inputClass = isDark
    ? 'bg-[#0B1120] border-slate-700/80 text-slate-100 placeholder-slate-500 focus:ring-rose-500 focus:border-rose-500'
    : isWarm
    ? 'bg-[#F7F5EE] border-[#DDD7C9] text-stone-900 placeholder-stone-400 focus:ring-boston-brick'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-boston-brick';

  const segGroupClass = isDark
    ? 'bg-[#0B1120] border border-slate-800/80'
    : isWarm
    ? 'bg-[#EDE8DC]'
    : 'bg-gray-100';

  const segInactiveClass = isDark
    ? 'text-slate-400 hover:text-slate-100'
    : isWarm
    ? 'text-stone-600 hover:text-stone-900'
    : 'text-gray-600 hover:text-gray-900';

  const segActiveWhite = isDark
    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
    : 'bg-white text-gray-900 shadow-sm';

  const dividerClass = isDark ? 'border-slate-800' : isWarm ? 'border-[#EFECE4]' : 'border-gray-100';

  return (
    <div className={`rounded-2xl border p-3 sm:p-4 shadow-sm mb-4 transition-colors ${containerClass}`}>
      {/* Search Input Row with Mobile Filters Toggle */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
          <input
            type="text"
            placeholder={
              city === 'nyc'
                ? 'Search Manhattan, Brooklyn, Williamsburg, Astoria, East Village...'
                : 'Search Cambridge, Somerville, Back Bay, South End...'
            }
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className={`w-full pl-9 pr-8 py-2.5 sm:py-2 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all ${inputClass}`}
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filters Toggle Button */}
        <button
          onClick={() => setMobileFiltersOpen((prev) => !prev)}
          className={`md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
            activeFiltersCount > 0
              ? isDark
                ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                : 'bg-boston-brick/10 border-boston-brick text-boston-brick'
              : isDark
              ? 'bg-[#0B1120] border-slate-700/80 text-slate-300'
              : 'bg-gray-50 border-gray-200 text-gray-700'
          }`}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-boston-brick text-white text-[10px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Horizontal Scrollable Quick Chips Row (Mobile & Desktop) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar -mx-1 px-1">
        {/* All chip */}
        <button
          onClick={() => {
            handleReset();
          }}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition-all ${
            activeFiltersCount === 0
              ? isDark
                ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                : 'bg-boston-brick text-white shadow-xs'
              : isDark
              ? 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>

        {/* No Fee Toggle Chip */}
        <button
          onClick={() => handleFeeChange(filters.fee === 'no-fee' ? 'all' : 'no-fee')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition-all border ${
            filters.fee === 'no-fee'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
              : isDark
              ? 'bg-slate-900/80 text-emerald-400 border-slate-800 hover:bg-slate-800'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>No Broker Fee</span>
        </button>

        {/* Rooms Chip */}
        <button
          onClick={() => handleRentalTypeChange(filters.rentalType === 'room' ? 'all' : 'room')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition-all border ${
            filters.rentalType === 'room'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
              : isDark
              ? 'bg-slate-900/80 text-indigo-400 border-slate-800 hover:bg-slate-800'
              : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
          }`}
        >
          <DoorClosed className="w-3.5 h-3.5" />
          <span>Rooms</span>
        </button>

        {/* Sublets Chip */}
        <button
          onClick={() => handleRentalTypeChange(filters.rentalType === 'sublet' ? 'all' : 'sublet')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition-all border ${
            filters.rentalType === 'sublet'
              ? 'bg-amber-500 text-white border-amber-400 shadow-xs'
              : isDark
              ? 'bg-slate-900/80 text-amber-400 border-slate-800 hover:bg-slate-800'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>Sublets</span>
        </button>

        {/* Entire Condos Chip */}
        <button
          onClick={() => handleRentalTypeChange(filters.rentalType === 'entire_unit' ? 'all' : 'entire_unit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition-all border ${
            filters.rentalType === 'entire_unit'
              ? isDark
                ? 'bg-sky-600 text-white border-sky-500 shadow-xs'
                : 'bg-boston-navy text-white border-boston-navy shadow-xs'
              : isDark
              ? 'bg-slate-900/80 text-sky-400 border-slate-800 hover:bg-slate-800'
              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Condos / Apts</span>
        </button>

        {/* Move-in Now Chip */}
        <button
          onClick={() => setFilters((prev) => ({ ...prev, availableNow: !prev.availableNow }))}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition-all border ${
            filters.availableNow
              ? isDark
                ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                : 'bg-boston-brick text-white border-boston-brick shadow-xs'
              : isDark
              ? 'bg-slate-900/80 text-rose-400 border-slate-800 hover:bg-slate-800'
              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Move-In Now</span>
        </button>

        {/* Fresh / Past Week Recency Chip */}
        <button
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              postedWithin: prev.postedWithin === '7d' ? 'all' : '7d'
            }))
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition-all border ${
            filters.postedWithin === '7d'
              ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
              : isDark
              ? 'bg-slate-900/80 text-amber-400 border-slate-800 hover:bg-slate-800'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
          title="Filter to listings posted within the last 7 days (past week)"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Past Week</span>
        </button>

        {/* New / Past 24h Chip */}
        <button
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              postedWithin: prev.postedWithin === '1d' ? 'all' : '1d'
            }))
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition-all border ${
            filters.postedWithin === '1d'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
              : isDark
              ? 'bg-slate-900/80 text-emerald-400 border-slate-800 hover:bg-slate-800'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
          title="Filter to listings posted in the past 24 hours"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New (&lt;24h)</span>
        </button>

        {/* Photos Only Filter Chip */}
        <button
          onClick={() => setFilters((prev) => ({ ...prev, photosOnly: !prev.photosOnly }))}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition-all border ${
            filters.photosOnly
              ? 'bg-sky-600 text-white border-sky-500 shadow-xs'
              : isDark
              ? 'bg-slate-900/80 text-sky-400 border-slate-800 hover:bg-slate-800'
              : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
          }`}
          title="Filter to listings with real photos only"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Photos Only</span>
        </button>

        {/* Area Quick Chips */}
        {quickChips.map((area) => {
          const isActive = filters.search.toLowerCase() === area.toLowerCase();
          return (
            <button
              key={area}
              onClick={() => setFilters((prev) => ({ ...prev, search: isActive ? '' : area }))}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap shrink-0 transition-all border ${
                isActive
                  ? isDark
                    ? 'bg-slate-700 text-white border-slate-600'
                    : 'bg-gray-900 text-white border-gray-900'
                  : isDark
                  ? 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
              }`}
            >
              {area}
            </button>
          );
        })}
      </div>

      {/* Expandable Advanced Filters (Always visible on Desktop md:grid, collapsible on Mobile) */}
      <div className={`${mobileFiltersOpen ? 'block' : 'hidden md:block'} pt-3 mt-2 border-t ${dividerClass} animate-fade-in`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
          {/* Place Type Segmented Toggle */}
          <div className={`${city === 'nyc' ? 'md:col-span-3' : 'md:col-span-4'} flex items-center p-1 rounded-xl ${segGroupClass}`}>
            <button
              onClick={() => handleRentalTypeChange('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filters.rentalType === 'all' ? segActiveWhite : segInactiveClass
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => handleRentalTypeChange('entire_unit')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                filters.rentalType === 'entire_unit' ? segActiveWhite : segInactiveClass
              }`}
            >
              <Home className="w-3 h-3" />
              Condo
            </button>
            <button
              onClick={() => handleRentalTypeChange('room')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                filters.rentalType === 'room'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark
                  ? 'text-indigo-400'
                  : 'text-gray-600'
              }`}
            >
              <DoorClosed className="w-3 h-3" />
              Room
            </button>
            <button
              onClick={() => handleRentalTypeChange('sublet')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                filters.rentalType === 'sublet'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : isDark
                  ? 'text-amber-400'
                  : 'text-gray-600'
              }`}
            >
              <Repeat className="w-3 h-3" />
              Sublet
            </button>
          </div>

          {/* Fee Filter Buttons */}
          <div className="md:col-span-2 flex items-center p-1 rounded-xl">
            <div className={`w-full flex items-center p-1 rounded-xl ${segGroupClass}`}>
              <button
                onClick={() => handleFeeChange('all')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filters.fee === 'all' ? segActiveWhite : segInactiveClass
                }`}
              >
                All Fees
              </button>
              <button
                onClick={() => handleFeeChange('no-fee')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  filters.fee === 'no-fee'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isDark
                    ? 'text-emerald-400'
                    : 'text-gray-600'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                No Fee
              </button>
              <button
                onClick={() => handleFeeChange('fee')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filters.fee === 'fee'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDark
                    ? 'text-blue-400'
                    : 'text-gray-600'
                }`}
              >
                Fee
              </button>
            </div>
          </div>

          {/* Move-in Date Dropdown */}
          <div className="md:col-span-2 col-span-12">
            <select
              value={filters.moveInDate || 'all'}
              onChange={(e) => setFilters((prev) => ({ ...prev, moveInDate: e.target.value }))}
              className={`w-full py-2 px-2 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 cursor-pointer ${inputClass}`}
            >
              <option value="all">Move-in: Any Month</option>
              <option value="immediate">Available Now</option>
              <option value="2026-11">Nov 2026</option>
              <option value="2026-12">Dec 2026</option>
              <option value="2027-01">Jan 2027 (Spring)</option>
              <option value="2027-02">Feb 2027</option>
              <option value="2027-06">Jun 2027 (Summer)</option>
              <option value="2027-09">Sep 2027 (Fall)</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          {/* Posted Recency Dropdown */}
          <div className="md:col-span-2 col-span-12">
            <select
              value={filters.postedWithin || 'all'}
              onChange={(e) => setFilters((prev) => ({ ...prev, postedWithin: e.target.value }))}
              className={`w-full py-2 px-2 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 cursor-pointer ${inputClass}`}
            >
              <option value="all">Posted: Anytime</option>
              <option value="1d">Posted: Past 24h</option>
              <option value="3d">Posted: Past 3 Days</option>
              <option value="7d">Posted: Past Week (&lt;7d)</option>
              <option value="14d">Posted: Past 2 Weeks (&lt;14d)</option>
            </select>
          </div>

          {/* Borough & Bedrooms & Source responsive grid */}
          <div className="md:col-span-3 col-span-12 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {city === 'nyc' && (
              <select
                value={filters.borough || 'all'}
                onChange={(e) => setFilters((prev) => ({ ...prev, borough: e.target.value }))}
                className={`w-full py-2 px-1.5 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 cursor-pointer ${inputClass}`}
              >
                <option value="all">Borough: All</option>
                <option value="Manhattan">Manhattan</option>
                <option value="Brooklyn">Brooklyn</option>
                <option value="Queens">Queens</option>
                <option value="Jersey City / Hoboken">JC / Hoboken</option>
                <option value="Bronx">Bronx</option>
              </select>
            )}

            <select
              value={filters.bedrooms}
              onChange={(e) => handleBedroomsChange(e.target.value)}
              className={`w-full py-2 px-1.5 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 cursor-pointer ${inputClass}`}
            >
              <option value="all">Beds: Any</option>
              <option value="0">Studio</option>
              <option value="1">1 Bed</option>
              <option value="2">2 Beds</option>
              <option value="3">3+ Beds</option>
            </select>

            <select
              value={filters.source}
              onChange={(e) => handleSourceChange(e.target.value)}
              className={`w-full py-2 px-1.5 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 cursor-pointer ${inputClass}`}
            >
              <option value="all">Source: All</option>
              <option value="zillow">Zillow</option>
              <option value="craigslist">Craigslist</option>
              <option value="reddit">Reddit</option>
              {city === 'boston' && (
                <>
                  <option value="bostonpads">Boston Pads</option>
                  <option value="bostonapartments">BostonApartments</option>
                  <option value="apartments_com">Apartments.com</option>
                  <option value="facebook">FB Mkt</option>
                  <option value="redfin">Redfin</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Max Price Slider & Stats Bar */}
        <div className="mt-3 pt-3 border-t border-dashed border-slate-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <span className={`font-semibold shrink-0 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Max: <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${filters.maxPrice.toLocaleString()}</span>
            </span>
            <input
              type="range"
              min="500"
              max={maxPriceLimit}
              step="100"
              value={filters.maxPrice}
              onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
              className={`w-full cursor-pointer ${isDark ? 'accent-rose-500' : 'accent-boston-brick'}`}
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <div className={`font-medium text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Showing <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{filteredCount}</span> of {totalCount}
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleReset}
                className={`flex items-center gap-1 text-xs hover:underline font-semibold ${
                  isDark ? 'text-rose-400' : 'text-boston-brick'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}

            {/* Mobile Close / Done button */}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="md:hidden py-1.5 px-3 bg-boston-brick text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Done ({filteredCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
