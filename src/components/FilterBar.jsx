import React from 'react';
import { Search, RotateCcw, Filter, ShieldCheck, DollarSign, Calendar, Home, DoorClosed, Repeat } from 'lucide-react';

export default function FilterBar({ filters, setFilters, totalCount, filteredCount, theme = 'midnight' }) {
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
      bedrooms: 'all',
      rentalType: 'all',
      moveInDate: 'all',
      maxPrice: 6000,
    });
  };

  const isFiltered =
    filters.search !== '' ||
    filters.fee !== 'all' ||
    filters.source !== 'all' ||
    filters.bedrooms !== 'all' ||
    filters.rentalType !== 'all' ||
    (filters.moveInDate && filters.moveInDate !== 'all') ||
    filters.maxPrice < 6000;

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
    <div className={`rounded-2xl border p-4 shadow-sm mb-4 transition-colors ${containerClass}`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
        {/* Search Input */}
        <div className="md:col-span-3 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            placeholder="Search Cambridge, Somerville, Back Bay..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all ${inputClass}`}
          />
        </div>

        {/* Place Type: All | Full Condo / Apt | Single Room | Sublet */}
        <div className={`md:col-span-3 flex items-center p-1 rounded-xl ${segGroupClass}`}>
          <button
            onClick={() => handleRentalTypeChange('all')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filters.rentalType === 'all'
                ? segActiveWhite
                : segInactiveClass
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleRentalTypeChange('entire_unit')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
              filters.rentalType === 'entire_unit'
                ? segActiveWhite
                : segInactiveClass
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Condo
          </button>
          <button
            onClick={() => handleRentalTypeChange('room')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
              filters.rentalType === 'room'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark
                ? 'text-indigo-400 hover:text-indigo-300'
                : 'text-gray-600 hover:text-indigo-700'
            }`}
          >
            <DoorClosed className="w-3.5 h-3.5" />
            Room
          </button>
          <button
            onClick={() => handleRentalTypeChange('sublet')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
              filters.rentalType === 'sublet'
                ? 'bg-amber-500 text-white shadow-sm'
                : isDark
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-gray-600 hover:text-amber-700'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            Sublet
          </button>
        </div>

        {/* Fee Filter Buttons */}
        <div className={`md:col-span-2 flex items-center p-1 rounded-xl ${segGroupClass}`}>
          <button
            onClick={() => handleFeeChange('all')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filters.fee === 'all'
                ? segActiveWhite
                : segInactiveClass
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
                ? 'text-emerald-400 hover:text-emerald-300'
                : 'text-gray-600 hover:text-emerald-700'
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
                ? 'text-blue-400 hover:text-blue-300'
                : 'text-gray-600 hover:text-blue-700'
            }`}
          >
            Fee
          </button>
        </div>

        {/* Move-in Date Dropdown */}
        <div className="md:col-span-2 col-span-6">
          <select
            value={filters.moveInDate || 'all'}
            onChange={(e) => setFilters((prev) => ({ ...prev, moveInDate: e.target.value }))}
            className={`w-full py-2 px-1.5 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 cursor-pointer ${inputClass}`}
          >
            <option value="all">Move-in: Any Date</option>
            <option value="immediate">Available Now (Immediate)</option>
            <option value="2026-11">Nov 2026</option>
            <option value="2026-12">Dec 2026</option>
            <option value="2027-01">Jan 2027 (Spring Cycle)</option>
            <option value="2027-02">Feb 2027</option>
            <option value="2027-06">Jun 2027 (Summer Cycle)</option>
            <option value="2027-09">Sep 2027 (Fall Cycle)</option>
            <option value="flexible">Flexible / Month-to-Month</option>
          </select>
        </div>

        {/* Bedroom Select */}
        <div className="md:col-span-1 col-span-6">
          <select
            value={filters.bedrooms}
            onChange={(e) => handleBedroomsChange(e.target.value)}
            className={`w-full py-2 px-1 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 cursor-pointer ${inputClass}`}
          >
            <option value="all">Beds: Any</option>
            <option value="0">Studio</option>
            <option value="1">1 Bed</option>
            <option value="2">2 Beds</option>
            <option value="3">3+ Beds</option>
          </select>
        </div>

        {/* Source Select */}
        <div className="md:col-span-1 col-span-6">
          <select
            value={filters.source}
            onChange={(e) => handleSourceChange(e.target.value)}
            className={`w-full py-2 px-1 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 cursor-pointer ${inputClass}`}
          >
            <option value="all">Source: All</option>
            <option value="craigslist">Craigslist</option>
            <option value="bostonpads">Boston Pads</option>
            <option value="bostonapartments">BostonApartments</option>
            <option value="reddit">Reddit</option>
            <option value="zillow">Zillow</option>
            <option value="apartments_com">Apartments.com</option>
            <option value="facebook">FB Mkt</option>
            <option value="redfin">Redfin</option>
          </select>
        </div>
      </div>

      {/* Quick Location Pills: Cambridge, Somerville, Boston, Brookline, Allston */}
      <div className={`mt-2.5 pt-2.5 border-t flex items-center gap-1.5 overflow-x-auto text-xs pb-1 ${dividerClass}`}>
        <span className={`font-semibold shrink-0 mr-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Quick Area:
        </span>
        {['All', 'Cambridge', 'Somerville', 'Boston', 'Brookline', 'Allston', 'Fenway'].map((area) => {
          const isActive = area === 'All' ? filters.search === '' : filters.search.toLowerCase() === area.toLowerCase();
          return (
            <button
              key={area}
              onClick={() => setFilters((prev) => ({ ...prev, search: area === 'All' ? '' : area }))}
              className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-all ${
                isActive
                  ? isDark
                    ? 'bg-rose-600 text-white shadow-xs font-bold'
                    : 'bg-boston-brick text-white shadow-xs font-bold'
                  : isDark
                  ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                  : isWarm
                  ? 'bg-[#EFECE4] text-stone-700 hover:bg-[#E5E0D5] hover:text-stone-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {area}
            </button>
          );
        })}
      </div>

      {/* Second Row: Max Price Slider and Summary */}
      <div className={`mt-2 pt-2.5 border-t flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${dividerClass}`}>
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <span className={`font-semibold shrink-0 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            Max Price: <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${filters.maxPrice.toLocaleString()}</span>
          </span>
          <input
            type="range"
            min="1000"
            max="6000"
            step="100"
            value={filters.maxPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
            className={`w-full cursor-pointer ${isDark ? 'accent-rose-500' : 'accent-boston-brick'}`}
          />
        </div>

        {/* Move-In Now Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, availableNow: !prev.availableNow }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filters.availableNow
                ? isDark
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-boston-brick text-white border-boston-brick shadow-sm'
                : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : isWarm
                ? 'bg-[#FAF8F5] text-stone-700 border-[#DDD7C9] hover:bg-[#EDE8DC]'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Move-In Now Only</span>
          </button>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className={`font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Showing <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{filteredCount}</span> of {totalCount} Boston listings
          </div>

          {isFiltered && (
            <button
              onClick={handleReset}
              className={`flex items-center gap-1 text-xs hover:underline font-semibold ${
                isDark ? 'text-rose-400' : 'text-boston-brick'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
