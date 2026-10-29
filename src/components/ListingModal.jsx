import React, { useState } from 'react';
import { X, ExternalLink, Bed, Bath, MapPin, ShieldCheck, AlertCircle, Calendar, Maximize2 } from 'lucide-react';

export default function ListingModal({ listing, onClose }) {
  if (!listing) return null;

  const [activeImage, setActiveImage] = useState(
    listing.images && listing.images.length > 0 ? listing.images[0] : null
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Hero */}
        <div className="relative h-80 sm:h-96 md:h-[440px] w-full bg-gray-900 overflow-hidden">
          {activeImage ? (
            <img
              src={activeImage}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Photos Available
            </div>
          )}

          {/* Badges on Hero */}
          <div className="absolute bottom-4 left-4 flex gap-2">
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
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800/80 text-white">
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
          <div className="flex gap-2 p-3 bg-gray-50 border-b border-gray-100 overflow-x-auto">
            {listing.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  activeImage === img ? 'border-boston-brick scale-105' : 'border-transparent opacity-70 hover:opacity-100'
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
              <div className="text-3xl font-extrabold text-gray-900 flex items-baseline gap-2 flex-wrap">
                <span>${listing.price?.toLocaleString()}</span>
                <span className="text-sm font-normal text-gray-500">/ month</span>
                {listing.original_rate_note && (
                  <span className="text-xs font-semibold text-boston-brick bg-boston-brick/10 border border-boston-brick/20 px-2 py-0.5 rounded-lg" title="Converted to monthly rent for comparison">
                    {listing.original_rate_note}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-1">{listing.title}</h2>
              <div className="flex items-center text-sm text-gray-500 gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{listing.address || listing.neighborhood || 'Boston, MA'}</span>
              </div>
            </div>

            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-6 bg-boston-brick hover:bg-red-900 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shrink-0"
            >
              <span>View on {listing.source_label}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-gray-100 my-4 text-center">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <div className="text-xs text-gray-500 mb-1">Bedrooms</div>
              <div className="text-lg font-bold text-gray-800 flex items-center justify-center gap-1.5">
                <Bed className="w-4 h-4 text-gray-400" />
                {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} Bed`}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl">
              <div className="text-xs text-gray-500 mb-1">Bathrooms</div>
              <div className="text-lg font-bold text-gray-800 flex items-center justify-center gap-1.5">
                <Bath className="w-4 h-4 text-gray-400" />
                {listing.bathrooms} Bath
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl">
              <div className="text-xs text-gray-500 mb-1">Living Area</div>
              <div className="text-lg font-bold text-gray-800 flex items-center justify-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-gray-400" />
                {listing.sqft ? `${listing.sqft.toLocaleString()} sq ft` : 'Unspecified'}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl">
              <div className="text-xs text-gray-500 mb-1">Fee Policy</div>
              <div className="text-sm font-bold text-gray-800 line-clamp-1 mt-1">
                {listing.fee_badge}
              </div>
            </div>
          </div>

          {/* Fee Insight Box */}
          {listing.fee_details && (
            <div className={`p-4 rounded-2xl mb-6 text-sm flex items-start gap-3 ${
              listing.has_broker_fee === false
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-100'
                : 'bg-blue-50 text-blue-900 border border-blue-100'
            }`}>
              {listing.has_broker_fee === false ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">Broker Fee Information</div>
                <div className="text-xs mt-0.5 opacity-90">{listing.fee_details}</div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
              {listing.description || 'No description provided in original post.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
