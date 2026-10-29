import React, { useState, useMemo } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Building2, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Bed, 
  Bath, 
  Train, 
  Send, 
  HelpCircle, 
  ShieldCheck, 
  Eye,
  CheckCircle2,
  BookmarkPlus,
  RefreshCw
} from 'lucide-react';

export default function CrossListHub({ onAddCommunityListing }) {
  const [activePlatform, setActivePlatform] = useState('reddit');
  const [copiedField, setCopiedField] = useState(null);
  const [isSavedLocally, setIsSavedLocally] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: 'Spacious Private Bedroom in Central Sq 2B1B Duplex',
    rentalType: 'room', // 'room' | 'sublet' | 'entire'
    price: 1250,
    neighborhood: 'Cambridge (Central Square)',
    address: 'Prospect St & Mass Ave',
    moveInDate: '2026-12-01',
    moveInFlexibility: 'Dec 1 or flexible early Dec',
    leaseTerm: 'Flexible / Month-to-Month', // 'Month-to-Month', 'Through Aug 31, 2027', 'Spring Semester (Jan-May)', '1-Year Lease'
    bedrooms: 2,
    bathrooms: 1,
    privateBath: false,
    utilitiesIncluded: false,
    utilitiesEstimate: '80-100',
    laundry: 'in-unit', // 'in-unit', 'in-building', 'nearby'
    ac: true,
    dishwasher: true,
    furnished: false,
    pets: 'Cats OK, No Dogs',
    parking: 'Street permit available',
    transit: '4-min walk to Central Sq Red Line, 12-min walk to MIT',
    roommateVibe: 'Sharing with 1 respectful, quiet young professional in tech/biotech. Clean, friendly, and considerate of shared spaces.',
    description: 'Sunny second-floor bedroom with high ceilings and a large closet in a bright duplex. Fully equipped kitchen, central AC/heating, and quiet residential street.',
    contact: 'Send a message or DM with a brief bio (what you do, target move-in date, and typical routine)!'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const copyToClipboard = (text, fieldKey) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Formatted date string for title
  const formattedDateTag = useMemo(() => {
    if (!formData.moveInDate) return 'Available Now';
    const parts = formData.moveInDate.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const month = d.toLocaleString('en-US', { month: 'short' });
      return `Available ${month} ${parseInt(parts[2], 10)}`;
    }
    return 'Available Soon';
  }, [formData.moveInDate]);

  // Type label
  const typeLabel = useMemo(() => {
    if (formData.rentalType === 'room') return 'Private Room';
    if (formData.rentalType === 'sublet') return 'Sublet';
    return 'Apartment';
  }, [formData.rentalType]);

  // 1. Reddit r/bostonhousing generation
  const redditTitle = useMemo(() => {
    const feeTag = '(No Fee)';
    const bathTag = formData.privateBath ? 'Private Bath' : 'Shared Bath';
    return `[${formattedDateTag}] $${formData.price}/mo - ${formData.title} in ${formData.neighborhood} ${feeTag}`;
  }, [formattedDateTag, formData.price, formData.title, formData.neighborhood]);

  const redditBody = useMemo(() => {
    return `## ${formData.title}
**Location:** ${formData.neighborhood} (${formData.address})  
**Rent:** $${formData.price}/month (No Broker Fee)  
**Move-in Date:** ${formData.moveInFlexibility || formattedDateTag}  
**Lease Term:** ${formData.leaseTerm}  

---

### Key Details & Amenities
| Feature | Details |
| :--- | :--- |
| **Room Type** | ${typeLabel} (${formData.privateBath ? 'Private Bathroom' : 'Shared Bathroom'}) |
| **Total Unit Size** | ${formData.bedrooms} Bed / ${formData.bathrooms} Bath |
| **Utilities** | ${formData.utilitiesIncluded ? 'Included in Rent' : `Not included (~$${formData.utilitiesEstimate}/mo typical)`} |
| **Transit / Commute** | ${formData.transit} |
| **Laundry** | ${formData.laundry === 'in-unit' ? 'In-unit Washer/Dryer' : formData.laundry === 'in-building' ? 'In-building Laundry' : 'Laundromat nearby'} |
| **Air Conditioning** | ${formData.ac ? 'Yes (Central AC / Window unit)' : 'No'} |
| **Dishwasher** | ${formData.dishwasher ? 'Yes' : 'No'} |
| **Furnished** | ${formData.furnished ? 'Furnished' : 'Unfurnished'} |
| **Parking** | ${formData.parking} |
| **Pet Policy** | ${formData.pets} |

---

### Description
${formData.description}

### About the Roommates / Vibe
${formData.roommateVibe}

---

### Contact / How to Apply
${formData.contact}
`;
  }, [formData, formattedDateTag, typeLabel]);

  // Reddit Submit URL with pre-populated fields
  const redditSubmitUrl = useMemo(() => {
    const baseUrl = 'https://www.reddit.com/r/bostonhousing/submit';
    const params = new URLSearchParams({
      title: redditTitle,
      text: redditBody
    });
    return `${baseUrl}?${params.toString()}`;
  }, [redditTitle, redditBody]);

  // 2. Craigslist Boston text generation
  const craigslistTitle = useMemo(() => {
    return `${formData.title} - $${formData.price} (${formData.neighborhood})`;
  }, [formData.title, formData.price, formData.neighborhood]);

  const craigslistBody = useMemo(() => {
    return `${formData.title}
Rent: $${formData.price} / month (No Broker Fee)
Available: ${formData.moveInFlexibility || formattedDateTag}
Lease: ${formData.leaseTerm}
Location: ${formData.neighborhood} (${formData.address})

APARTMENT & ROOM FEATURES:
- ${typeLabel} with ${formData.privateBath ? 'Private Bath' : 'Shared Bath'} in a ${formData.bedrooms}BR / ${formData.bathrooms}BA
- Laundry: ${formData.laundry === 'in-unit' ? 'In-Unit Washer & Dryer' : formData.laundry === 'in-building' ? 'In-Building Laundry' : 'Nearby'}
- Transit: ${formData.transit}
- AC: ${formData.ac ? 'Central AC' : 'Window Unit'}
- Dishwasher: ${formData.dishwasher ? 'Yes' : 'None'}
- Pets: ${formData.pets}
- Parking: ${formData.parking}
- Utilities: ${formData.utilitiesIncluded ? 'Included' : `Approx. $${formData.utilitiesEstimate}/month`}

ABOUT THE SPACE & ROOMMATES:
${formData.description}

${formData.roommateVibe}

CONTACT:
${formData.contact}
`;
  }, [formData, formattedDateTag, typeLabel]);

  // 3. Facebook Marketplace / Groups text generation
  const facebookTitle = useMemo(() => {
    return `Room in ${formData.neighborhood} - $${formData.price}/mo (${formattedDateTag})`;
  }, [formData.neighborhood, formData.price, formattedDateTag]);

  const facebookBody = useMemo(() => {
    return `✨ ${formData.title} ✨

📍 Location: ${formData.neighborhood} (${formData.address})
💰 Rent: $${formData.price}/month (NO BROKER FEE)
📅 Move-In: ${formData.moveInFlexibility || formattedDateTag} (${formData.leaseTerm})
🚇 Transit: ${formData.transit}

🏠 Room Details:
• ${typeLabel} with ${formData.privateBath ? 'Private Bathroom' : 'Shared Bathroom'}
• Total Unit: ${formData.bedrooms} Bed / ${formData.bathrooms} Bath
• Laundry: ${formData.laundry === 'in-unit' ? '🧺 In-unit Washer/Dryer' : '🧺 In-building'}
• AC: ${formData.ac ? '❄️ Central AC' : 'Fan/Window'}
• Kitchen: ${formData.dishwasher ? '🍽️ Dishwasher included' : 'Fully equipped'}
• Pets: ${formData.pets}
• Parking: ${formData.parking}
• Utilities: ${formData.utilitiesIncluded ? '💡 Included' : `💡 ~$${formData.utilitiesEstimate}/mo`}

👋 The Vibe:
${formData.roommateVibe}

📝 Description:
${formData.description}

📩 Interested? ${formData.contact}
`;
  }, [formData, formattedDateTag, typeLabel]);

  // Handle local injection to Hub
  const handlePublishToHub = () => {
    if (onAddCommunityListing) {
      const newListing = {
        id: `community-${Date.now()}`,
        source: 'community',
        source_label: 'Community Direct',
        title: formData.title,
        price: parseInt(formData.price, 10) || 1200,
        neighborhood: formData.neighborhood.split('(')[0].trim(),
        address: formData.address,
        url: '#',
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        rental_type: formData.rentalType,
        rental_type_label: typeLabel,
        sqft: null,
        lat: formData.neighborhood.toLowerCase().includes('cambridge') ? 42.365 : 42.355,
        lng: formData.neighborhood.toLowerCase().includes('cambridge') ? -71.105 : -71.065,
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        availability: formattedDateTag,
        move_in_period: formData.moveInDate ? formData.moveInDate.substring(0, 7) : 'immediate',
        has_broker_fee: false,
        fee_badge: 'No Broker Fee',
        fee_details: 'Direct Roommate Listing (0% Broker Fee)',
        description: `${formData.description} Roommate Vibe: ${formData.roommateVibe} Contact: ${formData.contact}`,
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80'
        ]
      };
      onAddCommunityListing(newListing);
      setIsSavedLocally(true);
      setTimeout(() => setIsSavedLocally(false), 3500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="mb-6 bg-gradient-to-r from-boston-brick to-boston-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-boston-brick/10 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-3 text-white">
            <Sparkles className="w-3.5 h-3.5 text-boston-gold" />
            <span>Multi-Platform Cross-Poster</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            List Once, Syndicate Everywhere
          </h2>
          <p className="mt-2 text-sm text-gray-200 leading-relaxed">
            Fill out your room or apartment details once. Our engine generates platform-tailored copy and one-click deep-links for <strong>Reddit r/bostonhousing</strong>, <strong>Craigslist</strong>, and <strong>Facebook Marketplace</strong>—avoiding shadowbans and bot CAPTCHAs while saving you hours.
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
          <Share2 className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Main Grid: Left = Form, Right = Syndication Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-boston-brick" />
                <span>Room & Apartment Details</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Enter details once to generate all listings</p>
            </div>
            <button
              type="button"
              onClick={handlePublishToHub}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSavedLocally 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              {isSavedLocally ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Added to Local Hub Feed!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Preview in Hub Feed</span>
                </>
              )}
            </button>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Headline / Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Spacious Sunny Bedroom in Central Sq 2B1B"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-boston-brick/30 focus:border-boston-brick font-medium"
              />
            </div>

            {/* Row 1: Type, Price, Move-in Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rental Type</label>
                <select
                  name="rentalType"
                  value={formData.rentalType}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-boston-brick/30 bg-white"
                >
                  <option value="room">Private Room in Shared Apt</option>
                  <option value="sublet">Sublet / Temporary</option>
                  <option value="entire">Entire Apartment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Monthly Rent ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-xs">$</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-boston-brick/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Move-In Date</label>
                <input
                  type="date"
                  name="moveInDate"
                  value={formData.moveInDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-boston-brick/30"
                />
              </div>
            </div>

            {/* Row 2: Neighborhood & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Neighborhood</label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  placeholder="e.g. Cambridge (Central Sq)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-boston-brick/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Cross Streets / Location</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Mass Ave & Prospect St"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-boston-brick/30"
                />
              </div>
            </div>

            {/* Row 3: Lease Term & Move-in Flexibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Lease Duration</label>
                <select
                  name="leaseTerm"
                  value={formData.leaseTerm}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-boston-brick/30 bg-white"
                >
                  <option value="Flexible / Month-to-Month">Flexible / Month-to-Month</option>
                  <option value="Through August 31, 2027">Through August 31, 2027 (Standard Sept Cycle)</option>
                  <option value="Spring Semester (Jan - May 2027)">Spring Semester (Jan - May 2027)</option>
                  <option value="Summer Sublet (June - August)">Summer Sublet (June - August)</option>
                  <option value="12-Month Lease">12-Month Fixed Lease</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Move-In Note / Flexibility</label>
                <input
                  type="text"
                  name="moveInFlexibility"
                  value={formData.moveInFlexibility}
                  onChange={handleChange}
                  placeholder="e.g. Dec 1 or flexible early Dec"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-boston-brick/30"
                />
              </div>
            </div>

            {/* Row 4: Beds, Baths, Laundry */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Total Unit Beds / Baths</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-1/2 px-2.5 py-2 rounded-xl border border-gray-200 text-xs"
                    title="Total Bedrooms in apartment"
                  />
                  <span className="text-gray-400 text-xs">bd /</span>
                  <input
                    type="number"
                    step="0.5"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="w-1/2 px-2.5 py-2 rounded-xl border border-gray-200 text-xs"
                    title="Total Bathrooms in apartment"
                  />
                  <span className="text-gray-400 text-xs">ba</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Bathroom Type</label>
                <select
                  name="privateBath"
                  value={formData.privateBath ? 'true' : 'false'}
                  onChange={(e) => setFormData(prev => ({ ...prev, privateBath: e.target.value === 'true' }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-boston-brick/30 bg-white"
                >
                  <option value="false">Shared Bathroom</option>
                  <option value="true">Private Bathroom En-suite</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Laundry</label>
                <select
                  name="laundry"
                  value={formData.laundry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-boston-brick/30 bg-white"
                >
                  <option value="in-unit">In-unit Washer/Dryer</option>
                  <option value="in-building">In-building Laundry</option>
                  <option value="nearby">Laundromat nearby</option>
                </select>
              </div>
            </div>

            {/* Checkboxes: AC, Dishwasher, Furnished, Utilities */}
            <div className="flex flex-wrap gap-4 pt-1 pb-1 text-xs text-gray-700">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  name="ac"
                  checked={formData.ac}
                  onChange={handleChange}
                  className="rounded text-boston-brick focus:ring-boston-brick"
                />
                <span>Central AC</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  name="dishwasher"
                  checked={formData.dishwasher}
                  onChange={handleChange}
                  className="rounded text-boston-brick focus:ring-boston-brick"
                />
                <span>Dishwasher</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  name="furnished"
                  checked={formData.furnished}
                  onChange={handleChange}
                  className="rounded text-boston-brick focus:ring-boston-brick"
                />
                <span>Furnished Room</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  name="utilitiesIncluded"
                  checked={formData.utilitiesIncluded}
                  onChange={handleChange}
                  className="rounded text-boston-brick focus:ring-boston-brick"
                />
                <span>Utilities Included</span>
              </label>
            </div>

            {/* Transit */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Subway / Transit Access</label>
              <input
                type="text"
                name="transit"
                value={formData.transit}
                onChange={handleChange}
                placeholder="e.g. 4-min walk to Central Sq Red Line"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-boston-brick/30"
              />
            </div>

            {/* Roommate Vibe & Preferences */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Roommate Vibe & Household Intro</label>
              <textarea
                name="roommateVibe"
                rows={2}
                value={formData.roommateVibe}
                onChange={handleChange}
                placeholder="Tell prospective roommates who you are and what you're looking for..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-boston-brick/30"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Apartment Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe room dimensions, natural light, closets, shared kitchen..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-boston-brick/30"
              />
            </div>

            {/* Contact Instructions */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Contact Instructions / Call to Action</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="e.g. DM me with a short bio and target move-in date!"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-boston-brick/30"
              />
            </div>
          </form>
        </div>

        {/* Right Column: Platform Syndication Hub (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5 sticky top-24">
          {/* Platform Tab Buttons */}
          <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-1">
            <button
              onClick={() => setActivePlatform('reddit')}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                activePlatform === 'reddit'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>Reddit</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-md">1-Click</span>
            </button>
            <button
              onClick={() => setActivePlatform('craigslist')}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                activePlatform === 'craigslist'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>Craigslist</span>
            </button>
            <button
              onClick={() => setActivePlatform('facebook')}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                activePlatform === 'facebook'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>Facebook</span>
            </button>
          </div>

          {/* ACTIVE PLATFORM 1: REDDIT */}
          {activePlatform === 'reddit' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                    r/
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Reddit r/bostonhousing</h4>
                    <p className="text-[11px] text-gray-500">Auto-formatted markdown with pre-filled submit link</p>
                  </div>
                </div>
              </div>

              {/* Instant Launch Button */}
              <a
                href={redditSubmitUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md"
              >
                <span>Launch Pre-Filled Post on r/bostonhousing</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Title Copy */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-gray-500">Reddit Title:</span>
                  <button
                    onClick={() => copyToClipboard(redditTitle, 'reddit-title')}
                    className="text-[11px] text-orange-600 hover:underline flex items-center gap-1"
                  >
                    {copiedField === 'reddit-title' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'reddit-title' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl text-xs text-gray-800 font-mono border border-gray-200/60 break-words">
                  {redditTitle}
                </div>
              </div>

              {/* Body Copy */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-gray-500">Markdown Body:</span>
                  <button
                    onClick={() => copyToClipboard(redditBody, 'reddit-body')}
                    className="text-[11px] text-orange-600 hover:underline flex items-center gap-1"
                  >
                    {copiedField === 'reddit-body' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'reddit-body' ? 'Copied Body' : 'Copy Markdown'}</span>
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 font-mono border border-gray-200/60 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {redditBody}
                </div>
              </div>

              <div className="bg-orange-50/70 border border-orange-200/60 rounded-xl p-3 text-[11px] text-orange-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip:</strong> r/bostonhousing requires title brackets e.g. <code>[Available Nov 1]</code> and prohibits spam. The button above already includes compliant tags!
                </span>
              </div>
            </div>
          )}

          {/* ACTIVE PLATFORM 2: CRAIGSLIST */}
          {activePlatform === 'craigslist' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    CL
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Craigslist Boston</h4>
                    <p className="text-[11px] text-gray-500">Rooms & Shares / Sublets / Apts for Rent</p>
                  </div>
                </div>
              </div>

              {/* Craigslist Quick Launch Button */}
              <a
                href="https://post.craigslist.org/c/bos?lang=en"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md"
              >
                <span>Open Craigslist Boston Post Creator</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Title Copy */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-gray-500">Posting Title:</span>
                  <button
                    onClick={() => copyToClipboard(craigslistTitle, 'cl-title')}
                    className="text-[11px] text-purple-700 hover:underline flex items-center gap-1"
                  >
                    {copiedField === 'cl-title' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'cl-title' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl text-xs text-gray-800 font-mono border border-gray-200/60 break-words">
                  {craigslistTitle}
                </div>
              </div>

              {/* Price & Location Fast Copy */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between">
                  <span className="text-gray-500 text-[11px]">Price: <strong>${formData.price}</strong></span>
                  <button
                    onClick={() => copyToClipboard(String(formData.price), 'cl-price')}
                    className="text-purple-700 hover:underline text-[11px]"
                  >
                    {copiedField === 'cl-price' ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between">
                  <span className="text-gray-500 text-[11px]">Neighborhood</span>
                  <button
                    onClick={() => copyToClipboard(formData.neighborhood, 'cl-neigh')}
                    className="text-purple-700 hover:underline text-[11px]"
                  >
                    {copiedField === 'cl-neigh' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Body Copy */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-gray-500">Description Body:</span>
                  <button
                    onClick={() => copyToClipboard(craigslistBody, 'cl-body')}
                    className="text-[11px] text-purple-700 hover:underline flex items-center gap-1"
                  >
                    {copiedField === 'cl-body' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'cl-body' ? 'Copied Body' : 'Copy Text'}</span>
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 font-mono border border-gray-200/60 max-h-52 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {craigslistBody}
                </div>
              </div>

              <div className="bg-purple-50/70 border border-purple-200/60 rounded-xl p-3 text-[11px] text-purple-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <span>
                  Select <strong>"housing offered"</strong> &rarr; <strong>"rooms & shares"</strong> (or "sublets / temporary") and paste the copied sections.
                </span>
              </div>
            </div>
          )}

          {/* ACTIVE PLATFORM 3: FACEBOOK */}
          {activePlatform === 'facebook' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    f
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Facebook Marketplace & Groups</h4>
                    <p className="text-[11px] text-gray-500">Emoji-structured mobile format for maximum DMs</p>
                  </div>
                </div>
              </div>

              {/* FB Marketplace Creator Link */}
              <a
                href="https://www.facebook.com/marketplace/create/rental"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md"
              >
                <span>Open FB Marketplace Rental Creator</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Title Copy */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-gray-500">Facebook Title:</span>
                  <button
                    onClick={() => copyToClipboard(facebookTitle, 'fb-title')}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {copiedField === 'fb-title' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'fb-title' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl text-xs text-gray-800 font-mono border border-gray-200/60 break-words">
                  {facebookTitle}
                </div>
              </div>

              {/* Body Copy */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-gray-500">Emoji Description Body:</span>
                  <button
                    onClick={() => copyToClipboard(facebookBody, 'fb-body')}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {copiedField === 'fb-body' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'fb-body' ? 'Copied Body' : 'Copy Text'}</span>
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 font-mono border border-gray-200/60 max-h-52 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {facebookBody}
                </div>
              </div>

              {/* Top Boston Groups to Cross-Post to */}
              <div className="border-t border-gray-100 pt-3">
                <span className="text-[11px] font-bold text-gray-700 block mb-2">
                  Top Boston Housing Groups to Cross-Post:
                </span>
                <div className="flex flex-col gap-1.5 text-xs">
                  <a
                    href="https://www.facebook.com/groups/BostonHousingRoomsApartments/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 flex items-center justify-between text-[11px] transition-colors"
                  >
                    <span>Boston Housing, Rooms & Sublets</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                  <a
                    href="https://www.facebook.com/groups/harvardmithousing/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 flex items-center justify-between text-[11px] transition-colors"
                  >
                    <span>Harvard / MIT / Cambridge Housing</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                  <a
                    href="https://www.facebook.com/groups/1531398287114620/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 flex items-center justify-between text-[11px] transition-colors"
                  >
                    <span>Somerville & Cambridge Sublets</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Quick Info Box */}
          <div className="bg-gray-100 rounded-2xl p-4 text-xs text-gray-600 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Why this approach?</strong> Automated posting bots routinely trigger security lockouts, SMS verification, and shadowbans on Craigslist and Meta. Using these pre-formatted templates ensures your listings look professional, stay compliant, and get direct responses from real tenants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
