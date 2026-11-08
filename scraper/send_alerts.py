#!/usr/bin/env python3
"""
Housing Match Notification Dispatcher for GitHub Actions or local execution.
Supports:
1. Telegram Bot (Instant push to phone with photos & direct links)
2. Discord Webhooks (Channel notifications)
3. Console audit logs
"""

import os
import sys
import json
import urllib.request
import urllib.parse
from datetime import datetime, timezone

def send_telegram_alert(token, chat_id, listing, city_name='NYC'):
    title = listing.get('title', 'New Listing')
    price = listing.get('price', 0)
    beds = listing.get('bedrooms', 0)
    bed_str = 'Studio' if beds == 0 else f'{beds} Bed'
    baths = listing.get('bathrooms', 1)
    neigh = listing.get('neighborhood') or listing.get('borough') or city_name
    borough = listing.get('borough', '')
    fee_str = '🟢 No Broker Fee' if listing.get('has_broker_fee') is False else 'Broker Fee'
    source = listing.get('source_label', listing.get('source', 'Web'))
    url = listing.get('url', '')

    caption = (
        f"🏢 <b>NEW {city_name.upper()} HOUSING ALERT</b>\n\n"
        f"📍 <b>{neigh}</b>" + (f", {borough}" if borough and borough != neigh else "") + "\n"
        f"💰 <b>${price:,}/month</b> ({fee_str})\n"
        f"🛏️ {bed_str} | 🛁 {baths} Bath\n"
        f"🌐 Source: {source}\n\n"
        f"🔗 <a href='{url}'>Open Original Listing</a>"
    )

    img = listing.get('images', [None])[0]
    api_url = f"https://api.telegram.org/bot{token}/"

    try:
        if img and img.startswith('http') and 'unsplash' not in img:
            endpoint = api_url + "sendPhoto"
            payload = json.dumps({
                "chat_id": chat_id,
                "photo": img,
                "caption": caption,
                "parse_mode": "HTML"
            }).encode('utf-8')
        else:
            endpoint = api_url + "sendMessage"
            payload = json.dumps({
                "chat_id": chat_id,
                "text": caption,
                "parse_mode": "HTML",
                "disable_web_page_preview": False
            }).encode('utf-8')

        req = urllib.request.Request(endpoint, data=payload, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except Exception as e:
        print(f"Failed to send Telegram alert: {e}")
        return False

def send_discord_alert(webhook_url, listing, city_name='NYC'):
    title = listing.get('title', 'New Listing')
    price = listing.get('price', 0)
    beds = listing.get('bedrooms', 0)
    bed_str = 'Studio' if beds == 0 else f'{beds} Bed'
    baths = listing.get('bathrooms', 1)
    neigh = listing.get('neighborhood') or listing.get('borough') or city_name
    fee_str = 'No Broker Fee' if listing.get('has_broker_fee') is False else 'Fee'
    url = listing.get('url', '')
    img = listing.get('images', [None])[0]

    embed = {
        "title": f"New {city_name} Listing: ${price:,}/mo - {neigh}",
        "url": url,
        "description": f"**{title}**\n\n**Price:** ${price:,}/mo\n**Layout:** {bed_str} / {baths} Bath\n**Fee:** {fee_str}",
        "color": 15548997 if listing.get('has_broker_fee') is False else 3447003,
    }
    if img and img.startswith('http'):
        embed["image"] = {"url": img}

    payload = json.dumps({"embeds": [embed]}).encode('utf-8')
    try:
        req = urllib.request.Request(webhook_url, data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'HousingNotifier/1.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status in [200, 204]
    except Exception as e:
        print(f"Failed to send Discord alert: {e}")
        return False

def main():
    telegram_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    telegram_chat = os.environ.get('TELEGRAM_CHAT_ID')
    discord_webhook = os.environ.get('DISCORD_WEBHOOK_URL')

    if not (telegram_token and telegram_chat) and not discord_webhook:
        print("No notification credentials found in environment (TELEGRAM_BOT_TOKEN, DISCORD_WEBHOOK_URL).")
        print("To enable phone push notifications, add these secrets to your GitHub repository.")
        return

    now = datetime.now(timezone.utc)
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    nyc_path = os.path.join(base_dir, 'public', 'data', 'nyc_listings.json')
    boston_path = os.path.join(base_dir, 'public', 'data', 'listings.json')

    alerts_sent = 0
    for path, city in [(nyc_path, 'NYC'), (boston_path, 'Boston')]:
        if not os.path.exists(path):
            continue
        with open(path, 'r', encoding='utf-8') as f:
            listings = json.load(f)

        # Alert on listings seen in the last 6 hours
        for item in listings:
            ts = item.get('first_seen')
            if not ts:
                continue
            try:
                dt = datetime.fromisoformat(ts)
                diff_hours = (now - dt).total_seconds() / 3600
                if diff_hours <= 6.0:
                    if telegram_token and telegram_chat:
                        send_telegram_alert(telegram_token, telegram_chat, item, city)
                    if discord_webhook:
                        send_discord_alert(discord_webhook, item, city)
                    alerts_sent += 1
                    if alerts_sent >= 10: # Rate limit to avoid spamming
                        break
            except Exception:
                continue

    print(f"Dispatched {alerts_sent} housing match alerts successfully.")

if __name__ == '__main__':
    main()
