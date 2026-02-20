// 모바일 디바이스 감지 유틸리티
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor;
  
  // 모바일 디바이스 패턴 확인
  const mobilePatterns = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /Mobile/i,
    /Tablet/i,
  ];
  
  return mobilePatterns.some(pattern => pattern.test(userAgent));
};

// 터치 지원 여부 확인
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window ||
         navigator.maxTouchPoints > 0 ||
         (navigator as Navigator & { msMaxTouchPoints?: number }).msMaxTouchPoints > 0;
};

// iOS 디바이스 감지
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Android 디바이스 감지  
export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android/.test(navigator.userAgent);
};

// 모바일 브라우저별 감지
export const getMobileBrowser = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
    return 'chrome';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'safari';
  } else if (userAgent.includes('Firefox')) {
    return 'firefox';
  } else if (userAgent.includes('Edge')) {
    return 'edge';
  } else if (userAgent.includes('Samsung')) {
    return 'samsung';
  }
  
  return 'unknown';
};

// 뷰포트 크기 확인
export const getViewportSize = () => {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

// 모바일 디버깅 정보 출력
export const logMobileInfo = () => {
  if (typeof window === 'undefined') return;

  const navConnection = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number } }).connection;
  console.log('📱 모바일 디바이스 정보:', {
    isMobile: isMobile(),
    isTouchDevice: isTouchDevice(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    browser: getMobileBrowser(),
    viewport: getViewportSize(),
    userAgent: navigator.userAgent,
    screen: {
      width: screen.width,
      height: screen.height,
      pixelRatio: window.devicePixelRatio,
    },
    connection: navConnection
      ? { effectiveType: navConnection.effectiveType, downlink: navConnection.downlink }
      : 'unknown',
  });
};
