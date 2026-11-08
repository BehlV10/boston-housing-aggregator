import React, { useState } from 'react';
import { ExternalLink, Compass, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export default function ExternalPortalsBar({ city = 'nyc', filters, theme = 'midnight' }) {
  const [expanded, setExpanded] = useState(false);

  const isDark = theme === 'midnight';
  const isWarm = theme === 'warm';

  // Build dynamic deep links based on active filters
  const searchQuery = (filters.search || '').trim();
  const maxPrice = filters.maxPrice || (city === 'nyc' ? 8000 : 6000);
  const isNoFee = filters.fee === 'no-fee';
  const beds = filters.bedrooms !== 'all' ? filters.bedrooms : '';

  // NYC Portals
  const nycPortals = [
    {
      name: 'StreetEasy',
      shortName: 'StreetEasy',
      domain: 'streeteasy.com',
      badge: 'MLS Direct',
      color: 'hover:border-blue-500 hover:text-blue-400',
      pillColor: isDark ? 'bg-blue-950/60 text-blue-300 border-blue-800/60' : 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'NYC\'s primary MLS aggregator for high-rise, brownstone & broker listings.',
      getUrl: () => {
        let base = 'https://streeteasy.com/for-rent/nyc';
        const params = [];
        if (maxPrice) params.push(`price:0-${maxPrice}`);
        if (beds) params.push(`beds:${beds}`);
        if (isNoFee) params.push('no_fee:1');
        return params.length > 0 ? `${base}/${params.join('|')}` : base;
      }
    },
    {
      name: 'RentHop',
      shortName: 'RentHop',
      domain: 'renthop.com',
      badge: 'HopScore',
      color: 'hover:border-emerald-500 hover:text-emerald-400',
      pillColor: isDark ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'HopScore algorithm ranks accurate NYC listings and flags stale brokers.',
      getUrl: () => {
        const query = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
        const fee = isNoFee ? '&fee=0' : '';
        return `https://www.renthop.com/search/nyc?min_price=500&max_price=${maxPrice}${query}${fee}`;
      }
    },
    {
      name: 'Leasebreak',
      shortName: 'Leasebreak',
      domain: 'leasebreak.com',
      badge: 'Sublets',
      color: 'hover:border-amber-500 hover:text-amber-400',
      pillColor: isDark ? 'bg-amber-950/60 text-amber-300 border-amber-800/60' : 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'NYC\'s leading marketplace for short-term sublets, room shares & lease takeovers.',
      getUrl: () => 'https://www.leasebreak.com/short-term-rentals-nyc'
    },
    {
      name: 'Listings Project',
      shortName: 'ListingsProject',
      domain: 'listingsproject.com',
      badge: 'Vetted',
      color: 'hover:border-purple-500 hover:text-purple-400',
      pillColor: isDark ? 'bg-purple-950/60 text-purple-300 border-purple-800/60' : 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Curated weekly housing bulletin for creatives, artists & direct by-owner sublets.',
      getUrl: () => 'https://www.listingsproject.com/'
    },
    {
      name: 'Roomi',
      shortName: 'Roomi',
      domain: 'roomiapp.com',
      badge: 'Rooms',
      color: 'hover:border-indigo-500 hover:text-indigo-400',
      pillColor: isDark ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60' : 'bg-indigo-50 text-indigo-700 border-indigo-200',
      description: 'Background-checked roommates and verified single rooms across NYC.',
      getUrl: () => 'https://roomiapp.com/rooms-for-rent/new-york-ny'
    },
    {
      name: 'FB Marketplace',
      shortName: 'FB Mkt',
      domain: 'facebook.com',
      badge: 'By-Owner',
      color: 'hover:border-sky-500 hover:text-sky-400',
      pillColor: isDark ? 'bg-sky-950/60 text-sky-300 border-sky-800/60' : 'bg-sky-50 text-sky-700 border-sky-200',
      description: 'Active tenant relets and roommate searches with pre-filtered search criteria.',
      getUrl: () => {
        const query = searchQuery ? `&query=${encodeURIComponent(searchQuery)}` : '';
        return `https://www.facebook.com/marketplace/nyc/propertyrentals?maxPrice=${maxPrice}${query}`;
      }
    }
  ];

  // Boston Portals
  const bostonPortals = [
    {
      name: 'Boston Pads',
      shortName: 'Boston Pads',
      domain: 'bostonpads.com',
      badge: 'Local MLS',
      color: 'hover:border-rose-500 hover:text-rose-400',
      pillColor: isDark ? 'bg-rose-950/60 text-rose-300 border-rose-800/60' : 'bg-rose-50 text-rose-700 border-rose-200',
      description: 'The real-time database powering local agencies across Greater Boston.',
      getUrl: () => 'https://bostonpads.com/boston-apartments/'
    },
    {
      name: 'Zillow Boston',
      shortName: 'Zillow',
      domain: 'zillow.com',
      badge: 'Managed',
      color: 'hover:border-blue-500 hover:text-blue-400',
      pillColor: isDark ? 'bg-blue-950/60 text-blue-300 border-blue-800/60' : 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'High-rise managed communities and luxury developments.',
      getUrl: () => 'https://www.zillow.com/boston-ma/rentals/'
    },
    {
      name: 'Apartments.com',
      shortName: 'Apartments.com',
      domain: 'apartments.com',
      badge: 'Verified',
      color: 'hover:border-emerald-500 hover:text-emerald-400',
      pillColor: isDark ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Major institutional apartment complexes across Cambridge, Somerville & Boston.',
      getUrl: () => 'https://www.apartments.com/boston-ma/'
    },
    {
      name: 'Redfin Boston',
      shortName: 'Redfin',
      domain: 'redfin.com',
      badge: 'MLS Direct',
      color: 'hover:border-red-500 hover:text-red-400',
      pillColor: isDark ? 'bg-red-950/60 text-red-300 border-red-800/60' : 'bg-red-50 text-red-700 border-red-200',
      description: 'Direct MLS IDX rental search with map overlays and transit scores.',
      getUrl: () => 'https://www.redfin.com/city/1826/MA/Boston/apartments-for-rent'
    },
    {
      name: 'FB Marketplace',
      shortName: 'FB Mkt',
      domain: 'facebook.com',
      badge: 'By-Owner',
      color: 'hover:border-sky-500 hover:text-sky-400',
      pillColor: isDark ? 'bg-sky-950/60 text-sky-300 border-sky-800/60' : 'bg-sky-50 text-sky-700 border-sky-200',
      description: 'Student sublets and off-campus housing from BU, NEU, Harvard & MIT.',
      getUrl: () => {
        const query = searchQuery ? `&query=${encodeURIComponent(searchQuery)}` : '';
        return `https://www.facebook.com/marketplace/boston/propertyrentals?maxPrice=${maxPrice}${query}`;
      }
    }
  ];

  const portals = city === 'nyc' ? nycPortals : bostonPortals;

  return (
    <div
      className={`rounded-2xl border px-3 py-2 sm:px-4 sm:py-2.5 mb-3.5 transition-all text-xs ${
        isDark
          ? 'bg-[#11192C]/80 border-slate-800 text-slate-300'
          : isWarm
          ? 'bg-[#FFFFFF]/90 border-[#E2DDD2] text-stone-700'
          : 'bg-white border-gray-200 text-gray-700'
      }`}
    >
      {/* Sleek 1-line launcher row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-boston-brick/15 text-boston-brick flex items-center justify-center shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-[11px] sm:text-xs tracking-tight whitespace-nowrap">
            1-Click External Portals:
          </span>
        </div>

        {/* Horizontal scrollable quick link pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-[200px]">
          {portals.map((portal) => (
            <a
              key={portal.name}
              href={portal.getUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold border transition-all shrink-0 shadow-2xs ${portal.pillColor} ${portal.color}`}
              title={`Open ${portal.name} pre-filtered under $${maxPrice.toLocaleString()}`}
            >
              <span>{portal.shortName}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          ))}
        </div>

        {/* Small toggle button to inspect full descriptions if desired */}
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all shrink-0 ${
            isDark
              ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'
          }`}
          title="Toggle portal descriptions"
        >
          <span>{expanded ? 'Hide Info' : 'Details'}</span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expanded Details Drawer (Only when user explicitly clicks 'Details') */}
      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2.5 pt-2.5 border-t border-dashed border-slate-700/40 animate-fade-in text-xs">
          {portals.map((portal) => (
            <a
              key={portal.name}
              href={portal.getUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between group ${
                isDark
                  ? 'bg-[#0B1120] border-slate-800 hover:bg-slate-900 text-slate-300'
                  : 'bg-gray-50 border-gray-200 hover:bg-white text-gray-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-xs flex items-center gap-1">
                    {portal.name}
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-boston-brick/15 text-boston-brick">
                    {portal.badge}
                  </span>
                </div>
                <p className="text-[10px] line-clamp-2 opacity-75">
                  {portal.description}
                </p>
              </div>
              <span className="text-[10px] font-semibold text-boston-brick mt-1.5 flex items-center gap-0.5">
                Open with filters &rarr;
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
