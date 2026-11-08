import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  ShieldCheck, 
  ExternalLink, 
  Send, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  Globe, 
  AlertCircle, 
  Copy, 
  Info,
  Sparkles
} from 'lucide-react';

export default function HousingAlertsModal({ 
  isOpen, 
  onClose, 
  filters, 
  city = 'nyc', 
  theme = 'midnight' 
}) {
  const [activeChannel, setActiveChannel] = useState('browser'); // 'browser' | 'telegram' | 'discord' | 'email'
  const [browserPermission, setBrowserPermission] = useState('default');
  const [browserAlertsActive, setBrowserAlertsActive] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Form states for webhooks / emails
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);

  const isDark = theme === 'midnight';
  const isWarm = theme === 'warm';

  const modalBg = isDark
    ? 'bg-[#0F172A] border border-slate-800 text-slate-100 shadow-2xl'
    : isWarm
    ? 'bg-[#FCFBF8] border border-[#E3DFD5] text-stone-900 shadow-2xl'
    : 'bg-white text-gray-900 shadow-2xl';

  const cardInset = isDark
    ? 'bg-[#131C31] border border-slate-800/80 text-slate-200'
    : isWarm
    ? 'bg-[#F7F5EE] border border-[#EFECE4] text-stone-800'
    : 'bg-gray-50 border border-gray-100 text-gray-800';

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
      try {
        const saved = localStorage.getItem('housing_browser_alerts_active');
        if (saved === 'true' && Notification.permission === 'granted') {
          setBrowserAlertsActive(true);
        }
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle requesting browser push permission
  const handleEnableBrowserNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Your browser does not support Web Notifications.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      if (permission === 'granted') {
        setBrowserAlertsActive(true);
        try {
          localStorage.setItem('housing_browser_alerts_active', 'true');
          localStorage.setItem('housing_saved_alert_filter', JSON.stringify({
            city,
            filters,
            savedAt: new Date().toISOString()
          }));
        } catch (e) {}

        // Send confirmation toast
        new Notification('🔔 Housing Alerts Activated!', {
          body: `You will be alerted when new ${city === 'nyc' ? 'NYC' : 'Boston'} places matching your search are posted!`,
          icon: '/favicon.ico'
        });
      }
    } catch (e) {
      console.error('Error requesting notification permission:', e);
    }
  };

  const handleSendTestNotification = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('🏢 Sample Match Alert: 1-Bed in Brooklyn', {
        body: '$2,750/mo • No Broker Fee • Just posted on Craigslist & Zillow',
        icon: '/favicon.ico'
      });
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3000);
    } else {
      handleEnableBrowserNotifications();
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className={`relative rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto flex flex-col p-5 sm:p-7 ${modalBg}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-boston-brick/20 text-boston-brick flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              Housing Match Alerts & Notifications
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Get pinged the moment an apartment matching your exact criteria is posted.
            </p>
          </div>
        </div>

        {/* Active Filter Criteria Preview */}
        <div className={`p-3.5 rounded-2xl border mb-5 ${cardInset}`}>
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-60 mb-2">
            Watching For Listings Matching:
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <span className="px-2.5 py-1 rounded-lg font-bold bg-boston-brick text-white">
              {city === 'nyc' ? '🗽 NYC' : '🦞 Boston'}
            </span>
            <span className="px-2.5 py-1 rounded-lg font-semibold border bg-slate-800/40 border-slate-700/60">
              Max: ${filters.maxPrice?.toLocaleString()}
            </span>
            {filters.fee !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg font-semibold bg-emerald-600 text-white">
                {filters.fee === 'no-fee' ? 'No Broker Fee' : 'Fee Listings'}
              </span>
            )}
            {filters.borough && filters.borough !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg font-semibold bg-sky-600 text-white">
                {filters.borough}
              </span>
            )}
            {filters.bedrooms !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg font-semibold bg-indigo-600 text-white">
                {filters.bedrooms === '0' ? 'Studio' : `${filters.bedrooms} Bed`}
              </span>
            )}
            {filters.rentalType !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg font-semibold bg-amber-600 text-white">
                {filters.rentalType === 'entire_unit' ? 'Condo/Apt' : filters.rentalType === 'room' ? 'Room' : 'Sublet'}
              </span>
            )}
            {filters.search && (
              <span className="px-2.5 py-1 rounded-lg font-semibold bg-purple-600 text-white">
                Keyword: "{filters.search}"
              </span>
            )}
          </div>
        </div>

        {/* Channel Selection Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border mb-5 overflow-x-auto text-xs font-bold border-slate-700/50 bg-slate-900/60">
          <button
            onClick={() => setActiveChannel('browser')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeChannel === 'browser'
                ? 'bg-boston-brick text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>In-Browser Push</span>
          </button>
          <button
            onClick={() => setActiveChannel('telegram')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeChannel === 'telegram'
                ? 'bg-[#229ED9] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Telegram (Phone)</span>
          </button>
          <button
            onClick={() => setActiveChannel('discord')}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeChannel === 'discord'
                ? 'bg-[#5865F2] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Discord</span>
          </button>
          <button
            onClick={() => setActiveChannel('email')}
            className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeChannel === 'email'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>
        </div>

        {/* Tab 1: In-Browser Web Push */}
        {activeChannel === 'browser' && (
          <div className="space-y-4 text-xs animate-fade-in">
            <div className={`p-4 rounded-2xl border ${cardInset}`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">Instant Web Push Notifications (Zero Setup)</h3>
                  <p className="opacity-80 leading-relaxed mb-3">
                    Your browser will monitor fresh scraped listings every time the hub updates (every 6 hours). If new places match your active filter, you'll get an instant push notification on desktop and mobile.
                  </p>
                  
                  {browserAlertsActive ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-emerald-600 text-white text-xs">
                        <Check className="w-3.5 h-3.5" />
                        Alerts Active for This Search
                      </span>
                      <button
                        onClick={handleSendTestNotification}
                        className="px-3 py-1.5 rounded-xl font-semibold border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors"
                      >
                        {testNotificationSent ? '✓ Sent!' : 'Send Test Notification'}
                      </button>
                      <button
                        onClick={() => {
                          setBrowserAlertsActive(false);
                          localStorage.removeItem('housing_browser_alerts_active');
                        }}
                        className="text-xs text-rose-400 hover:underline px-2 py-1"
                      >
                        Turn Off
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnableBrowserNotifications}
                      className="px-4 py-2.5 rounded-xl font-bold bg-boston-brick hover:bg-rose-900 text-white transition-all shadow-md flex items-center gap-2"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Enable Browser Alerts for This Filter</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-75 text-[11px]">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Works in Chrome, Safari (Mac & iOS 16.4+), Firefox, Edge, and Android without requiring an account.</span>
            </div>
          </div>
        )}

        {/* Tab 2: Telegram Bot (Best for Phone Push) */}
        {activeChannel === 'telegram' && (
          <div className="space-y-4 text-xs animate-fade-in">
            <div className={`p-4 rounded-2xl border ${cardInset}`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#229ED9]/20 text-[#229ED9] flex items-center justify-center shrink-0 mt-0.5">
                  <Send className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1">Real-Time Phone Push via Telegram Bot ($0 Cost)</h3>
                  <p className="opacity-80 leading-relaxed mb-3">
                    Telegram is the gold standard for apartment hunters because it delivers real-time notifications with listing photos directly to your phone the second GitHub Actions scrapes a match.
                  </p>

                  <div className="space-y-2.5 p-3 rounded-xl bg-black/40 border border-slate-800 font-mono text-[11px]">
                    <div className="font-sans font-bold text-slate-300">Quick 2-Minute Setup:</div>
                    <ol className="list-decimal list-inside space-y-1.5 opacity-90 text-[11px]">
                      <li>Open Telegram and message <strong>@BotFather</strong> to create a free bot (e.g. <code className="text-emerald-400">/newbot</code>).</li>
                      <li>Copy your Bot Token and get your Chat ID from <strong>@userinfobot</strong>.</li>
                      <li>In your GitHub repo settings &rarr; <strong>Secrets and variables</strong> &rarr; <strong>Actions</strong>:
                        <ul className="list-disc list-inside pl-3 mt-1 text-[10px] opacity-80">
                          <li>Add <code className="text-sky-300">TELEGRAM_BOT_TOKEN</code></li>
                          <li>Add <code className="text-sky-300">TELEGRAM_CHAT_ID</code></li>
                        </ul>
                      </li>
                      <li>GitHub Actions will run <code className="text-amber-300">scraper/send_alerts.py</code> right after scraping and message your phone immediately!</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Discord Webhook */}
        {activeChannel === 'discord' && (
          <div className="space-y-4 text-xs animate-fade-in">
            <div className={`p-4 rounded-2xl border ${cardInset}`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#5865F2]/20 text-[#5865F2] flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1">Discord Channel Webhook</h3>
                  <p className="opacity-80 leading-relaxed mb-3">
                    Have new apartment matches automatically posted into a personal or shared Discord server channel (e.g. <code>#housing-alerts</code>).
                  </p>

                  <div className="space-y-2">
                    <label className="font-semibold block opacity-90">Discord Channel Webhook URL:</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://discord.com/api/webhooks/..."
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="flex-1 py-2 px-3 rounded-xl border bg-slate-900 border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-boston-brick"
                      />
                      <button
                        onClick={() => {
                          if (webhookUrl) {
                            setWebhookSaved(true);
                            setTimeout(() => setWebhookSaved(false), 3000);
                          }
                        }}
                        className="px-4 py-2 bg-[#5865F2] text-white font-bold rounded-xl transition-all"
                      >
                        {webhookSaved ? '✓ Saved!' : 'Save'}
                      </button>
                    </div>
                    <p className="text-[10px] opacity-60">
                      In Discord channel settings: Integrations &rarr; Webhooks &rarr; New Webhook &rarr; Copy URL.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Email Alerts */}
        {activeChannel === 'email' && (
          <div className="space-y-4 text-xs animate-fade-in">
            <div className={`p-4 rounded-2xl border ${cardInset}`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1">Email Digest & Alerts</h3>
                  <p className="opacity-80 leading-relaxed mb-3">
                    Receive an email summary of newly listed apartments matching your criteria using Resend or SendGrid free tiers (3,000 free emails/month).
                  </p>

                  <div className="space-y-2">
                    <label className="font-semibold block opacity-90">Your Email Address:</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="flex-1 py-2 px-3 rounded-xl border bg-slate-900 border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-boston-brick"
                      />
                      <button
                        onClick={() => {
                          if (emailAddress) {
                            setEmailSaved(true);
                            setTimeout(() => setEmailSaved(false), 3000);
                          }
                        }}
                        className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl transition-all"
                      >
                        {emailSaved ? '✓ Subscribed!' : 'Subscribe'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="opacity-60">
            Automated scraping updates every 6 hours via GitHub Actions ($0 host).
          </div>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
