import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bed, Bath, MapPin, ExternalLink, ShieldCheck, AlertCircle, Maximize2, Calendar, Home, DoorClosed, Repeat } from 'lucide-react';

export default function ListingCard({ listing, isSelected, onSelect, onOpenDetails }) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const images = listing.images && listing.images.length > 0 ? listing.images : [];

  const handlePrevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const getSourceBadgeColor = (source) => {
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
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <div
      onClick={() => onSelect(listing)}
      className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer flex flex-col ${
        isSelected
          ? 'border-boston-brick ring-2 ring-boston-brick shadow-lg'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Image Gallery */}
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
        {images.length > 0 ? (
          <img
            src={images[currentImgIndex]}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image Available
          </div>
        )}

        {/* Carousel controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImg}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/75 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImg}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/75 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-medium text-white">
              {currentImgIndex + 1}/{images.length}
            </div>
          </>
        )}

        {/* Fee Badge & Availability */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {listing.has_broker_fee === false ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              NO BROKER FEE
            </span>
          ) : listing.has_broker_fee === true ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md">
              <AlertCircle className="w-3.5 h-3.5" />
              BROKER FEE
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-800/80 backdrop-blur-sm text-gray-200 shadow-md">
              Fee Unspecified
            </span>
          )}

          {listing.availability && listing.availability !== 'Contact Lister' && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/95 text-gray-800 shadow-md backdrop-blur-sm border border-gray-100">
              <Calendar className="w-3 h-3 text-boston-brick" />
              {listing.availability}
            </span>
          )}
        </div>

        {/* Source & Type Badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-sm ${getSourceBadgeColor(listing.source)}`}>
            {listing.source_label}
          </span>
          {listing.rental_type === 'sublet' ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white shadow-sm">
              <Repeat className="w-3 h-3" />
              Sublet
            </span>
          ) : listing.rental_type === 'room' ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white shadow-sm">
              <DoorClosed className="w-3 h-3" />
              Single Room
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs shadow-sm">
              <Home className="w-3 h-3" />
              Condo / Apt
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price and Neighborhood */}
          <div className="flex items-baseline justify-between mb-1.5 flex-wrap gap-1">
            <div className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-baseline gap-1.5 flex-wrap">
              <span>${listing.price?.toLocaleString()}</span>
              <span className="text-xs font-normal text-gray-500">/month</span>
              {listing.original_rate_note && (
                <span className="text-[11px] font-semibold text-boston-brick bg-boston-brick/10 border border-boston-brick/20 px-1.5 py-0.5 rounded" title="Converted to monthly rent for accurate comparison">
                  {listing.original_rate_note}
                </span>
              )}
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1 group-hover:text-boston-brick transition-colors">
            {listing.title}
          </h3>

          <div className="flex items-center text-xs text-gray-500 gap-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="line-clamp-1">{listing.neighborhood || listing.address}</span>
          </div>

          {/* Details specs */}
          <div className="flex items-center gap-3 text-xs font-medium text-gray-700 py-2 border-y border-gray-100 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-gray-400" />
              <span>{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} Bed`}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-gray-400" />
              <span>{listing.bathrooms} Bath</span>
            </div>
            {listing.sqft && (
              <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                <span>{listing.sqft.toLocaleString()} sq ft</span>
              </div>
            )}
            {listing.fee_details && !listing.sqft && (
              <div className="text-[11px] text-gray-500 line-clamp-1 italic ml-auto max-w-[130px]">
                {listing.fee_details}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(listing);
            }}
            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Details
          </button>
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="py-2 px-3 bg-boston-brick/10 hover:bg-boston-brick text-boston-brick hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
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
