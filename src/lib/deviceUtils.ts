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

  try {
    // We'll try to get more detailed data
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('Primary Geo API failed');
    const data = await res.json();
    
    ip = data.ip || "0.0.0.0";
    location = {
      city: data.city || data.region || 'Unknown',
      country: data.country_name || 'Unknown',
      region: data.region || 'Unknown'
    };
  } catch (e) {
    console.error("Geo API Error:", e);
    // Fallback if possible
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      ip = data.ip;
    } catch (e2) {}
  }

  return {
    userAgent: ua,
    lastIp: ip,
    location,
    deviceInfo: {
      browser,
      os,
      isMobile
    }
  };
}
