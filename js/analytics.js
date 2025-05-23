// analytics.js - Visitor tracking with IP collection and session management

// Skip execution if running locally or via file://
const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.protocol === 'file:';

if (isLocal) {
  console.debug('Analytics disabled for local development');
} else {
  // Format current date and time in a human-readable format
const formatTimestamp = () => {
  const now = new Date();
  return now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

// Collect and send visitor data
const collectAndSendData = async () => {
  try {
    // Start with basic visitor data that doesn't require async operations
    const visitorData = {
      timestamp: formatTimestamp(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || 'direct',
      ipAddress: 'unknown' // Will be updated if IP fetch succeeds
    };

    // Try to get IP address with a timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json', {
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        if (ipData && ipData.ip) {
          visitorData.ipAddress = ipData.ip;
        }
      }
    } catch (ipError) {
      // Silently fail - we'll still send other data
      console.debug('IP address not available:', ipError);
    }

    // Prepare form data with all collected information
    const formData = new FormData();
    formData.append('access_key', 'd80263a9-d39e-4e9f-80b9-8825c06dda9a');
    
    // Add all visitor data to form
    Object.entries(visitorData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Send the data
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
      keepalive: true
    });
  } catch (error) {
    console.debug('Analytics submission failed:', error);
  }
};

  // Initialize analytics when DOM is loaded
  document.addEventListener('DOMContentLoaded', function () {
  // Check if we've already logged a visit in this session
  if (sessionStorage.getItem('visitLogged')) {
    console.debug('Visit already logged in this session');
    return; // Exit if we've already logged a visit in this session
  }
  
  // Mark that we're logging this visit
  sessionStorage.setItem('visitLogged', 'true');
  
  // Start the data collection process with a small delay
  setTimeout(() => {
    collectAndSendData().catch(e => console.debug('Analytics error:', e));
    }, 1000);
  });
}
