#!/usr/bin/env python3
"""
Greater New York City Rental Listings Multi-Source Aggregator Scraper
Collects real rental listings from:
- Craigslist NYC:
  - Manhattan (mnh): Apartments, Rooms & Shares, Sublets
  - Brooklyn (brk): Apartments, Rooms & Shares, Sublets
  - Queens (que): Apartments, Rooms & Shares, Sublets
  - Jersey City / Hoboken (jys): Apartments, Rooms & Shares
  - Bronx (brx): Apartments
- Reddit NYC Housing Communities:
  - r/NYCapartments (direct tenant offerings, sublets, lease takeovers, room shares)
  - r/nyu & r/columbia (student & university area sublets)

Extracts:
- Price & fee breakdown (No Broker Fee vs Broker Fee, FARE Act context)
- Precise borough tagging (Manhattan, Brooklyn, Queens, Jersey City / Hoboken, Bronx)
- Neighborhoods & exact coordinates
- Bedrooms, bathrooms, square footage
- Photo galleries
- Move-in availability dates (Immediate, Dec, Jan, Spring, etc.)

Outputs to:
- public/data/nyc_listings.json
- public/data/nyc_metadata.json
"""

import html as html_parser
import json
import math
import os
import random
import re
import sys
import time
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/123.0.0.0 Safari/537.36'
    ),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'data')
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'nyc_listings.json')
METADATA_FILE = os.path.join(OUTPUT_DIR, 'nyc_metadata.json')

# Greater NYC Geographic Bounding Box
# Lat: 40.52 to 40.94
# Lng: -74.15 to -73.68
NYC_BOUNDS = {
    'min_lat': 40.52,
    'max_lat': 40.94,
    'min_lng': -74.15,
    'max_lng': -73.68,
}

# NYC Neighborhood Geocoding & Borough Mapping
# Format: (lat, lng, formatted_neighborhood, borough)
NYC_NEIGHBORHOOD_MAP = {
    # Manhattan
    'east village': (40.7264, -73.9818, 'East Village', 'Manhattan'),
    'west village': (40.7358, -74.0036, 'West Village', 'Manhattan'),
    'greenwich village': (40.7336, -73.9980, 'Greenwich Village', 'Manhattan'),
    'soho': (40.7233, -74.0030, 'SoHo', 'Manhattan'),
    'lower east side': (40.7150, -73.9843, 'Lower East Side', 'Manhattan'),
    'les': (40.7150, -73.9843, 'Lower East Side', 'Manhattan'),
    'chelsea': (40.7465, -74.0014, 'Chelsea', 'Manhattan'),
    'meatpacking': (40.7408, -74.0076, 'Meatpacking District', 'Manhattan'),
    'union square': (40.7359, -73.9911, 'Union Square', 'Manhattan'),
    'flatiron': (40.7411, -73.9897, 'Flatiron', 'Manhattan'),
    'gramercy': (40.7380, -73.9840, 'Gramercy Park', 'Manhattan'),
    'gramercy park': (40.7380, -73.9840, 'Gramercy Park', 'Manhattan'),
    'midtown': (40.7549, -73.9840, 'Midtown', 'Manhattan'),
    'midtown east': (40.7540, -73.9710, 'Midtown East', 'Manhattan'),
    'midtown west': (40.7600, -73.9910, 'Midtown West', 'Manhattan'),
    "hell's kitchen": (40.7638, -73.9918, "Hell's Kitchen", 'Manhattan'),
    'hells kitchen': (40.7638, -73.9918, "Hell's Kitchen", 'Manhattan'),
    'murray hill': (40.7479, -73.9757, 'Murray Hill', 'Manhattan'),
    'kips bay': (40.7423, -73.9800, 'Kips Bay', 'Manhattan'),
    'upper east side': (40.7736, -73.9566, 'Upper East Side', 'Manhattan'),
    'ues': (40.7736, -73.9566, 'Upper East Side', 'Manhattan'),
    'yorkville': (40.7762, -73.9492, 'Yorkville', 'Manhattan'),
    'upper west side': (40.7870, -73.9754, 'Upper West Side', 'Manhattan'),
    'uws': (40.7870, -73.9754, 'Upper West Side', 'Manhattan'),
    'morningside heights': (40.8090, -73.9626, 'Morningside Heights', 'Manhattan'),
    'harlem': (40.8116, -73.9465, 'Harlem', 'Manhattan'),
    'central harlem': (40.8116, -73.9465, 'Central Harlem', 'Manhattan'),
    'east harlem': (40.7957, -73.9425, 'East Harlem', 'Manhattan'),
    'el barrio': (40.7957, -73.9425, 'East Harlem', 'Manhattan'),
    'west harlem': (40.8170, -73.9520, 'West Harlem', 'Manhattan'),
    'hamilton heights': (40.8250, -73.9480, 'Hamilton Heights', 'Manhattan'),
    'washington heights': (40.8417, -73.9393, 'Washington Heights', 'Manhattan'),
    'inwood': (40.8677, -73.9212, 'Inwood', 'Manhattan'),
    'financial district': (40.7075, -74.0090, 'Financial District', 'Manhattan'),
    'fidi': (40.7075, -74.0090, 'Financial District', 'Manhattan'),
    'tribeca': (40.7163, -74.0086, 'Tribeca', 'Manhattan'),
    'battery park city': (40.7115, -74.0150, 'Battery Park City', 'Manhattan'),
    'chinatown': (40.7158, -73.9970, 'Chinatown', 'Manhattan'),
    'little italy': (40.7191, -73.9973, 'Little Italy', 'Manhattan'),
    'nolita': (40.7226, -73.9953, 'Nolita', 'Manhattan'),
    'noho': (40.7275, -73.9928, 'NoHo', 'Manhattan'),
    'hudson yards': (40.7538, -74.0013, 'Hudson Yards', 'Manhattan'),

    # Brooklyn
    'williamsburg': (40.7081, -73.9571, 'Williamsburg', 'Brooklyn'),
    'north williamsburg': (40.7190, -73.9590, 'North Williamsburg', 'Brooklyn'),
    'south williamsburg': (40.7050, -73.9560, 'South Williamsburg', 'Brooklyn'),
    'greenpoint': (40.7245, -73.9486, 'Greenpoint', 'Brooklyn'),
    'bushwick': (40.6944, -73.9213, 'Bushwick', 'Brooklyn'),
    'east williamsburg': (40.7110, -73.9380, 'East Williamsburg', 'Brooklyn'),
    'bedford-stuyvesant': (40.6872, -73.9418, 'Bed-Stuy', 'Brooklyn'),
    'bed-stuy': (40.6872, -73.9418, 'Bed-Stuy', 'Brooklyn'),
    'bedstuy': (40.6872, -73.9418, 'Bed-Stuy', 'Brooklyn'),
    'crown heights': (40.6694, -73.9422, 'Crown Heights', 'Brooklyn'),
    'prospect heights': (40.6774, -73.9683, 'Prospect Heights', 'Brooklyn'),
    'park slope': (40.6711, -73.9814, 'Park Slope', 'Brooklyn'),
    'south slope': (40.6600, -73.9870, 'South Slope', 'Brooklyn'),
    'gowanus': (40.6730, -73.9930, 'Gowanus', 'Brooklyn'),
    'fort greene': (40.6920, -73.9740, 'Fort Greene', 'Brooklyn'),
    'clinton hill': (40.6890, -73.9650, 'Clinton Hill', 'Brooklyn'),
    'dumbo': (40.7033, -73.9890, 'DUMBO', 'Brooklyn'),
    'brooklyn heights': (40.6960, -73.9933, 'Brooklyn Heights', 'Brooklyn'),
    'cobble hill': (40.6870, -73.9970, 'Cobble Hill', 'Brooklyn'),
    'carroll gardens': (40.6800, -73.9980, 'Carroll Gardens', 'Brooklyn'),
    'boerum hill': (40.6860, -73.9880, 'Boerum Hill', 'Brooklyn'),
    'red hook': (40.6750, -74.0100, 'Red Hook', 'Brooklyn'),
    'downtown brooklyn': (40.6930, -73.9870, 'Downtown Brooklyn', 'Brooklyn'),
    'sunset park': (40.6514, -74.0081, 'Sunset Park', 'Brooklyn'),
    'bay ridge': (40.6262, -74.0329, 'Bay Ridge', 'Brooklyn'),
    'flatbush': (40.6409, -73.9590, 'Flatbush', 'Brooklyn'),
    'ditmas park': (40.6360, -73.9630, 'Ditmas Park', 'Brooklyn'),
    'kensington': (40.6380, -73.9770, 'Kensington', 'Brooklyn'),
    'prospect lefferts gardens': (40.6580, -73.9530, 'Prospect Lefferts Gardens', 'Brooklyn'),
    'plg': (40.6580, -73.9530, 'Prospect Lefferts Gardens', 'Brooklyn'),

    # Queens
    'astoria': (40.7644, -73.9235, 'Astoria', 'Queens'),
    'long island city': (40.7447, -73.9485, 'Long Island City', 'Queens'),
    'lic': (40.7447, -73.9485, 'Long Island City', 'Queens'),
    'sunnyside': (40.7433, -73.9196, 'Sunnyside', 'Queens'),
    'woodside': (40.7454, -73.9030, 'Woodside', 'Queens'),
    'elmhurst': (40.7380, -73.8800, 'Elmhurst', 'Queens'),
    'jackson heights': (40.7557, -73.8831, 'Jackson Heights', 'Queens'),
    'corona': (40.7450, -73.8600, 'Corona', 'Queens'),
    'ridgewood': (40.7081, -73.9015, 'Ridgewood', 'Queens'),
    'forest hills': (40.7181, -73.8448, 'Forest Hills', 'Queens'),
    'rego park': (40.7240, -73.8600, 'Rego Park', 'Queens'),
    'kew gardens': (40.7130, -73.8290, 'Kew Gardens', 'Queens'),
    'flushing': (40.7675, -73.8331, 'Flushing', 'Queens'),

    # Bronx
    'mott haven': (40.8090, -73.9235, 'Mott Haven', 'Bronx'),
    'south bronx': (40.8150, -73.9200, 'South Bronx', 'Bronx'),
    'port morris': (40.8010, -73.9170, 'Port Morris', 'Bronx'),
    'grand concourse': (40.8350, -73.9180, 'Grand Concourse', 'Bronx'),
    'riverdale': (40.8906, -73.9126, 'Riverdale', 'Bronx'),
    'kingsbridge': (40.8770, -73.9040, 'Kingsbridge', 'Bronx'),
    'fordham': (40.8615, -73.8905, 'Fordham', 'Bronx'),
    'pelham bay': (40.8500, -73.8300, 'Pelham Bay', 'Bronx'),

    # Jersey City / Hoboken (NJ)
    'jersey city': (40.7178, -74.0431, 'Downtown Jersey City', 'Jersey City / Hoboken'),
    'downtown jersey city': (40.7178, -74.0431, 'Downtown Jersey City', 'Jersey City / Hoboken'),
    'exchange place': (40.7160, -74.0325, 'Exchange Place', 'Jersey City / Hoboken'),
    'newport': (40.7270, -74.0340, 'Newport', 'Jersey City / Hoboken'),
    'grove street': (40.7196, -74.0430, 'Grove St', 'Jersey City / Hoboken'),
    'journal square': (40.7320, -74.0630, 'Journal Square', 'Jersey City / Hoboken'),
    'paulus hook': (40.7140, -74.0350, 'Paulus Hook', 'Jersey City / Hoboken'),
    'the heights': (40.7490, -74.0480, 'The Heights (JC)', 'Jersey City / Hoboken'),
    'hoboken': (40.7440, -74.0324, 'Hoboken', 'Jersey City / Hoboken'),
    'weehawken': (40.7700, -74.0200, 'Weehawken', 'Jersey City / Hoboken'),
}

BOROUGH_DEFAULTS = {
    'mnh': ('Manhattan', 40.7831, -73.9712),
    'brk': ('Brooklyn', 40.6782, -73.9442),
    'que': ('Queens', 40.7282, -73.7949),
    'brx': ('Bronx', 40.8448, -73.8648),
    'jys': ('Jersey City / Hoboken', 40.7282, -74.0776),
    'stn': ('Staten Island', 40.5795, -74.1502),
}


def is_nyc_coord(lat, lng):
    try:
        lat = float(lat)
        lng = float(lng)
        return (NYC_BOUNDS['min_lat'] <= lat <= NYC_BOUNDS['max_lat'] and
                NYC_BOUNDS['min_lng'] <= lng <= NYC_BOUNDS['max_lng'])
    except (ValueError, TypeError):
        return False


def clean_price(price_str):
    if not price_str:
        return 0
    clean = re.sub(r'[^\d]', '', str(price_str))
    return int(clean) if clean else 0


def normalize_listing_price(price, title, body):
    full_text = f"{title} {body}".lower()

    # Look for explicit monthly price mentioned in the text
    monthly_m = re.search(
        r'\$([0-9]{1,2},[0-9]{3}|[0-9]{3,5})\s*(?:/\s*mo|per\s*month|a\s*month|/month)',
        full_text,
        re.I
    )
    if not monthly_m:
        monthly_m = re.search(
            r'monthly\s*:?\s*\$?([0-9]{1,2},[0-9]{3}|[0-9]{3,5})',
            full_text,
            re.I
        )
    if monthly_m:
        val = int(monthly_m.group(1).replace(',', ''))
        if 550 <= val <= 25000:
            if price != val and price < 600:
                return val, f"${price}/week"
            return val, None

    # Check for explicit weekly indicators
    weekly_patterns = [
        r'\b(?:per\s+week|a\s+week|/\s*week|/\s*wk|weekly|pagos\s+semanales|week\s+to\s+week)\b',
        r'rooms?\s+start\s+at\s+\$?([0-9]{2,4})\s*(?:per\s+week|a\s+week|weekly)?',
        r'rent\s+is\s+paid\s+weekly',
    ]
    is_weekly = any(re.search(pat, full_text) for pat in weekly_patterns)

    # In NYC, single rooms range $700-$2,000/month.
    # $120-$550 with sober house, room, or weekly rental is weekly!
    if is_weekly or (120 <= price <= 550 and any(w in full_text for w in ['room', 'lodging', 'weekly', 'semanal', 'sober'])):
        if 120 <= price <= 600:
            monthly = round(price * 4.333)
            return monthly, f"${price}/week"

        wk_m = re.search(r'\$?([0-9]{2,4})\s*(?:/\s*week|/\s*wk|per\s*week|a\s*week|weekly)', full_text)
        if wk_m:
            wk_val = int(wk_m.group(1))
            if 100 <= wk_val <= 600:
                monthly = round(wk_val * 4.333)
                return monthly, f"${wk_val}/week"

    # Daily / Nightly
    daily_patterns = [r'\b(?:per\s+night|/\s*night|nightly|per\s+day|daily)\b']
    if any(re.search(pat, full_text) for pat in daily_patterns) and price < 200:
        wk_m = re.search(r'\$?([0-9]{2,4})\s*(?:weekly|per\s+week)', full_text)
        if wk_m:
            wk_val = int(wk_m.group(1))
            monthly = round(wk_val * 4.333)
            return monthly, f"${wk_val}/week"
        monthly = round(price * 30)
        return monthly, f"${price}/day"

    return price, None


def normalize_move_in_date(raw_avail, title, desc, rtype):
    comb = f"{title or ''} {desc or ''}".lower()

    def make_single(lbl, period):
        p_list = [period]
        if period != 'flexible' and re.search(r'\b(flex|flexible|flexibility|negotiable)\b', comb, re.I):
            p_list.append('flexible')
        return lbl, period, p_list

    def make_multi(lbl, primary, periods):
        p_list = list(periods)
        if re.search(r'\b(flex|flexible|flexibility|negotiable)\b', comb, re.I):
            if 'flexible' not in p_list:
                p_list.append('flexible')
        return lbl, primary, p_list

    t_low = (title or '').lower()
    if re.search(r'\b(avail(?:able)?\s+now|avail\.?\s*now|immediate(?:ly)?|ready\s+now|move[\s-]in\s+ready)\b', t_low):
        return make_single('Available Now', 'immediate')

    # Multi-month move-ins
    multi_patterns = [
        (r'\b(?:dec(?:ember)?\s*(?:0?1st|0?1\b)?\s*(?:/|or|–|-|to|\s+and\s+)\s*(?:early\s+)?jan(?:uary)?|late\s+dec(?:ember)?\s*(?:/|or|to|\s+and\s+)\s*(?:early\s+)?jan(?:uary)?)\b',
         'Available Dec 2026 / Jan 2027', '2026-12', ['2026-12', '2027-01']),
        (r'\b(?:nov(?:ember)?\s*(?:0?1st|0?1\b)?\s*(?:/|or|–|-|to|\s+and\s+)\s*(?:early\s+)?dec(?:ember)?|late\s+nov(?:ember)?\s*(?:/|or|to|\s+and\s+)\s*(?:early\s+)?dec(?:ember)?)\b',
         'Available Nov / Dec 2026', '2026-11', ['2026-11', '2026-12']),
        (r'\b(?:jan(?:uary)?\s*(?:0?1st|0?1\b)?\s*(?:/|or|–|-|to|\s+and\s+)\s*(?:early\s+)?feb(?:ruary)?)\b',
         'Available Jan / Feb 2027', '2027-01', ['2027-01', '2027-02']),
        (r'\b(?:aug(?:ust)?\s*(?:0?1st|0?1\b)?\s*(?:/|or|–|-|to|\s+and\s+)\s*(?:early\s+)?sep(?:t(?:ember)?)?)\b',
         'Available Aug / Sep 2027', '2027-09', ['2027-08', '2027-09']),
        (r'\b(?:may\s*(?:0?1st|0?1\b)?\s*(?:/|or|–|-|to|\s+and\s+)\s*(?:early\s+)?jun(?:e)?)\b',
         'Available May / Jun 2027', '2027-05', ['2027-05', '2027-06']),
    ]

    for pat, label, primary, periods in multi_patterns:
        if re.search(pat, comb, re.I):
            return make_multi(label, primary, periods)

    # Structured raw_avail check
    if raw_avail and str(raw_avail).strip().lower() not in ['contact lister', 'missing', 'none']:
        low_av = str(raw_avail).lower()
        if any(w in low_av for w in ['now', 'immediate', 'today', 'asap', 'ready']):
            return make_single('Available Now', 'immediate')
        if any(p in low_av for p in ['01-01', '01-02', 'jan 1', 'jan 2', 'jan 1st', 'january 1']):
            return make_single('Available Jan 1, 2027', '2027-01')
        if any(p in low_av for p in ['12-01', '12-02', 'dec 1', 'dec 15', 'december 1', 'december 1st']):
            return make_single('Available Dec 1, 2026', '2026-12')
        if any(p in low_av for p in ['11-01', '11-15', 'nov 1', 'november 1']):
            return make_single('Available Nov 1, 2026', '2026-11')
        if any(p in low_av for p in ['02-01', 'feb 1', 'february 1']):
            return make_single('Available Feb 1, 2027', '2027-02')

    # Text date patterns
    text_date_patterns = [
        (r'\b(avail(?:able)?\s+now|immediate(?:ly)?\s+available|move[\s-]in\s+ready|ready\s+for\s+move[\s-]in)\b', 'Available Now', 'immediate'),
        (r'\b(?:(?:0?1/0?1|0?1-0?1)(?:/(?:20)?27)?|jan(?:uary)?\s*(?:0?1st|0?1\b|first)|spring\s+(?:semester|sublet|sublease|term|lease))\b', 'Available Jan 1, 2027', '2027-01'),
        (r'\b(?:(?:12/0?1|12-0?1)(?:/(?:20)?26)?|dec(?:ember)?\s*(?:0?1st|0?1\b|first)|mid[\s-]dec(?:ember)?)\b', 'Available Dec 1, 2026', '2026-12'),
        (r'\b(?:(?:11/0?1|11-0?1)(?:/(?:20)?26)?|nov(?:ember)?\s*(?:0?1st|0?1\b|first)|mid[\s-]nov(?:ember)?)\b', 'Available Nov 1, 2026', '2026-11'),
        (r'\b(?:(?:0?2/0?1|0?2-0?1)(?:/(?:20)?27)?|feb(?:ruary)?\s*(?:0?1st|0?1\b|first))\b', 'Available Feb 1, 2027', '2027-02'),
        (r'\b(?:(?:0?3/0?1|0?3-0?1)(?:/(?:20)?27)?|mar(?:ch)?\s*(?:0?1st|0?1\b|first))\b', 'Available Mar 1, 2027', '2027-03'),
        (r'\b(month[\s-]to[\s-]month|flexible\s*lease|mtm|30[\s-]day\s+notice)\b', 'Flexible / Month-to-Month', 'flexible'),
        (r'\bflexible\s*move[\s-]in\b', 'Flexible Move-In', 'flexible'),
    ]

    for pat, label, period in text_date_patterns:
        if re.search(pat, comb, re.I):
            return make_single(label, period)

    if rtype in ['room', 'sublet']:
        return make_single('Available Now', 'immediate')

    return make_single('Contact Lister', 'unspecified')


SUBLET_PATTERNS = [
    r'\bsublet\b',
    r'\bsublease\b',
    r'\bsub-lease\b',
    r'\blease\s+takeover\b',
    r'\blease\s+assignment\b',
    r'\bleasebreak\b',
    r'\bshort[\s-]term\b',
    r'\btemporary\s+(?:lease|housing|rental|room|stay)\b',
    r'\bmonth[\s-]to[\s-]month\b',
    r'\bflexible\s+lease\b',
    r'\bwinter\s+sublet\b',
    r'\bspring\s+sublet\b',
    r'\bsummer\s+sublet\b',
]

ROOM_PATTERNS = [
    r'\b(?:private|single|furnished|master)?\s*rooms?\s+(?:for\s+rent|available)\b',
    r'\bprivate\s+(?:bed)?room\b',
    r'\bsingle\s+room\b',
    r'\broom\s+in\s+(?:a\s+)?(?:shared|\d+\s*(?:bed|br|bdr|bedroom)|house|apartment|condo)\b',
    r'\broommate(?:s)?\b',
    r'\bshared\s+(?:apartment|apt|house|room|living)\b',
    r'\broom\s+available\b',
]


def classify_rental_type(title, body, price=0, bedrooms=1, default_type='entire_unit'):
    if default_type == 'sublet':
        return 'sublet', 'Sublet'
    if default_type == 'room':
        return 'room', 'Single Room'

    text = f"{title} {body}".lower()
    for pat in SUBLET_PATTERNS:
        if re.search(pat, text):
            return 'sublet', 'Sublet'

    for pat in ROOM_PATTERNS:
        if re.search(pat, text):
            return 'room', 'Single Room'

    if 0 < price < 1500 and bedrooms >= 3:
        return 'room', 'Single Room'

    return 'entire_unit', 'Condo / Apt'


def analyze_fees(title, body, explicit_fee_text=None, rental_type=None):
    if explicit_fee_text:
        low = explicit_fee_text.lower()
        if 'no fee' in low or 'zero fee' in low or '0' in low or 'no broker' in low:
            return {
                'has_broker_fee': False,
                'fee_badge': 'No Broker Fee',
                'fee_details': explicit_fee_text
            }
        elif 'fee' in low:
            return {
                'has_broker_fee': True,
                'fee_badge': 'Broker Fee',
                'fee_details': explicit_fee_text
            }

    combined = f"{title} {body}".lower()

    no_fee_patterns = [
        r'\bno\s+fee\b',
        r'\bno\s+broker\s+fee\b',
        r'\bzero\s+fee\b',
        r'\bno\s+fee\s+apt\b',
        r'\bowner\s+pays\s+(?:the\s+)?fee\b',
        r'\bno\s+realtor\s+fee\b',
        r'\bfree\s+month\b',
        r'\bby\s+owner\b',
        r'\bdirect\s+by\s+owner\b',
        r'\bno\s+application\s+fee\b',
        r'\bno-fee\b',
        r'\b0\s+fee\b',
    ]

    fee_patterns = [
        r'\bbroker\s+fee\b',
        r'\bfee\s+applies\b',
        r'\b1\s+month\s+broker\s+fee\b',
        r'\b15%\s+broker\s+fee\b',
        r'\b12%\s+broker\s+fee\b',
        r'\btenant\s+pays\s+(?:the\s+)?fee\b',
        r'\brealtor\s+fee\b',
        r'\bagency\s+fee\b',
    ]

    for pat in no_fee_patterns:
        if re.search(pat, combined):
            return {
                'has_broker_fee': False,
                'fee_badge': 'No Broker Fee',
                'fee_details': 'No Broker Fee (Direct / Owner Pays)'
            }

    for pat in fee_patterns:
        if re.search(pat, combined):
            return {
                'has_broker_fee': True,
                'fee_badge': 'Broker Fee',
                'fee_details': 'Broker / Agent Fee Applies'
            }

    if rental_type in ['room', 'sublet']:
        return {
            'has_broker_fee': False,
            'fee_badge': 'No Broker Fee',
            'fee_details': 'Direct Room / Sublet (No Broker Fee)'
        }

    return {
        'has_broker_fee': None,
        'fee_badge': 'Fee Unspecified',
        'fee_details': 'Fee not explicitly stated; verify with lister'
    }


def geocode_nyc_location(location_text, title='', borough_code=None):
    """
    Geocodes an NYC location string into lat, lng, neighborhood, and borough.
    Falls back to borough centroid with slight jitter to prevent pin overlap.
    """
    text = f"{location_text or ''} {title or ''}".lower()

    # Match specific neighborhood
    for n_key, (n_lat, n_lng, n_name, n_borough) in NYC_NEIGHBORHOOD_MAP.items():
        if re.search(r'\b' + re.escape(n_key) + r'\b', text):
            # Jitter slightly within ~200m so multiple listings in same neighborhood don't stack exactly on top
            j_lat = round(n_lat + random.uniform(-0.002, 0.002), 5)
            j_lng = round(n_lng + random.uniform(-0.002, 0.002), 5)
            return j_lat, j_lng, n_name, n_borough

    # Fallback to borough default
    if borough_code and borough_code in BOROUGH_DEFAULTS:
        b_name, b_lat, b_lng = BOROUGH_DEFAULTS[borough_code]
        j_lat = round(b_lat + random.uniform(-0.015, 0.015), 5)
        j_lng = round(b_lng + random.uniform(-0.015, 0.015), 5)
        return j_lat, j_lng, location_text or b_name, b_name

    # Check for borough names in text
    for b_code, (b_name, b_lat, b_lng) in BOROUGH_DEFAULTS.items():
        if b_name.lower() in text or (b_code == 'mnh' and 'manhattan' in text) or (b_code == 'brk' and 'brooklyn' in text) or (b_code == 'que' and 'queens' in text):
            j_lat = round(b_lat + random.uniform(-0.015, 0.015), 5)
            j_lng = round(b_lng + random.uniform(-0.015, 0.015), 5)
            return j_lat, j_lng, location_text or b_name, b_name

    # Default to NYC center (Manhattan)
    return round(40.7580 + random.uniform(-0.01, 0.01), 5), round(-73.9855 + random.uniform(-0.01, 0.01), 5), location_text or 'New York City', 'Manhattan'


def fetch_craigslist_detail_page(listing, existing_cache=None):
    if existing_cache and listing['id'] in existing_cache:
        c = existing_cache[listing['id']]
        if c.get('images') and len(c['images']) > 0 and 'unsplash' not in c['images'][0]:
            return {**c, 'last_seen': datetime.now(timezone.utc).isoformat()}

    now_iso = datetime.now(timezone.utc).isoformat()
    url = listing['url']
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')

            raw_imgs = re.findall(r'(https://images\.craigslist\.org/[a-zA-Z0-9_]+_600x450\.jpg)', html)
            images = list(dict.fromkeys(raw_imgs))

            body_m = re.search(r'<section id="postingbody"[^>]*>(.*?)</section>', html, re.DOTALL)
            body = ''
            if body_m:
                raw_body = body_m.group(1)
                body = re.sub(r'<[^>]+>', ' ', raw_body).strip()
                body = re.sub(r'\s+', ' ', body)
                body = re.sub(r'QR Code Link to This Post', '', body).strip()

            fee_info = analyze_fees(listing['title'], body, rental_type=listing.get('rental_type'))

            # Square footage
            sqft = listing.get('sqft')
            if not sqft:
                sqft_m = re.search(r'([0-9]{3,5})\s*ft(?:<sup>2</sup>|2)', html, re.I)
                if not sqft_m:
                    sqft_m = re.search(r'\b([0-9]{3,5})\s*(?:sq\s*ft|sqft|square\s*feet)\b', html, re.I)
                if sqft_m:
                    val = int(sqft_m.group(1))
                    if 200 <= val <= 12000:
                        sqft = val

            # Beds / Baths
            beds = listing.get('bedrooms', 1)
            baths = listing.get('bathrooms', 1)
            bb_m = re.search(r'(\d+)\s*BR\s*/\s*([\d\.]+)\s*Ba', html, re.I)
            if bb_m:
                beds = int(bb_m.group(1))
                baths = float(bb_m.group(2))

            # Availability
            avail_text = None
            avail_m = re.search(r'<span[^>]*class="attr[^"]*"[^>]*>\s*available\s+([^<]+)</span>', html, re.I)
            if not avail_m:
                avail_m = re.search(r'class="attr[^"]*available[^"]*">([^<]+)</span>', html, re.I)
            if avail_m:
                avail_text = avail_m.group(1).strip()
            else:
                avail_m = re.search(r'\bavailable\s+([a-zA-Z]{3,9}\s+\d{1,2}|now|immediate|immediately)\b', html, re.I)
                if avail_m:
                    avail_text = avail_m.group(1).strip()

            rental_type, rental_label = classify_rental_type(
                listing['title'],
                body,
                price=listing.get('price', 0),
                bedrooms=beds,
                default_type=listing.get('rental_type', 'entire_unit')
            )

            move_label, primary_period, periods_list = normalize_move_in_date(
                avail_text, listing['title'], body, rental_type
            )

            norm_price, rate_note = normalize_listing_price(
                listing.get('price', 0), listing['title'], body
            )

            # Extract actual posted timestamp from Craigslist HTML
            posted_iso = now_iso
            posted_m = re.search(r'<time[^>]*class="[^"]*timeago[^"]*"[^>]*datetime="([^"]+)"', html, re.I)
            if not posted_m:
                posted_m = re.search(r'<time[^>]*datetime="([^"]+)"', html, re.I)
            if posted_m:
                raw_time = posted_m.group(1).strip()
                try:
                    dt = datetime.fromisoformat(raw_time)
                    posted_iso = dt.isoformat()
                except Exception:
                    posted_iso = raw_time

            first_seen_ts = posted_iso
            if existing_cache and listing['id'] in existing_cache:
                first_seen_ts = existing_cache[listing['id']].get('first_seen') or posted_iso

            res = {
                **listing,
                'price': norm_price,
                'first_seen': first_seen_ts,
                'last_seen': now_iso,
                'bedrooms': beds,
                'bathrooms': baths,
                'sqft': sqft,
                'availability': move_label,
                'move_in_period': primary_period,
                'move_in_periods': periods_list,
                'rental_type': rental_type,
                'rental_type_label': rental_label,
                'images': images[:8] if images else [],
                'has_photos': bool(images),
                'description': body[:600] + ('...' if len(body) > 600 else ''),
                'has_broker_fee': fee_info['has_broker_fee'],
                'fee_badge': fee_info['fee_badge'],
                'fee_details': fee_info['fee_details'],
            }
            if rate_note:
                res['original_rate_note'] = rate_note
            return res
    except Exception as e:
        fee_info = analyze_fees(listing['title'], '', rental_type=listing.get('rental_type'))
        rental_type, rental_label = classify_rental_type(
            listing['title'], '', price=listing.get('price', 0), default_type=listing.get('rental_type', 'entire_unit')
        )
        move_label, primary_period, periods_list = normalize_move_in_date(
            None, listing['title'], '', rental_type
        )
        return {
            **listing,
            'first_seen': now_iso,
            'last_seen': now_iso,
            'rental_type': rental_type,
            'rental_type_label': rental_label,
            'availability': move_label,
            'move_in_period': primary_period,
            'move_in_periods': periods_list,
            'images': [],
            'has_photos': False,
            'description': 'View original Craigslist posting for full description and photos.',
            'has_broker_fee': fee_info['has_broker_fee'],
            'fee_badge': fee_info['fee_badge'],
            'fee_details': fee_info['fee_details'],
        }


def scrape_craigslist_nyc_section(section='apa', section_label='Apartments', default_type='entire_unit', default_label='Condo / Apt', per_borough_limit=50, existing_cache=None):
    """
    Scrapes NYC Craigslist across boroughs:
    - Manhattan (mnh)
    - Brooklyn (brk)
    - Queens (que)
    - Jersey City / NJ (jys)
    - Bronx (brx)
    """
    boroughs = [
        ('mnh', 'Manhattan'),
        ('brk', 'Brooklyn'),
        ('que', 'Queens'),
        ('jys', 'Jersey City / Hoboken'),
        ('brx', 'Bronx'),
        ('stn', 'Staten Island'),
    ]

    pattern = (
        r'<li class="cl-static-search-result"[^>]*>\s*'
        r'<a href="([^"]+)">\s*'
        r'<div class="title">([^<]+)</div>\s*'
        r'<div class="details">\s*'
        r'<div class="price">([^<]+)</div>\s*'
        r'<div class="location">\s*([^<]+)</div>'
    )

    all_raw = []
    seen_urls = set()

    print(f"\n--- Scraping Craigslist NYC {section_label} ({section}) across 6 Boroughs/Areas ---")

    for b_code, b_name in boroughs:
        b_count = 0
        for offset in [0, 120]:
            if b_count >= per_borough_limit:
                break
            url = f"https://newyork.craigslist.org/search/{b_code}/{section}?s={offset}"
            try:
                req = urllib.request.Request(url, headers=HEADERS)
                with urllib.request.urlopen(req, timeout=12) as resp:
                    html = resp.read().decode('utf-8', errors='ignore')

                schema_map = {}
                ld_match = re.search(r'<script\b[^>]*id="ld_searchpage_results"[^>]*>(.*?)</script>', html, re.DOTALL)
                if ld_match:
                    try:
                        data = json.loads(ld_match.group(1))
                        for idx_item, item_wrap in enumerate(data.get('itemListElement', [])):
                            it = item_wrap.get('item', {})
                            schema_map[str(idx_item)] = {
                                'lat': it.get('latitude'),
                                'lng': it.get('longitude'),
                                'bedrooms': it.get('numberOfBedrooms'),
                                'bathrooms': it.get('numberOfBathroomsTotal'),
                                'locality': it.get('address', {}).get('addressLocality', b_name)
                            }
                    except Exception:
                        pass

                matches = re.findall(pattern, html)
                for idx, (post_url, title, price_str, location) in enumerate(matches):
                    if post_url in seen_urls:
                        continue
                    seen_urls.add(post_url)

                    clean_title = html_parser.unescape(title.strip())
                    clean_loc = html_parser.unescape(location.strip())
                    price = clean_price(price_str)
                    if price <= 0:
                        continue

                    schema_info = schema_map.get(str(idx), {})
                    lat = schema_info.get('lat')
                    lng = schema_info.get('lng')

                    if lat and lng and is_nyc_coord(lat, lng):
                        final_lat = float(lat)
                        final_lng = float(lng)
                        final_neighborhood = clean_loc or b_name
                        final_borough = b_name
                    else:
                        final_lat, final_lng, final_neighborhood, final_borough = geocode_nyc_location(
                            clean_loc, clean_title, b_code
                        )

                    listing_id = f"cl-nyc-{re.sub(r'[^a-zA-Z0-9]', '', post_url)[-14:]}"

                    all_raw.append({
                        'id': listing_id,
                        'source': 'craigslist',
                        'source_label': 'Craigslist',
                        'title': clean_title,
                        'price': price,
                        'neighborhood': final_neighborhood,
                        'borough': final_borough,
                        'url': post_url.strip(),
                        'lat': final_lat,
                        'lng': final_lng,
                        'bedrooms': schema_info.get('bedrooms', 1) or 1,
                        'bathrooms': schema_info.get('bathrooms', 1) or 1,
                        'rental_type': default_type,
                        'rental_type_label': default_label,
                        'sqft': None,
                        'address': f"{final_neighborhood}, {final_borough}, NY",
                    })
                    b_count += 1
                    if b_count >= per_borough_limit:
                        break
            except Exception as e:
                print(f"  Error fetching {b_name} {section} s={offset}:", e)
            time.sleep(0.5)

        print(f"  [{b_name}]: collected {b_count} listings")

    # Process details in parallel
    cached_listings = []
    new_to_fetch = []

    for r in all_raw:
        if existing_cache and r['id'] in existing_cache:
            c = existing_cache[r['id']]
            # Only consider genuinely cached if it already has real photos
            if c.get('images') and len(c['images']) > 0 and 'unsplash' not in c['images'][0]:
                cached_listings.append(r)
                continue
        new_to_fetch.append(r)

    print(f"  Detail extraction: {len(cached_listings)} cached with photos, {len(new_to_fetch)} deep fetching real photos...")
    fetcher = lambda l: fetch_craigslist_detail_page(l, existing_cache)
    with ThreadPoolExecutor(max_workers=18) as executor:
        detailed_listings = list(executor.map(fetcher, cached_listings + new_to_fetch))

    return detailed_listings


def scrape_reddit_nyc_housing(existing_cache=None):
    """
    Scrapes NYC Reddit housing communities:
    - r/NYCapartments (offering & sublet feeds)
    - r/nyu & r/columbia student housing sublets
    """
    print("\n--- Scraping NYC Reddit Communities (r/NYCapartments, r/nyu, r/columbia) ---")
    feeds = [
        ('NYCapartments', 'https://www.reddit.com/r/NYCapartments/search/.rss?q=flair%3AOffering+OR+sublet+OR+room+OR+takeover&restrict_sr=1&sort=new'),
        ('NYCapartments Leasebreak', 'https://www.reddit.com/r/NYCapartments/search/.rss?q=leasebreak+OR+%22lease+takeover%22+OR+%22lease+assignment%22&restrict_sr=1&sort=new'),
        ('NYCapartments', 'https://www.reddit.com/r/NYCapartments/.rss'),
        ('NYU', 'https://www.reddit.com/r/nyu/search/.rss?q=sublet+OR+housing+OR+room&restrict_sr=1&sort=new'),
        ('Columbia', 'https://www.reddit.com/r/columbia/search/.rss?q=sublet+OR+housing+OR+room&restrict_sr=1&sort=new'),
    ]

    headers = {
        'User-Agent': (
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/123.0.0.0 Safari/537.36'
        ),
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
    }

    combined_entries = {}
    entry_sub_map = {}
    ns = {'atom': 'http://www.w3.org/2005/Atom'}

    for sub_name, feed_url in feeds:
        time.sleep(1.2)
        for attempt in range(2):
            try:
                req = urllib.request.Request(feed_url, headers=headers)
                with urllib.request.urlopen(req, timeout=10) as resp:
                    xml_data = resp.read()
                    root = ET.fromstring(xml_data)
                    for entry in root.findall('atom:entry', ns):
                        link_el = entry.find('atom:link', ns)
                        href = link_el.attrib.get('href', '') if link_el is not None else ''
                        if href and href not in combined_entries:
                            combined_entries[href] = entry
                            entry_sub_map[href] = sub_name
                    break
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    reset_wait = int(e.headers.get('x-ratelimit-reset', 5))
                    if attempt == 0 and reset_wait <= 15:
                        time.sleep(reset_wait + 2)
                    else:
                        break
                else:
                    break
            except Exception as e:
                print(f"Error fetching Reddit {sub_name} feed:", e)
                break

    print(f"Fetched {len(combined_entries)} unique NYC Reddit posts across communities.")

    listings = []
    seen_ids = set()

    for href, entry in combined_entries.items():
        title_el = entry.find('atom:title', ns)
        content_el = entry.find('atom:content', ns)
        updated_el = entry.find('atom:updated', ns)

        title = title_el.text if title_el is not None and title_el.text else ''
        raw_html = content_el.text if content_el is not None and content_el.text else ''
        post_time = updated_el.text if updated_el is not None and updated_el.text else datetime.now(timezone.utc).isoformat()
        sub_name = entry_sub_map.get(href, 'NYCapartments')

        # Clean HTML content
        clean_desc = re.sub(r'<[^>]+>', ' ', raw_html)
        clean_desc = html_parser.unescape(clean_desc)
        clean_desc = re.sub(r'\s+', ' ', clean_desc).strip()

        full_text = f"{title} {clean_desc}".lower()

        # Filter out "Looking for" / "ISO" posts
        iso_patterns = [
            r'\b(?:looking\s+for|iso\b|seeking|in\s+search\s+of|wanted|anyone\s+subletting|anyone\s+have|desperately\s+looking)\b'
        ]
        offering_patterns = [
            r'\b(?:offering|subletting|room\s+for\s+rent|apartment\s+available|lease\s+takeover|lease\s+transfer|sublease\s+available|reletting)\b'
        ]

        is_iso = any(re.search(p, title.lower()) for p in iso_patterns)
        is_offering = any(re.search(p, title.lower()) for p in offering_patterns)

        if is_iso and not is_offering:
            continue

        # Extract price
        price = 0
        price_matches = re.findall(r'\$([0-9]{1,2},[0-9]{3}|[0-9]{3,4})\b', f"{title} {clean_desc}")
        for pm in price_matches:
            val = int(pm.replace(',', ''))
            if 500 <= val <= 9500:
                price = val
                break

        if price == 0:
            continue

        # Normalize price
        norm_price, rate_note = normalize_listing_price(price, title, clean_desc)

        # Rental type
        rental_type, rental_label = classify_rental_type(title, clean_desc, price=norm_price)

        # Move-in date
        move_label, primary_period, periods_list = normalize_move_in_date(
            None, title, clean_desc, rental_type
        )

        # Fee analysis
        fee_info = analyze_fees(title, clean_desc, rental_type=rental_type)

        # Geocode location
        lat, lng, neighborhood, borough = geocode_nyc_location(clean_desc, title)

        # Image extraction from Reddit preview
        unescaped_html = html_parser.unescape(raw_html)
        img_urls = re.findall(r'(https://preview\.redd\.it/[^"\s\?]+|https://i\.redd\.it/[^"\s\?]+)', unescaped_html)
        images = list(dict.fromkeys(img_urls))

        post_id_match = re.search(r'/comments/([a-zA-Z0-9]+)/', href)
        post_id = post_id_match.group(1) if post_id_match else f"{hash(href)}"
        unique_id = f"reddit-nyc-{post_id}"

        if unique_id in seen_ids:
            continue
        seen_ids.add(unique_id)

        item = {
            'id': unique_id,
            'source': 'reddit',
            'source_label': f"Reddit (r/{sub_name})",
            'title': title,
            'price': norm_price,
            'bedrooms': 1 if rental_type == 'room' else 2,
            'bathrooms': 1.0,
            'sqft': None,
            'neighborhood': neighborhood,
            'borough': borough,
            'address': f"{neighborhood}, {borough}, NY",
            'lat': lat,
            'lng': lng,
            'url': href,
            'images': images[:8],
            'description': clean_desc[:700] + ('...' if len(clean_desc) > 700 else ''),
            'rental_type': rental_type,
            'rental_type_label': rental_label,
            'has_broker_fee': fee_info['has_broker_fee'],
            'fee_badge': fee_info['fee_badge'],
            'fee_details': fee_info['fee_details'],
            'availability': move_label,
            'move_in_period': primary_period,
            'move_in_periods': periods_list,
            'first_seen': post_time,
            'last_seen': datetime.now(timezone.utc).isoformat(),
        }
        if rate_note:
            item['original_rate_note'] = rate_note

        listings.append(item)

    print(f"Processed {len(listings)} high-confidence NYC housing posts from Reddit.")
    return listings


def scrape_zillow_nyc(existing_cache=None):
    """
    Scrapes live rental listings from Zillow across NYC:
    - Manhattan
    - Brooklyn
    - Queens
    - Bronx
    - Jersey City
    - Hoboken
    Extracts verified prices, coordinates, bed/bath counts, floor plans, and high-res photography.
    """
    print("\n--- Scraping Zillow NYC (Manhattan, Brooklyn, Queens, Bronx, JC, Hoboken) ---")
    headers = {
        'User-Agent': (
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/123.0.0.0 Safari/537.36'
        ),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }

    targets = [
        ('https://www.zillow.com/new-york-ny/rentals/', 'Manhattan', 'Manhattan'),
        ('https://www.zillow.com/brooklyn-new-york-ny/rentals/', 'Brooklyn', 'Brooklyn'),
        ('https://www.zillow.com/queens-new-york-ny/rentals/', 'Queens', 'Queens'),
        ('https://www.zillow.com/bronx-new-york-ny/rentals/', 'Bronx', 'Bronx'),
        ('https://www.zillow.com/jersey-city-nj/rentals/', 'Jersey City', 'Jersey City / Hoboken'),
        ('https://www.zillow.com/hoboken-nj/rentals/', 'Hoboken', 'Jersey City / Hoboken'),
    ]

    all_zillow = []
    seen_ids = set()
    now_iso = datetime.now(timezone.utc).isoformat()

    for url, city_label, borough_name in targets:
        time.sleep(1.0)
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=12) as resp:
                html = resp.read().decode('utf-8', errors='ignore')
            m = re.search(r'<script id="__NEXT_DATA__" type="application/json">({.*?})</script>', html)
            if not m:
                continue
            data = json.loads(m.group(1))
            results = (
                data.get('props', {})
                .get('pageProps', {})
                .get('searchPageState', {})
                .get('cat1', {})
                .get('searchResults', {})
                .get('listResults', [])
            )

            b_count = 0
            for item in results:
                price = 0
                if item.get('minBaseRent'):
                    price = int(item['minBaseRent'])
                elif item.get('unformattedPrice'):
                    price = int(item['unformattedPrice'])
                elif item.get('price'):
                    c = re.sub(r'[^\d]', '', str(item['price']))
                    if c:
                        price = int(c)
                elif item.get('units'):
                    u_prices = []
                    for u in item['units']:
                        if u.get('price'):
                            c = re.sub(r'[^\d]', '', str(u['price']))
                            if c:
                                u_prices.append(int(c))
                    if u_prices:
                        price = min(u_prices)

                if price < 500 or price > 25000:
                    continue

                lat_long = item.get('latLong') or {}
                lat = lat_long.get('latitude')
                lng = lat_long.get('longitude')
                if not lat or not lng or not is_nyc_coord(lat, lng):
                    continue

                detail = item.get('detailUrl', '')
                if detail.startswith('/'):
                    detail = f'https://www.zillow.com{detail}'

                zid = item.get('zpid') or item.get('id') or item.get('lotId') or abs(hash(detail))
                unique_id = f'zillow_nyc_{zid}'
                if unique_id in seen_ids:
                    continue
                seen_ids.add(unique_id)

                building_name = item.get('buildingName')
                street_addr = item.get('addressStreet') or item.get('address') or city_label
                title = building_name or street_addr or f'Rental Community in {city_label}'
                addr = item.get('address') or f'{street_addr}, {city_label}, NY'

                # Match neighborhood
                neigh = item.get('addressCity') or city_label
                for n_key, (n_lat, n_lng, n_name, n_b) in NYC_NEIGHBORHOOD_MAP.items():
                    if n_key in addr.lower() or n_key in title.lower():
                        neigh = n_name
                        borough_name = n_b
                        break

                beds = item.get('beds')
                if beds is None and item.get('units'):
                    b_list = [int(u['beds']) for u in item['units'] if u.get('beds') is not None and str(u.get('beds')).isdigit()]
                    if b_list:
                        beds = min(b_list)
                beds = int(beds) if beds is not None else 1

                baths = item.get('baths')
                baths = float(baths) if baths is not None else 1.0

                sqft = item.get('area')

                img_src = item.get('imgSrc')
                carousel = [p.get('url') for p in item.get('carouselPhotosComposable', {}).get('photos', []) if p.get('url')]
                images = []
                if img_src:
                    images.append(img_src)
                for c in carousel:
                    if c not in images:
                        images.append(c)
                if not images:
                    images = ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80']

                unit_summary = ""
                if item.get('units'):
                    u_types = []
                    for u in item['units'][:3]:
                        b = u.get('beds')
                        p = u.get('price')
                        if b is not None and p:
                            b_str = 'Studio' if str(b) == '0' else f'{b}BR'
                            u_types.append(f'{b_str} from {p}')
                    if u_types:
                        unit_summary = f" Floor plans: {', '.join(u_types)}."

                desc = f"{title} located at {addr}.{unit_summary} Professionally managed rental community. View full floor plans, virtual tours, and schedule a showing directly on Zillow."

                all_zillow.append({
                    'id': unique_id,
                    'source': 'zillow',
                    'source_label': 'Zillow',
                    'title': title,
                    'price': price,
                    'address': addr,
                    'neighborhood': neigh,
                    'borough': borough_name,
                    'lat': round(lat, 6),
                    'lng': round(lng, 6),
                    'bedrooms': beds,
                    'bathrooms': baths,
                    'sqft': sqft,
                    'url': detail,
                    'images': images[:8],
                    'description': desc,
                    'rental_type': 'entire_unit',
                    'rental_type_label': 'Condo / Apt',
                    'has_broker_fee': False,
                    'fee_badge': 'No Broker Fee',
                    'fee_details': 'Direct Management Leasing (No Broker Fee)',
                    'availability': 'Available Now',
                    'move_in_period': 'immediate',
                    'move_in_periods': ['immediate'],
                    'first_seen': now_iso,
                    'last_seen': now_iso,
                })
                b_count += 1

            print(f"  [{city_label}]: collected {b_count} Zillow listings")
        except Exception as e:
            print(f"  Error fetching Zillow {city_label}:", e)

    print(f"Total live Zillow NYC listings extracted: {len(all_zillow)}")
    return all_zillow


def deduplicate_listings(items):
    """
    Deduplicates cross-posted listings across sources by distance, price, and specs.
    """
    print(f"\nDeduplicating {len(items)} NYC listings...")
    merged = []
    skipped = set()
    total_merged = 0

    for i in range(len(items)):
        if i in skipped:
            continue
        l1 = dict(items[i])
        lat1, lng1 = l1.get('lat', 0), l1.get('lng', 0)
        p1 = l1.get('price', 0)
        b1 = l1.get('bedrooms', 1)
        s1 = l1.get('source', '')
        t1 = l1.get('title', '')
        rt1 = l1.get('rental_type', '')

        for j in range(i + 1, len(items)):
            if j in skipped:
                continue
            l2 = items[j]
            lat2, lng2 = l2.get('lat', 0), l2.get('lng', 0)
            p2 = l2.get('price', 0)
            b2 = l2.get('bedrooms', 1)
            s2 = l2.get('source', '')
            t2 = l2.get('title', '')
            rt2 = l2.get('rental_type', '')

            # Calculate approx distance in meters
            dist = math.hypot((lat1 - lat2) * 111000, (lng1 - lng2) * 85000)

            is_dupe = False
            if s1 != s2 and dist < 50 and b1 == b2 and rt1 == rt2 and abs(p1 - p2) <= 100:
                is_dupe = True
            elif s1 == s2 and dist < 20 and b1 == b2 and p1 == p2 and (t1.strip().lower() == t2.strip().lower()):
                is_dupe = True

            if is_dupe:
                skipped.add(j)
                total_merged += 1

                s1_label = l1.get('source_label') or l1.get('source', 'Unknown')
                s2_label = l2.get('source_label') or l2.get('source', 'Unknown')
                sources = l1.get('cross_posted_sources', [s1_label])
                if s2_label not in sources:
                    sources.append(s2_label)
                l1['cross_posted_sources'] = sources

                # Merge images
                existing_imgs = l1.get('images', [])
                for img in l2.get('images', []):
                    if img not in existing_imgs and len(existing_imgs) < 8:
                        existing_imgs.append(img)
                l1['images'] = existing_imgs

                if l2.get('has_broker_fee') is False:
                    l1['has_broker_fee'] = False
                    l1['fee_badge'] = 'No Broker Fee'

        merged.append(l1)

    print(f"Deduplication finished: Merged {total_merged} duplicates ({len(items)} -> {len(merged)})")
    return merged


def main():
    start_time = time.time()
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    existing_cache = {}
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
                old_data = json.load(f)
                for item in old_data:
                    existing_cache[item['id']] = item
            print(f"Loaded {len(existing_cache)} existing NYC listings from cache.")
        except Exception as e:
            print("Could not load existing NYC cache:", e)

    # 1. Craigslist NYC Apartments (apa) across 6 boroughs/areas
    cl_apts = scrape_craigslist_nyc_section(
        section='apa',
        section_label='Apartments',
        default_type='entire_unit',
        default_label='Condo / Apt',
        per_borough_limit=100,
        existing_cache=existing_cache
    )

    # 2. Craigslist NYC Rooms & Shares (roo)
    cl_rooms = scrape_craigslist_nyc_section(
        section='roo',
        section_label='Rooms & Shares',
        default_type='room',
        default_label='Single Room',
        per_borough_limit=65,
        existing_cache=existing_cache
    )

    # 3. Craigslist NYC Sublets & Temporary (sub)
    cl_sublets = scrape_craigslist_nyc_section(
        section='sub',
        section_label='Sublets & Temporary',
        default_type='sublet',
        default_label='Sublet',
        per_borough_limit=45,
        existing_cache=existing_cache
    )

    # 4. Reddit NYC Housing
    reddit_listings = scrape_reddit_nyc_housing(existing_cache=existing_cache)

    # 5. Zillow NYC (Manhattan, Brooklyn, Queens, Bronx, Jersey City, Hoboken)
    zillow_listings = scrape_zillow_nyc(existing_cache=existing_cache)

    # Combine all
    all_listings = cl_apts + cl_rooms + cl_sublets + reddit_listings + zillow_listings

    # Deduplicate
    final_listings = deduplicate_listings(all_listings)

    # Sort by newest / last_seen
    final_listings.sort(key=lambda x: x.get('last_seen', ''), reverse=True)

    # Write output JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_listings, f, indent=2, ensure_ascii=False)

    # Compute metadata
    now_iso = datetime.now(timezone.utc).isoformat()
    sources_summary = {}
    boroughs_summary = {}
    types_summary = {}
    no_fee_count = 0

    for l in final_listings:
        src = l.get('source_label', l.get('source', 'Unknown'))
        sources_summary[src] = sources_summary.get(src, 0) + 1

        b = l.get('borough', 'Manhattan')
        boroughs_summary[b] = boroughs_summary.get(b, 0) + 1

        t = l.get('rental_type_label', 'Condo / Apt')
        types_summary[t] = types_summary.get(t, 0) + 1

        if l.get('has_broker_fee') is False:
            no_fee_count += 1

    metadata = {
        'last_updated': now_iso,
        'city': 'New York City',
        'city_id': 'nyc',
        'total_listings': len(final_listings),
        'no_broker_fee_listings': no_fee_count,
        'sources_summary': sources_summary,
        'boroughs_summary': boroughs_summary,
        'types_summary': types_summary,
        'elapsed_seconds': round(time.time() - start_time, 2)
    }

    with open(METADATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)

    print("\n==========================================")
    print(f"NYC Scraping Complete!")
    print(f"Total Listings: {len(final_listings)}")
    print(f"No Broker Fee: {no_fee_count}")
    print(f"Boroughs: {boroughs_summary}")
    print(f"Sources: {sources_summary}")
    print(f"Time Taken: {round(time.time() - start_time, 2)}s")
    print(f"Written to: {OUTPUT_FILE}")
    print("==========================================")


if __name__ == '__main__':
    main()
