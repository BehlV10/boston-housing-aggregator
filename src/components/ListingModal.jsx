import React, { useState } from 'react';
import { X, ExternalLink, Bed, Bath, MapPin, ShieldCheck, AlertCircle, Calendar, Maximize2, Clock, Sparkles } from 'lucide-react';
import { getRecencyMeta } from '../utils/dateUtils';

export default function ListingModal({ listing, onClose, theme = 'midnight' }) {
  if (!listing) return null;

  const recency = getRecencyMeta(listing.first_seen || listing.last_seen);
  const [activeImage, setActiveImage] = useState(
    listing.images && listing.images.length > 0 ? listing.images[0] : null
  );

  const isDark = theme === 'midnight';
  const isWarm = theme === 'warm';

  const modalBg = isDark
    ? 'bg-[#0F172A] border border-slate-800 text-slate-100 shadow-2xl shadow-slate-950/80'
    : isWarm
    ? 'bg-[#FCFBF8] border border-[#E3DFD5] text-stone-900 shadow-2xl'
    : 'bg-white text-gray-900 shadow-2xl';

  const cardInset = isDark
    ? 'bg-[#131C31] border border-slate-800/80 text-slate-200'
    : isWarm
    ? 'bg-[#F7F5EE] border border-[#EFECE4] text-stone-800'
    : 'bg-gray-50 border border-gray-100 text-gray-800';

  const divider = isDark ? 'border-slate-800' : isWarm ? 'border-[#EFECE4]' : 'border-gray-100';

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative rounded-t-3xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto flex flex-col ${modalBg}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 bg-white/40 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header / Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white transition-colors backdrop-blur-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Hero */}
        <div className="relative h-64 sm:h-96 md:h-[440px] w-full bg-gray-950 overflow-hidden shrink-0 mt-2 sm:mt-0">
          {activeImage ? (
            <img
              src={activeImage}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              No Photos Available
            </div>
          )}

          {/* Badges on Hero */}
          <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
            {listing.has_broker_fee === false ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-lg">
                <ShieldCheck className="w-4 h-4" />
                NO BROKER FEE
              </span>
            ) : listing.has_broker_fee === true ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-lg">
                <AlertCircle className="w-4 h-4" />
                BROKER FEE
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-900/80 text-white backdrop-blur-sm">
                Fee Unspecified
              </span>
            )}
            {listing.availability && listing.availability !== 'Contact Lister' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-gray-900 shadow-lg">
                <Calendar className="w-4 h-4 text-boston-brick" />
                {listing.availability}
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-sm shadow-lg ${
              listing.rental_type === 'sublet'
                ? 'bg-amber-500 text-white'
                : listing.rental_type === 'room'
                ? 'bg-indigo-600 text-white'
                : 'bg-white/90 text-gray-800'
            }`}>
              {listing.rental_type === 'sublet' ? 'Sublet' : listing.rental_type === 'room' ? 'Single Room' : 'Condo / Apt'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-white/90 text-gray-800 backdrop-blur-sm shadow-lg">
              {listing.source_label}
            </span>
          </div>
        </div>

        {/* Thumbnail Strip */}
        {listing.images && listing.images.length > 1 && (
          <div className={`flex gap-2 p-3 border-b overflow-x-auto ${cardInset}`}>
            {listing.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  activeImage === img
                    ? 'border-rose-500 scale-105 shadow-md'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 md:p-8 flex-1">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mb-4">
            <div>
              <div className={`text-3xl font-extrabold flex items-baseline gap-2 flex-wrap ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                <span>${listing.price?.toLocaleString()}</span>
                <span className={`text-sm font-normal ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>/ month</span>
                {listing.original_rate_note && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${
                    isDark
                      ? 'text-rose-400 bg-rose-950/40 border-rose-800/50'
                      : 'text-boston-brick bg-boston-brick/10 border-boston-brick/20'
                  }`} title="Converted to monthly rent for comparison">
                    {listing.original_rate_note}
                  </span>
                )}
              </div>
              <h2 className={`text-xl font-bold mt-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{listing.title}</h2>
              <div className={`flex items-center text-sm gap-1.5 mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                <MapPin className="w-4 h-4 opacity-60" />
                <span>
                  {listing.address || (listing.borough && listing.neighborhood ? `${listing.neighborhood}, ${listing.borough}` : listing.neighborhood) || 'Location Available'}
                </span>
              </div>
            </div>

            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-6 bg-boston-brick hover:bg-rose-900 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shrink-0"
            >
              <span>View on {listing.source_label}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Quick Specs */}
          <div className={`grid grid-cols-2 sm:grid-cols-5 gap-2.5 py-4 border-y my-4 text-center ${divider}`}>
            <div className={`p-3 rounded-2xl ${cardInset}`}>
              <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Bedrooms</div>
              <div className={`text-lg font-bold flex items-center justify-center gap-1.5 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <Bed className="w-4 h-4 opacity-60" />
                {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} Bed`}
              </div>
            </div>
            <div className={`p-3 rounded-2xl ${cardInset}`}>
              <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Bathrooms</div>
              <div className={`text-lg font-bold flex items-center justify-center gap-1.5 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <Bath className="w-4 h-4 opacity-60" />
                {listing.bathrooms} Bath
              </div>
            </div>
            <div className={`p-3 rounded-2xl ${cardInset}`}>
              <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Living Area</div>
              <div className={`text-lg font-bold flex items-center justify-center gap-1.5 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <Maximize2 className="w-4 h-4 opacity-60" />
                {listing.sqft ? `${listing.sqft.toLocaleString()} sq ft` : 'Unspecified'}
              </div>
            </div>
            <div className={`p-3 rounded-2xl ${cardInset}`}>
              <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Fee Policy</div>
              <div className={`text-sm font-bold line-clamp-1 mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {listing.fee_badge}
              </div>
            </div>
            <div className={`p-3 rounded-2xl ${cardInset}`}>
              <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Posted</div>
              <div className={`text-sm font-bold flex items-center justify-center gap-1 mt-1 ${
                recency.isNew
                  ? 'text-emerald-400'
                  : recency.isOutdated
                  ? 'text-amber-400'
                  : isDark ? 'text-white' : 'text-gray-800'
              }`} title={recency.formattedDate ? `First seen: ${recency.formattedDate}` : undefined}>
                {recency.isNew ? <Sparkles className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 opacity-60" />}
                <span>{recency.label}</span>
              </div>
            </div>
          </div>

          {/* Outdated Advisory Warning if older than 2 weeks */}
          {recency.isOutdated && (
            <div className={`p-3.5 rounded-2xl mb-4 text-xs flex items-center gap-2.5 border ${
              isDark
                ? 'bg-amber-950/30 text-amber-300 border-amber-800/50'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}>
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Freshness Note:</strong> This listing was posted over 2 weeks ago ({recency.label}). Rental market listings this old may already be leased; contact the lister to confirm availability.
              </span>
            </div>
          )}

          {/* Fee Insight Box */}
          {listing.fee_details && (
            <div className={`p-4 rounded-2xl mb-6 text-sm flex items-start gap-3 border ${
              listing.has_broker_fee === false
                ? isDark
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-100'
                : isDark
                ? 'bg-blue-950/40 text-blue-300 border-blue-800/60'
                : 'bg-blue-50 text-blue-900 border-blue-100'
            }`}>
              {listing.has_broker_fee === false ? (
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">Broker Fee Information</div>
                <div className="text-xs mt-0.5 opacity-90">{listing.fee_details}</div>
              </div>
            </div>
          )}

          {/* Cross-Posted Sources Banner */}
          {listing.cross_posted_sources && listing.cross_posted_sources.length > 1 && (
            <div className={`p-3.5 rounded-2xl mb-6 border flex items-center justify-between text-xs ${
              isDark
                ? 'bg-purple-950/40 text-purple-300 border-purple-800/60'
                : 'bg-purple-50 text-purple-900 border-purple-100'
            }`}>
              <span className="font-semibold">Also discovered on other platforms:</span>
              <div className="flex gap-1.5 flex-wrap">
                {listing.cross_posted_sources.filter(s => s !== listing.source_label).map((s, idx) => (
                  <span key={idx} className={`px-2 py-0.5 rounded-md font-bold shadow-xs border ${
                    isDark
                      ? 'bg-purple-900/60 border-purple-700 text-purple-200'
                      : 'bg-white border-purple-200 text-purple-800'
                  }`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className={`font-bold text-sm mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Description</h3>
            <p className={`text-sm leading-relaxed whitespace-pre-line p-4 rounded-2xl border ${
              isDark
                ? 'text-slate-300 bg-slate-900/60 border-slate-800'
                : 'text-gray-600 bg-gray-50/70 border-gray-100'
            }`}>
              {listing.description || 'No description provided in original post.'}
            </p>
          </div>

          {/* Quick Lookup Links */}
          <div className="mt-4 pt-3 border-t border-slate-700/30 flex items-center gap-2 flex-wrap text-xs">
            <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Verify Location:</span>
            {listing.lat && listing.lng && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${listing.lat},${listing.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:text-black'
                }`}
              >
                <span>Google Maps / Street View</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}
            <a
              href={`https://streeteasy.com/search?q=${encodeURIComponent(listing.address || listing.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                isDark ? 'bg-slate-800 border-slate-700 text-sky-400 hover:text-sky-300' : 'bg-sky-50 border-sky-200 text-sky-700 hover:text-sky-900'
              }`}
            >
              <span>Look up on StreetEasy</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* Sticky Mobile Bottom Bar */}
        <div className={`p-4 border-t sticky bottom-0 z-30 flex items-center justify-between gap-3 sm:hidden backdrop-blur-md shrink-0 ${
          isDark ? 'bg-slate-900/95 border-slate-800' : isWarm ? 'bg-[#FCFBF8]/95 border-[#E3DFD5]' : 'bg-white/95 border-gray-200'
        }`}>
          <div>
            <div className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${listing.price?.toLocaleString()}
              <span className="text-xs font-normal opacity-70">/mo</span>
            </div>
            <div className="text-[11px] opacity-75">{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} Bed`} &bull; {listing.fee_badge}</div>
          </div>
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 bg-boston-brick text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
          >
            <span>View on {listing.source_label}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
