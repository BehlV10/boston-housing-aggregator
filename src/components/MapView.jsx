import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Supercluster from 'supercluster';
import { ExternalLink, Bed, Bath, ShieldCheck, DollarSign, Maximize2, Calendar } from 'lucide-react';

// Subcomponent to gently pan to selected listing WITHOUT zooming or resizing the map
function MapUpdater({ selectedListing }) {
  const map = useMap();
  const lastSelectedIdRef = useRef(null);

  useEffect(() => {
    if (!selectedListing || !selectedListing.lat || !selectedListing.lng) return;
    if (lastSelectedIdRef.current === selectedListing.id) return;
    lastSelectedIdRef.current = selectedListing.id;

    // Check if listing is already in current visible map bounds
    const bounds = map.getBounds();
    const isVisible = bounds.contains([selectedListing.lat, selectedListing.lng]);

    // If it's already visible in the viewport, do NOT move or zoom the map!
    // This fixes: "I don't like that it resizes the map when I click on something"
    if (!isVisible) {
      map.panTo([selectedListing.lat, selectedListing.lng], {
        animate: true,
        duration: 0.5
      });
    }
  }, [selectedListing, map]);

  return null;
}

// Subcomponent that manages supercluster and view-bounds marker rendering
function SuperclusterLayer({ listings, selectedListing, onSelectListing, theme = 'midnight' }) {
  const map = useMap();
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(12);

  // Initialize Supercluster instance
  const supercluster = useMemo(() => {
    const sc = new Supercluster({
      radius: 46,
      maxZoom: 16
    });

    const points = listings
      .filter((l) => l.lat && l.lng)
      .map((l) => ({
        type: 'Feature',
        properties: { ...l, cluster: false },
        geometry: {
          type: 'Point',
          coordinates: [l.lng, l.lat]
        }
      }));

    sc.load(points);
    return sc;
  }, [listings]);

  // Sync bounds & zoom on map moves
  const updateMapBounds = useCallback(() => {
    const b = map.getBounds();
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    setZoom(Math.round(map.getZoom()));
  }, [map]);

  useEffect(() => {
    updateMapBounds();
    map.on('moveend', updateMapBounds);
    map.on('zoomend', updateMapBounds);
    return () => {
      map.off('moveend', updateMapBounds);
      map.off('zoomend', updateMapBounds);
    };
  }, [map, updateMapBounds]);

  // Query clusters for current visible viewport
  const clusters = useMemo(() => {
    if (!bounds || !supercluster) return [];
    try {
      return supercluster.getClusters(bounds, zoom);
    } catch (e) {
      return [];
    }
  }, [bounds, zoom, supercluster]);

  // Create Cluster Icon
  const createClusterIcon = (count) => {
    let size = [40, 40];
    let sizeClass = 'w-10 h-10';
    if (count >= 50) {
      size = [48, 48];
      sizeClass = 'w-12 h-12';
    } else if (count >= 15) {
      size = [44, 44];
      sizeClass = 'w-11 h-11';
    }

    const themeClass =
      theme === 'midnight'
        ? 'cluster-dark'
        : theme === 'warm'
        ? 'cluster-warm'
        : 'cluster-light';

    return L.divIcon({
      className: 'cluster-marker-wrapper',
      html: `<div class="cluster-badge ${themeClass} ${sizeClass}">
              <span class="cluster-count">${count}</span>
              <span class="cluster-label">units</span>
            </div>`,
      iconSize: size,
      iconAnchor: [size[0] / 2, size[1] / 2]
    });
  };

  // Create Individual Listing Price Marker
  const createListingIcon = (listing, isSelected) => {
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
      iconSize: [60, 26],
      iconAnchor: [30, 13],
      popupAnchor: [0, -15]
    });
  };

  return (
    <>
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const isCluster = cluster.properties.cluster;

        if (isCluster) {
          const { cluster_id, point_count } = cluster.properties;
          return (
            <Marker
              key={`cluster-${cluster_id}`}
              position={[latitude, longitude]}
              icon={createClusterIcon(point_count)}
              eventHandlers={{
                click: () => {
                  const expansionZoom = Math.min(
                    supercluster.getClusterExpansionZoom(cluster_id),
                    17
                  );
                  map.flyTo([latitude, longitude], expansionZoom, {
                    duration: 0.5
                  });
                }
              }}
            />
          );
        }

        // Individual Listing Pin
        const listing = cluster.properties;
        const isSelected = selectedListing?.id === listing.id;

        return (
          <ListingMarker
            key={`listing-${listing.id}`}
            listing={listing}
            latitude={latitude}
            longitude={longitude}
            isSelected={isSelected}
            onSelectListing={onSelectListing}
            createListingIcon={createListingIcon}
            theme={theme}
          />
        );
      })}
    </>
  );
}

// Subcomponent for each individual marker with controlled popup
function ListingMarker({
  listing,
  latitude,
  longitude,
  isSelected,
  onSelectListing,
  createListingIcon,
  theme
}) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (isSelected && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isSelected]);

  const isDark = theme === 'midnight';
  const isWarm = theme === 'warm';

  return (
    <Marker
      ref={markerRef}
      position={[latitude, longitude]}
      icon={createListingIcon(listing, isSelected)}
      eventHandlers={{
        click: () => onSelectListing(listing)
      }}
    >
      <Popup className="listing-map-popup" maxWidth={320} minWidth={280}>
        <div className={`w-72 sm:w-80 overflow-hidden ${isDark ? 'text-slate-100' : isWarm ? 'text-stone-900' : 'text-gray-900'}`}>
          {listing.images && listing.images[0] && (
            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-gray-900">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-md ${
                    listing.has_broker_fee === false
                      ? 'bg-emerald-600 text-white'
                      : listing.has_broker_fee === true
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  {listing.fee_badge}
                </span>
                {listing.availability && listing.availability !== 'Contact Lister' && (
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md backdrop-blur-sm border ${
                    isDark
                      ? 'bg-slate-900/90 text-slate-100 border-slate-700'
                      : 'bg-white/95 text-gray-800 border-gray-100'
                  }`}>
                    <Calendar className="w-2.5 h-2.5 text-boston-brick" />
                    {listing.availability}
                  </span>
                )}
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
              <div className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${listing.price?.toLocaleString()}
                <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>/mo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    listing.rental_type === 'sublet'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : listing.rental_type === 'room'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : isDark
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {listing.rental_type === 'sublet'
                    ? 'Sublet'
                    : listing.rental_type === 'room'
                    ? 'Single Room'
                    : 'Condo / Apt'}
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  {listing.source_label}
                </span>
              </div>
            </div>

            <h4 className={`font-semibold text-xs line-clamp-1 mb-1 ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
              {listing.title}
            </h4>

            <p className={`text-[11px] line-clamp-1 mb-2.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {listing.neighborhood || listing.address}
            </p>

            <div className={`flex items-center gap-2.5 text-xs mb-3 border-t pt-2 flex-wrap ${
              isDark ? 'border-slate-800 text-slate-400' : 'border-gray-100 text-gray-600'
            }`}>
              <span className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 opacity-60" />
                {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} Bed`}
              </span>
              <span className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 opacity-60" />
                {listing.bathrooms} Bath
              </span>
              {listing.sqft && (
                <span className="flex items-center gap-1 font-semibold">
                  <Maximize2 className="w-3.5 h-3.5 opacity-60" />
                  {listing.sqft.toLocaleString()} sq ft
                </span>
              )}
            </div>

            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-1.5 px-3 bg-boston-brick text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-rose-900 transition-colors shadow-sm"
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
}

// Subcomponent that smoothly animates view to the new city when city changes
function CityViewUpdater({ cityCenter, cityZoom, cityId }) {
  const map = useMap();
  const prevCityRef = useRef(cityId);

  useEffect(() => {
    if (prevCityRef.current !== cityId) {
      prevCityRef.current = cityId;
      if (cityCenter) {
        map.flyTo(cityCenter, cityZoom || 12, {
          duration: 1.2,
          easeLinearity: 0.25
        });
      }
    }
  }, [cityId, cityCenter, cityZoom, map]);

  return null;
}

export default function MapView({ 
  listings, 
  selectedListing, 
  onSelectListing, 
  theme = 'midnight',
  cityCenter = [42.368, -71.095],
  cityZoom = 12,
  cityId = 'boston'
}) {
  const isDark = theme === 'midnight';
  const isWarm = theme === 'warm';

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden border shadow-sm ${
      isDark
        ? 'border-slate-800 bg-slate-950 shadow-slate-950/50'
        : isWarm
        ? 'border-[#E2DDD2] bg-[#F7F5EE]'
        : 'border-gray-200 bg-white'
    }`}>
      <MapContainer
        center={cityCenter}
        zoom={cityZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <CityViewUpdater cityCenter={cityCenter} cityZoom={cityZoom} cityId={cityId} />
        <MapUpdater selectedListing={selectedListing} />

        {/* 100% Free Open-Source OpenStreetMap Tiles (Zero API Key, Zero Watermarks) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Clustered Viewport Markers */}
        <SuperclusterLayer
          listings={listings}
          selectedListing={selectedListing}
          onSelectListing={onSelectListing}
          theme={theme}
        />
      </MapContainer>

      {/* Map Legend (Positioned above floating mobile FAB on small screens) */}
      <div className={`absolute bottom-20 sm:bottom-4 right-3 sm:right-4 backdrop-blur-md p-2.5 sm:p-3 rounded-xl shadow-xl border z-[400] text-xs flex flex-col gap-1 sm:gap-1.5 ${
        isDark
          ? 'bg-slate-900/90 border-slate-700/80 text-slate-200'
          : isWarm
          ? 'bg-[#FAF8F5]/95 border-[#E2DDD2] text-stone-800'
          : 'bg-white/95 border-gray-200 text-gray-700'
      }`}>
        <div className={`font-bold mb-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Map Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white/60 shadow-xs"></span>
          <span className="font-medium text-[11px]">No Broker Fee</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white/60 shadow-xs"></span>
          <span className="font-medium text-[11px]">Broker Fee</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-white/60 shadow-xs"></span>
          <span className="font-medium text-[11px]">Fee Unspecified</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-white/10">
          <span className="w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold text-white bg-slate-700 border border-sky-400">
            #
          </span>
          <span className="font-medium text-[10px] opacity-75">Click cluster to expand</span>
        </div>
      </div>
    </div>
  );
}
