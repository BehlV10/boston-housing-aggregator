import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Bed, 
  Bath, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Maximize2, 
  Calendar, 
  Home, 
  DoorClosed, 
  Repeat,
  Clock,
  Sparkles,
  Camera
} from 'lucide-react';
import { getRecencyMeta } from '../utils/dateUtils';

export default function ListingCard({ listing, isSelected, onSelect, onOpenDetails, theme = 'midnight' }) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const images = listing.images && listing.images.length > 0 ? listing.images : [];
  const recency = getRecencyMeta(listing.first_seen || listing.last_seen);

  const handlePrevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const isDark = theme === 'midnight';
  const isWarm = theme === 'warm';

  const getSourceBadgeColor = (source) => {
    if (isDark) {
      switch (source) {
        case 'zillow':
          return 'bg-blue-950/80 text-blue-300 border-blue-800';
        case 'apartments_com':
          return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
        case 'facebook':
          return 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
        case 'bostonpads':
          return 'bg-teal-950/80 text-teal-300 border-teal-800';
        case 'redfin':
          return 'bg-rose-950/80 text-rose-300 border-rose-800';
        case 'reddit':
          return 'bg-orange-950/80 text-orange-300 border-orange-800';
        case 'reit_direct':
          return 'bg-emerald-950/80 text-emerald-300 border-emerald-700';
        case 'bostonapartments':
          return 'bg-sky-950/80 text-sky-300 border-sky-800';
        case 'community':
          return 'bg-amber-950/80 text-amber-300 border-amber-700';
        default:
          return 'bg-purple-950/80 text-purple-300 border-purple-800';
      }
    }
    switch (source) {
      case 'zillow':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'apartments_com':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'facebook':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'bostonpads':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'redfin':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'reddit':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'reit_direct':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'bostonapartments':
        return 'bg-sky-50 text-sky-800 border-sky-300 font-semibold';
      case 'community':
        return 'bg-amber-50 text-amber-900 border-amber-300 font-bold';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const cardBorderClass = isSelected
    ? isDark
      ? 'border-rose-500 ring-2 ring-rose-500/50 shadow-lg shadow-rose-950/50'
      : isWarm
      ? 'border-boston-brick ring-2 ring-boston-brick shadow-md'
      : 'border-boston-brick ring-2 ring-boston-brick shadow-md'
    : isDark
    ? 'border-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-slate-950/60'
    : isWarm
    ? 'border-[#E3DFD5] hover:border-[#D5CFC3] hover:shadow-md'
    : 'border-gray-200 hover:border-gray-300 hover:shadow-md';

  const cardBgClass = isDark
    ? 'bg-[#131C31]'
    : isWarm
    ? 'bg-[#FCFBF8]'
    : 'bg-white';

  return (
    <div
      onClick={() => onSelect(listing)}
      className={`group ${cardBgClass} rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer flex flex-col ${cardBorderClass}`}
    >
      {/* Image Gallery */}
      <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
        {images.length > 0 && !imgError ? (
          <img
            src={images[currentImgIndex]}
            alt={listing.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/95 text-slate-400 gap-1.5 p-4 text-center">
            <Camera className="w-7 h-7 opacity-30 mb-0.5" />
            <span className="text-xs font-bold text-slate-300">No Photos Uploaded</span>
            <span className="text-[10px] text-slate-500">Lister provided text-only description</span>
          </div>
        )}

        {/* Carousel controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImg}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImg}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-medium text-white backdrop-blur-xs">
              {currentImgIndex + 1}/{images.length}
            </div>
          </>
        )}

        {/* Fee Badge & Availability */}
        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 flex flex-col gap-1 sm:gap-1.5 items-start max-w-[58%] z-10">
          {listing.has_broker_fee === false ? (
            <span className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-600 text-white shadow-md whitespace-nowrap">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              NO BROKER FEE
            </span>
          ) : listing.has_broker_fee === true ? (
            <span className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-blue-600 text-white shadow-md whitespace-nowrap">
              <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              BROKER FEE
            </span>
          ) : (
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-gray-900/80 backdrop-blur-sm text-gray-200 shadow-md whitespace-nowrap">
              Fee Unspecified
            </span>
          )}

          {listing.availability && listing.availability !== 'Contact Lister' && (
            <span className={`flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold shadow-md backdrop-blur-sm border truncate max-w-full ${
              isDark
                ? 'bg-slate-900/90 text-slate-100 border-slate-700'
                : 'bg-white/95 text-gray-800 border-gray-100'
            }`}>
              <Calendar className="w-3 h-3 text-boston-brick shrink-0" />
              <span className="truncate">{listing.availability}</span>
            </span>
          )}
        </div>

        {/* Source & Type Badge */}
        <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 flex flex-col gap-1 items-end max-w-[40%] z-10">
          <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider border shadow-sm backdrop-blur-sm truncate max-w-full ${getSourceBadgeColor(listing.source)}`}>
            {listing.source_label}
          </span>
          {listing.cross_posted_sources && listing.cross_posted_sources.length > 1 && (
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold shadow-sm backdrop-blur-sm border truncate max-w-full ${
              isDark
                ? 'bg-purple-950/90 text-purple-300 border-purple-800'
                : 'bg-white/95 text-purple-800 border-purple-200'
            }`}>
              +{listing.cross_posted_sources.length - 1} other{listing.cross_posted_sources.length > 2 ? 's' : ''}
            </span>
          )}
          {listing.rental_type === 'sublet' ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-amber-500 text-white shadow-sm">
              <Repeat className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              Sublet
            </span>
          ) : listing.rental_type === 'room' ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-indigo-600 text-white shadow-sm">
              <DoorClosed className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              Single Room
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs shadow-sm">
              <Home className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              Condo / Apt
            </span>
          )}
        </div>

        {/* Recency Time Badge on Image */}
        <div className="absolute bottom-2 left-2.5 z-10 flex items-center gap-1.5">
          {recency.isNew ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600/95 text-white backdrop-blur-xs shadow-md">
              <Sparkles className="w-2.5 h-2.5" />
              New ({recency.label})
            </span>
          ) : recency.isOutdated ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-950/85 text-amber-300 border border-amber-700/60 backdrop-blur-xs shadow-md">
              <Clock className="w-2.5 h-2.5" />
              {recency.label} (Older post)
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/70 text-slate-200 backdrop-blur-xs shadow-md">
              <Clock className="w-2.5 h-2.5" />
              {recency.label}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price and Neighborhood */}
          <div className="flex items-baseline justify-between mb-1.5 flex-wrap gap-1">
            <div className={`text-2xl font-extrabold tracking-tight flex items-baseline gap-1.5 flex-wrap ${
              isDark ? 'text-white' : isWarm ? 'text-stone-900' : 'text-gray-900'
            }`}>
              <span>${listing.price?.toLocaleString()}</span>
              <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>/month</span>
              {listing.original_rate_note && (
                <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded border ${
                  isDark
                    ? 'text-rose-400 bg-rose-950/40 border-rose-800/50'
                    : 'text-boston-brick bg-boston-brick/10 border-boston-brick/20'
                }`} title="Converted to monthly rent for accurate comparison">
                  {listing.original_rate_note}
                </span>
              )}
            </div>
          </div>

          <h3 className={`font-semibold text-sm line-clamp-1 mb-1 transition-colors ${
            isDark
              ? 'text-slate-100 group-hover:text-rose-400'
              : isWarm
              ? 'text-stone-900 group-hover:text-boston-brick'
              : 'text-gray-900 group-hover:text-boston-brick'
          }`}>
            {listing.title}
          </h3>

          <div className={`flex items-center text-xs gap-1 mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            <MapPin className="w-3.5 h-3.5 opacity-60 shrink-0" />
            <span className="line-clamp-1">
              {listing.borough && listing.neighborhood && !listing.neighborhood.toLowerCase().includes(listing.borough.toLowerCase())
                ? `${listing.neighborhood}, ${listing.borough}`
                : listing.neighborhood || listing.address}
            </span>
          </div>

          {/* Details specs */}
          <div className={`flex items-center gap-3 text-xs font-medium py-2 border-y mb-3 flex-wrap ${
            isDark
              ? 'text-slate-300 border-slate-800/80'
              : isWarm
              ? 'text-stone-700 border-[#EFECE4]'
              : 'text-gray-700 border-gray-100'
          }`}>
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 opacity-60" />
              <span>{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} Bed`}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 opacity-60" />
              <span>{listing.bathrooms} Bath</span>
            </div>
            {listing.sqft && (
              <div className="flex items-center gap-1.5 font-semibold">
                <Maximize2 className="w-3.5 h-3.5 opacity-60" />
                <span>{listing.sqft.toLocaleString()} sq ft</span>
              </div>
            )}
            {listing.fee_details && !listing.sqft && (
              <div className={`text-[11px] line-clamp-1 italic max-w-[130px] ${
                isDark ? 'text-slate-500' : 'text-gray-500'
              }`}>
                {listing.fee_details}
              </div>
            )}
            <div className={`flex items-center gap-1 text-[11px] font-medium ml-auto ${
              recency.isNew
                ? 'text-emerald-500 font-bold'
                : recency.isOutdated
                ? 'text-amber-500'
                : isDark ? 'text-slate-400' : 'text-gray-500'
            }`}>
              <Clock className="w-3 h-3 opacity-70" />
              <span>{recency.label}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(listing);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : isWarm
                ? 'bg-[#EFECE4] hover:bg-[#E5E0D5] text-stone-800'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            Details
          </button>
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              isDark
                ? 'bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white'
                : 'bg-boston-brick/10 hover:bg-boston-brick text-boston-brick hover:text-white'
            }`}
            title={`Open listing on ${listing.source_label}`}
          >
            <span>Original</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
