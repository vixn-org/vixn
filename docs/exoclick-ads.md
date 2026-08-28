# ExoClick Advertising Configuration (Archived)

> **Status**: REMOVED from website on 2026-08-28. Replaced with Adsterra.

## Site Verification
- File: `public/efe7ca6b87c597d3413e64cd77a6a6aa.html`
- Domain: `https://vixn.fun`

## Ad Zones

### 1. Banner (Zone: 6012542)
- Provider: `https://a.magsrv.com/ad-provider.js`
- Class: `eas6a97888e2`
- Code:
```html
<script async type="application/javascript" src="https://a.magsrv.com/ad-provider.js"></script>
<ins class="eas6a97888e2" data-zoneid="6012542"></ins>
<script>(AdProvider = window.AdProvider || []).push({"serve": {}});</script>
```

### 2. Popunder (Zone: 6012548)
- Provider: `https://a.pemsrv.com`
- Syndication: `https://s.pemsrv.com`
- Config: `frequency_period: 60, frequency_count: 1, trigger_method: 3`
- Full popunder script was embedded inline via `dangerouslySetInnerHTML`

### 3. Instant Message (Zone: 6012550)
- Provider: `https://a.magsrv.com/ad-provider.js`
- Class: `eas6a97888e6`
- Code:
```html
<script async type="application/javascript" src="https://a.magsrv.com/ad-provider.js"></script>
<ins class="eas6a97888e6" data-zoneid="6012550"></ins>
<script>(AdProvider = window.AdProvider || []).push({"serve": {}});</script>
```

### 4. Sticky Banner (Zone: 6012554)
- Provider: `https://a.magsrv.com/ad-provider.js`
- Class: `eas6a97888e17`
- Code:
```html
<script async type="application/javascript" src="https://a.magsrv.com/ad-provider.js"></script>
<ins class="eas6a97888e17" data-zoneid="6012554"></ins>
<script>(AdProvider = window.AdProvider || []).push({"serve": {}});</script>
```

### 5. Desktop Fullpage Interstitial (Zone: 6012560)
- Provider: `https://a.pemsrv.com/ad-provider.js`
- Class: `eas6a97888e35`
- Code:
```html
<script async type="application/javascript" src="https://a.pemsrv.com/ad-provider.js"></script>
<ins class="eas6a97888e35" data-zoneid="6012560"></ins>
<script>(AdProvider = window.AdProvider || []).push({"serve": {}});</script>
```

## Files That Were Used
- `components/ads/exoclick-ads.tsx` — Global component (Popunder, IM, Sticky, Interstitial)
- `components/ads/exoclick-banner.tsx` — Banner component (Zone 6012542)
- `lib/exoclick.ts` — Debounced serve helper
