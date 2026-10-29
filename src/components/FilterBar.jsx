import React from 'react';
import { Search, RotateCcw, Filter, ShieldCheck, DollarSign, Calendar, Home, DoorClosed, Repeat } from 'lucide-react';

export default function FilterBar({ filters, setFilters, totalCount, filteredCount }) {
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
      availableNow: false,
      maxPrice: 6000,
    });
  };

  const isFiltered =
    filters.search !== '' ||
    filters.fee !== 'all' ||
    filters.source !== 'all' ||
    filters.bedrooms !== 'all' ||
    filters.rentalType !== 'all' ||
    filters.availableNow ||
    filters.maxPrice < 6000;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
        {/* Search Input */}
        <div className="md:col-span-3 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Cambridge, Somerville, Back Bay..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-boston-brick focus:border-transparent transition-all"
          />
        </div>

        {/* Place Type: All | Full Condo / Apt | Single Room | Sublet */}
        <div className="md:col-span-4 flex items-center bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => handleRentalTypeChange('all')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filters.rentalType === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleRentalTypeChange('entire_unit')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
              filters.rentalType === 'entire_unit'
                ? 'bg-white text-boston-navy shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Condo/Apt
          </button>
          <button
            onClick={() => handleRentalTypeChange('room')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
              filters.rentalType === 'room'
                ? 'bg-indigo-600 text-white shadow-sm'
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
                : 'text-gray-600 hover:text-amber-700'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            Sublet
          </button>
        </div>

        {/* Fee Filter Buttons */}
        <div className="md:col-span-3 flex items-center bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => handleFeeChange('all')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filters.fee === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Fees
          </button>
          <button
            onClick={() => handleFeeChange('no-fee')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
              filters.fee === 'no-fee'
                ? 'bg-emerald-600 text-white shadow-sm'
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
                : 'text-gray-600 hover:text-blue-700'
            }`}
          >
            Broker Fee
          </button>
        </div>

        {/* Bedroom Select */}
        <div className="md:col-span-1 col-span-6">
          <select
            value={filters.bedrooms}
            onChange={(e) => handleBedroomsChange(e.target.value)}
            className="w-full py-2 px-1 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-boston-brick"
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
            className="w-full py-2 px-1 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-boston-brick"
          >
            <option value="all">Source: All</option>
            <option value="craigslist">Craigslist</option>
            <option value="bostonpads">Boston Pads</option>
            <option value="reddit">Reddit</option>
            <option value="zillow">Zillow</option>
            <option value="facebook">FB Mkt</option>
            <option value="redfin">Redfin</option>
          </select>
        </div>
      </div>

      {/* Quick Location Pills: Cambridge, Somerville, Boston, Brookline, Allston */}
      <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
        <span className="text-gray-500 font-semibold shrink-0 mr-1">Quick Area:</span>
        {['All', 'Cambridge', 'Somerville', 'Boston', 'Brookline', 'Allston', 'Fenway'].map((area) => {
          const isActive = area === 'All' ? filters.search === '' : filters.search.toLowerCase() === area.toLowerCase();
          return (
            <button
              key={area}
              onClick={() => setFilters((prev) => ({ ...prev, search: area === 'All' ? '' : area }))}
              className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-all ${
                isActive
                  ? 'bg-boston-brick text-white shadow-xs font-bold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {area}
            </button>
          );
        })}
      </div>

      {/* Second Row: Max Price Slider and Summary */}
      <div className="mt-2 pt-2.5 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <span className="font-semibold text-gray-600 shrink-0">
            Max Price: <span className="text-gray-900 font-bold">${filters.maxPrice.toLocaleString()}</span>
          </span>
          <input
            type="range"
            min="1000"
            max="6000"
            step="100"
            value={filters.maxPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
            className="w-full accent-boston-brick cursor-pointer"
          />
        </div>

        {/* Move-In Now Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, availableNow: !prev.availableNow }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filters.availableNow
                ? 'bg-boston-brick text-white border-boston-brick shadow-sm'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Move-In Now Only</span>
          </button>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">{filteredCount}</span> of {totalCount} Boston listings
          </div>

          {isFiltered && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-boston-brick hover:underline font-semibold"
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
