import React from 'react';
import { Search, RotateCcw, Filter, ShieldCheck, DollarSign } from 'lucide-react';

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

  const handleReset = () => {
    setFilters({
      search: '',
      fee: 'all',
      source: 'all',
      bedrooms: 'all',
      maxPrice: 6000,
    });
  };

  const isFiltered =
    filters.search !== '' ||
    filters.fee !== 'all' ||
    filters.source !== 'all' ||
    filters.bedrooms !== 'all' ||
    filters.maxPrice < 6000;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Back Bay, Fenway, Harvard..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-boston-brick focus:border-transparent transition-all"
          />
        </div>

        {/* Fee Filter Buttons */}
        <div className="md:col-span-4 flex items-center bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => handleFeeChange('all')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filters.fee === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Listings
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
        <div className="md:col-span-2">
          <select
            value={filters.bedrooms}
            onChange={(e) => handleBedroomsChange(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-boston-brick"
          >
            <option value="all">Beds: Any</option>
            <option value="0">Studio</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3+ Bedrooms</option>
          </select>
        </div>

        {/* Source Select */}
        <div className="md:col-span-2">
          <select
            value={filters.source}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-boston-brick"
          >
            <option value="all">Platform: All</option>
            <option value="craigslist">Craigslist</option>
            <option value="bostonpads">Boston Pads</option>
            <option value="zillow">Zillow</option>
            <option value="facebook">FB Marketplace</option>
            <option value="redfin">Redfin</option>
          </select>
        </div>
      </div>

      {/* Second Row: Max Price Slider and Summary */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
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
