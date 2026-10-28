import React, { useState, useEffect, useMemo } from 'react';
import { Home, Map as MapIcon, List as ListIcon, RefreshCw, Sparkles, Building2, ExternalLink } from 'lucide-react';
import MapView from './components/MapView';
import ListingCard from './components/ListingCard';
import FilterBar from './components/FilterBar';
import ListingModal from './components/ListingModal';

export default function App() {
  const [listings, setListings] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalListing, setModalListing] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split' on desktop, 'map' or 'list' on mobile
  const [sortBy, setSortBy] = useState('price-asc');

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    fee: 'all', // 'all' | 'no-fee' | 'fee'
    source: 'all', // 'all' | 'craigslist' | 'zillow' | 'facebook' | 'bostonpads' | 'redfin'
    bedrooms: 'all',
    rentalType: 'all', // 'all' | 'entire_unit' | 'room'
    availableNow: false,
    maxPrice: 6000,
  });

  // Load aggregated listings
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Using relative path for GitHub Pages compatibility
        const listingsRes = await fetch('./data/listings.json');
        if (listingsRes.ok) {
          const data = await listingsRes.json();
          setListings(data);
        }

        const metaRes = await fetch('./data/metadata.json');
        if (metaRes.ok) {
          const meta = await metaRes.json();
          setMetadata(meta);
        }
      } catch (err) {
        console.error('Failed to load listings data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

        // Available Now filter
        if (filters.availableNow && item.availability !== 'Available Now') {
          return false;
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
          const matchDesc = item.description?.toLowerCase().includes(query);
          if (!matchTitle && !matchNeigh && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
        return 0;
      });
  }, [listings, filters, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-boston-brick flex items-center justify-center text-white shadow-md shadow-boston-brick/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">Greater Boston Rentals Hub</h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-boston-gold/20 text-yellow-800 uppercase tracking-wider">
                  Aggregator MVP
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Boston &bull; Cambridge &bull; Somerville &bull; Brookline &bull; Allston
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {metadata && (
              <div className="hidden lg:flex items-center gap-2.5 text-xs text-gray-600 bg-gray-100 py-1.5 px-3.5 rounded-full border border-gray-200">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-emerald-700">{metadata.no_fee_count} No-Fee</span>
                </span>
                <span className="text-gray-300">&bull;</span>
                <span>{metadata.entire_count || 0} Condos</span>
                <span className="text-gray-300">&bull;</span>
                <span className="text-indigo-600 font-semibold">{metadata.room_count || 0} Rooms</span>
                <span className="text-gray-300">&bull;</span>
                <span className="text-amber-600 font-semibold">{metadata.sublet_count || 0} Sublets</span>
              </div>
            )}

            {/* Mobile View Toggle */}
            <div className="flex md:hidden bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-lg text-xs font-semibold ${
                  viewMode === 'map' ? 'bg-white shadow-sm text-boston-brick' : 'text-gray-600'
                }`}
              >
                <MapIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-semibold ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-boston-brick' : 'text-gray-600'
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* Filter Controls */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          totalCount={listings.length}
          filteredCount={filteredListings.length}
        />

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-boston-brick" />
            <p className="font-semibold text-sm">Loading Boston listings...</p>
          </div>
        ) : (
          /* Split View Layout */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
            {/* Interactive Map (Left Panel, 7 cols on desktop) */}
            <div
              className={`lg:col-span-7 h-[500px] lg:h-[720px] lg:sticky lg:top-24 rounded-2xl overflow-hidden ${
                viewMode === 'list' ? 'hidden lg:block' : 'block'
              }`}
            >
              <MapView
                listings={filteredListings}
                selectedListing={selectedListing}
                onSelectListing={(listing) => {
                  setSelectedListing(listing);
                  // Scroll card into view if needed
                  const el = document.getElementById(`card-${listing.id}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }
                }}
              />
            </div>

            {/* Listings Grid (Right Panel, 5 cols on desktop) */}
            <div
              className={`lg:col-span-5 flex flex-col gap-4 overflow-y-auto max-h-[720px] pr-1 ${
                viewMode === 'map' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* Sort header */}
              <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
                <span>{filteredListings.length} apartments found</span>
                <div className="flex items-center gap-1.5">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer"
                  >
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {filteredListings.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-gray-200">
                  <p className="text-gray-500 font-medium text-sm">No listings match your filters.</p>
                  <button
                    onClick={() =>
                      setFilters({
                        search: '',
                        fee: 'all',
                        source: 'all',
                        bedrooms: 'all',
                        maxPrice: 6000,
                      })
                    }
                    className="mt-3 text-xs text-boston-brick font-bold hover:underline"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                filteredListings.map((listing) => (
                  <div id={`card-${listing.id}`} key={listing.id}>
                    <ListingCard
                      listing={listing}
                      isSelected={selectedListing?.id === listing.id}
                      onSelect={(item) => setSelectedListing(item)}
                      onOpenDetails={(item) => setModalListing(item)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Listing Details Modal */}
      {modalListing && (
        <ListingModal listing={modalListing} onClose={() => setModalListing(null)} />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            &copy; {new Date().getFullYear()} Boston Rentals Aggregator &bull; Open Source Flat-File Architecture
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Deployed on GitHub Pages</span>
            <span>&bull;</span>
            <span className="text-gray-400">Updated via GitHub Actions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
