import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ExternalLink, Bed, Bath, ShieldCheck, DollarSign, Maximize2 } from 'lucide-react';

// Subcomponent to dynamically center or fly to selected listing
function MapUpdater({ selectedListing }) {
  const map = useMap();
  useEffect(() => {
    if (selectedListing && selectedListing.lat && selectedListing.lng) {
      map.flyTo([selectedListing.lat, selectedListing.lng], 14, {
        duration: 1.2
      });
    }
  }, [selectedListing, map]);
  return null;
}

export default function MapView({ listings, selectedListing, onSelectListing }) {
  const bostonCenter = [42.3601, -71.0589];

  // Helper to generate custom HTML marker with price and fee color
  const createCustomMarker = (listing, isSelected) => {
    let feeClass = 'price-marker-unknown';
    if (listing.has_broker_fee === false) {
      feeClass = 'price-marker-no-fee';
    } else if (listing.has_broker_fee === true) {
      feeClass = 'price-marker-fee';
    }

    const selectedClass = isSelected ? 'price-marker-selected' : '';
    const formattedPrice = listing.price ? `$${listing.price.toLocaleString()}` : 'Contact';

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div class="price-marker-pin ${feeClass} ${selectedClass}">${formattedPrice}</div>`,
      iconSize: [60, 28],
      iconAnchor: [30, 14],
      popupAnchor: [0, -16]
    });
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={bostonCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapUpdater selectedListing={selectedListing} />
        
        {/* Standard OpenStreetMap tiles - Free, open-source, no API key required */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {listings.map((listing) => {
          if (!listing.lat || !listing.lng) return null;
          const isSelected = selectedListing?.id === listing.id;

          return (
            <Marker
              key={listing.id}
              position={[listing.lat, listing.lng]}
              icon={createCustomMarker(listing, isSelected)}
              eventHandlers={{
                click: () => onSelectListing(listing)
              }}
            >
              <Popup className="listing-map-popup" maxWidth={320} minWidth={280}>
                <div className="w-72 sm:w-80 overflow-hidden">
                  {listing.images && listing.images[0] && (
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-900">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-md ${
                          listing.has_broker_fee === false
                            ? 'bg-emerald-600 text-white'
                            : listing.has_broker_fee === true
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-white'
                        }`}>
                          {listing.fee_badge}
                        </span>
                      </div>
                      {listing.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-semibold text-white backdrop-blur-xs">
                          1/{listing.images.length} photos
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-3">
                    <div className="flex items-baseline justify-between mb-1">
                      <div className="text-lg font-bold text-gray-900">
                        ${listing.price?.toLocaleString()}
                        <span className="text-xs font-normal text-gray-500">/mo</span>
                      </div>
                      <span className="text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {listing.source_label}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-gray-800 line-clamp-1 mb-1">
                      {listing.title}
                    </h4>

                    <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                      {listing.neighborhood || listing.address}
                    </p>

                    <div className="flex items-center gap-2.5 text-xs text-gray-600 mb-3 border-t pt-2 border-gray-100 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-gray-400" />
                        {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} Bed`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-gray-400" />
                        {listing.bathrooms} Bath
                      </span>
                      {listing.sqft && (
                        <span className="flex items-center gap-1 font-semibold text-gray-800">
                          <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                          {listing.sqft.toLocaleString()} sq ft
                        </span>
                      )}
                    </div>

                    <a
                      href={listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-3 bg-boston-brick text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-red-900 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>View on {listing.source_label}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200 z-[400] text-xs flex flex-col gap-1.5">
        <div className="font-bold text-gray-700 mb-0.5">Map Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-sm"></span>
          <span className="text-gray-600 font-medium">No Broker Fee</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-sm"></span>
          <span className="text-gray-600 font-medium">Broker Fee</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-600 border border-white shadow-sm"></span>
          <span className="text-gray-600 font-medium">Fee Unspecified</span>
        </div>
      </div>
    </div>
  );
}
