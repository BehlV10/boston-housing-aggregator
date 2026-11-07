import React, { useState } from 'react';
import { ExternalLink, Sparkles, Building2, ChevronDown, ChevronUp, Compass } from 'lucide-react';

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
      domain: 'streeteasy.com',
      badge: 'Agent & MLS Hub',
      badgeColor: 'bg-blue-600 text-white',
      accent: 'hover:border-blue-500',
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
      domain: 'renthop.com',
      badge: 'Verified Scores',
      badgeColor: 'bg-emerald-600 text-white',
      accent: 'hover:border-emerald-500',
      description: 'HopScore algorithm ranks accurate NYC listings and flags stale brokers.',
      getUrl: () => {
        const query = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
        const fee = isNoFee ? '&fee=0' : '';
        return `https://www.renthop.com/search/nyc?min_price=500&max_price=${maxPrice}${query}${fee}`;
      }
    },
    {
      name: 'Leasebreak',
      domain: 'leasebreak.com',
      badge: 'Sublets & Lease Breaks',
      badgeColor: 'bg-amber-500 text-white',
      accent: 'hover:border-amber-400',
      description: 'NYC\'s leading marketplace for short-term sublets, room shares & lease takeovers.',
      getUrl: () => {
        return 'https://www.leasebreak.com/short-term-rentals-nyc';
      }
    },
    {
      name: 'Listings Project',
      domain: 'listingsproject.com',
      badge: 'Community Vetted',
      badgeColor: 'bg-purple-600 text-white',
      accent: 'hover:border-purple-400',
      description: 'Curated weekly housing bulletin for creatives, artists & direct by-owner sublets.',
      getUrl: () => {
        return 'https://www.listingsproject.com/';
      }
    },
    {
      name: 'Roomi',
      domain: 'roomiapp.com',
      badge: 'Rooms & Roommates',
      badgeColor: 'bg-indigo-600 text-white',
      accent: 'hover:border-indigo-400',
      description: 'Background-checked roommates and verified single rooms across NYC.',
      getUrl: () => {
        return 'https://roomiapp.com/rooms-for-rent/new-york-ny';
      }
    },
    {
      name: 'FB Marketplace NYC',
      domain: 'facebook.com',
      badge: 'Direct By Owner',
      badgeColor: 'bg-sky-600 text-white',
      accent: 'hover:border-sky-400',
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
      domain: 'bostonpads.com',
      badge: 'Largest Local MLS',
      badgeColor: 'bg-rose-600 text-white',
      accent: 'hover:border-rose-500',
      description: 'The real-time database powering local agencies across Greater Boston.',
      getUrl: () => 'https://bostonpads.com/boston-apartments/'
    },
    {
      name: 'Zillow Boston',
      domain: 'zillow.com',
      badge: 'Floor Plans & 3D Tours',
      badgeColor: 'bg-blue-600 text-white',
      accent: 'hover:border-blue-500',
      description: 'High-rise managed communities and luxury developments.',
      getUrl: () => `https://www.zillow.com/boston-ma/rentals/`
    },
    {
      name: 'Apartments.com',
      domain: 'apartments.com',
      badge: 'Verified Availability',
      badgeColor: 'bg-emerald-600 text-white',
      accent: 'hover:border-emerald-500',
      description: 'Major institutional apartment complexes across Cambridge, Somerville & Boston.',
      getUrl: () => 'https://www.apartments.com/boston-ma/'
    },
    {
      name: 'Redfin Boston',
      domain: 'redfin.com',
      badge: 'MLS Direct',
      badgeColor: 'bg-red-600 text-white',
      accent: 'hover:border-red-500',
      description: 'Direct MLS IDX rental search with map overlays and transit scores.',
      getUrl: () => 'https://www.redfin.com/city/1826/MA/Boston/apartments-for-rent'
    },
    {
      name: 'FB Marketplace Boston',
      domain: 'facebook.com',
      badge: 'Direct By Owner',
      badgeColor: 'bg-sky-600 text-white',
      accent: 'hover:border-sky-400',
      description: 'Student sublets and off-campus housing from BU, NEU, Harvard & MIT.',
      getUrl: () => {
        const query = searchQuery ? `&query=${encodeURIComponent(searchQuery)}` : '';
        return `https://www.facebook.com/marketplace/boston/propertyrentals?maxPrice=${maxPrice}${query}`;
      }
    }
  ];

  const portals = city === 'nyc' ? nycPortals : bostonPortals;

  const containerClass = isDark
    ? 'bg-[#131C31]/70 border-slate-800 text-slate-200'
    : isWarm
    ? 'bg-[#FFFFFF]/90 border-[#E2DDD2] text-stone-800'
    : 'bg-white border-gray-200 text-gray-800';

  const cardClass = isDark
    ? 'bg-[#0B1120] border-slate-800/90 hover:bg-slate-900 text-slate-300 hover:text-white'
    : isWarm
    ? 'bg-[#FAF8F5] border-[#E8E4DA] hover:bg-white text-stone-700 hover:text-stone-900'
    : 'bg-gray-50 border-gray-200 hover:bg-white text-gray-700 hover:text-gray-900';

  return (
    <div className={`rounded-2xl border p-3 sm:p-4 shadow-sm mb-4 transition-all ${containerClass}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-boston-brick/20 text-boston-brick flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold tracking-tight">
                {city === 'nyc' ? '1-Click Launchers (StreetEasy, RentHop, Leasebreak, Roomi & FB)' : 'Explore Other Boston Portals (Zillow, Boston Pads, Redfin & FB)'}
              </h3>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Pre-Filtered to Your Search
              </span>
            </div>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Sites with anti-bot shields can be opened in 1 tap pre-filled with your current budget (under ${maxPrice.toLocaleString()}) {searchQuery ? `and "${searchQuery}"` : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            isDark
              ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
              : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-800'
          }`}
        >
          <span>{expanded ? 'Hide Portals' : 'View Portals'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Grid of 1-Click Portals */}
      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-dashed border-slate-700/40 animate-fade-in">
          {portals.map((portal) => (
            <a
              key={portal.name}
              href={portal.getUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between group shadow-xs ${cardClass} ${portal.accent}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                    <span>{portal.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shadow-2xs ${portal.badgeColor}`}>
                    {portal.badge}
                  </span>
                </div>
                <p className="text-[11px] line-clamp-2 opacity-80 mb-2">
                  {portal.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-semibold pt-1.5 border-t border-slate-800/40 opacity-70 group-hover:opacity-100">
                <span>{portal.domain}</span>
                <span className="text-boston-brick font-bold flex items-center gap-1">
                  Open with filters &rarr;
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
