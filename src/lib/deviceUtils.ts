export async function getDeviceInfo() {
  const ua = navigator.userAgent;
  const isMobile = /Mobile|Android|iPhone/i.test(ua);
  
  let browser = "Unknown";
  if (ua.indexOf("Chrome") > -1) browser = "Chrome";
  else if (ua.indexOf("Safari") > -1) browser = "Safari";
  else if (ua.indexOf("Firefox") > -1) browser = "Firefox";
  else if (ua.indexOf("Edge") > -1) browser = "Edge";
  
  let os = "Unknown";
  if (ua.indexOf("Windows") > -1) os = "Windows";
  else if (ua.indexOf("Mac") > -1) os = "Mac OS";
  else if (ua.indexOf("Android") > -1) os = "Android";
  else if (ua.indexOf("iPhone") > -1) os = "iOS";
  else if (ua.indexOf("Linux") > -1) os = "Linux";

  let ip = "0.0.0.0";
  let location = { city: 'Unknown', country: 'Unknown', region: 'Unknown' };

  const geoAPIs = [
    {
      url: 'https://ipapi.co/json/',
      parser: (d: any) => ({
        ip: d.ip,
        city: d.city || d.region,
        country: d.country_name,
        region: d.region
      })
    },
    {
      url: 'https://freeipapi.com/api/json',
      parser: (d: any) => ({
        ip: d.ipAddress,
        city: d.cityName,
        country: d.countryName,
        region: d.regionName
      })
    },
    {
      url: 'https://ip.seeip.org/geoip',
      parser: (d: any) => ({
        ip: d.ip,
        city: d.city,
        country: d.country,
        region: d.region
      })
    }
  ];

  for (const api of geoAPIs) {
    try {
      const res = await fetch(api.url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        const parsed = api.parser(data);
        if (parsed.ip) {
          ip = parsed.ip;
          location = {
            city: parsed.city || 'Unknown',
            country: parsed.country || 'Unknown',
            region: parsed.region || 'Unknown'
          };
          break; // Success!
        }
      }
    } catch (e) {
      // Continue to next API
    }
  }

  // Final fallback for IP only if location failed
  if (ip === "0.0.0.0") {
    try {
      const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        ip = data.ip || ip;
      }
    } catch (e) {}
  }

  return {
    userAgent: ua,
    lastIp: ip,
    location,
    deviceInfo: {
      browser,
      os,
      isMobile,
      isWebView: isWebView(ua)
    }
  };
}

function isWebView(ua: string) {
  const rules = [
    'WebView',
    '(iPhone|iPod|iPad)(?!.*Safari\/)',
    'Android.*(wv|\.0\.0\.0)',
    'FBAN',
    'FBAV',
    'Instagram',
    'Twitter',
    'Line',
    'Threads'
  ];
  const regex = new RegExp(rules.join('|'), 'ig');
  return regex.test(ua);
}
