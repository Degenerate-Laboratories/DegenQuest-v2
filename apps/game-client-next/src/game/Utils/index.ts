// Utility functions for the game client

/**
 * Checks if running in local development environment
 */
export const isLocal = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }
  return process.env.NODE_ENV === 'development';
};

/**
 * Gets WebSocket URL for game server
 */
export const wsUrl = (port = 3000): string => {
  // If NEXT_PUBLIC_SOCKET_URL is set, use that
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }

  // Local development defaults
  if (isLocal()) {
    return `ws://localhost:${port}`;
  }

  // Production defaults to secure websocket
  return 'wss://game.degen-quest.com';
};

/**
 * Gets HTTP API URL for game server
 */
export const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

/**
 * Gets the server URL based on environment
 */
export const getServerUrl = (): string => {
  if (isLocal()) {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
  }
  return 'https://game.degen-quest.com';
};

/**
 * Creates a debounced function
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced;
};

/**
 * Formats a number to K/M/B format (1000 -> 1K)
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

/**
 * Formats a display name with proper capitalization
 */
export const formatDisplayName = (name: string): string => {
  if (!name) return '';
  
  // Replace underscores with spaces and capitalize each word
  return name
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Creates a delay using a Promise
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generates a random integer between min and max (inclusive)
 */
export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Truncates a string to a specified length and adds ellipsis
 */
export function truncateString(str: string, num: number): string {
    if (str.length <= num) {
        return str;
    }
    return str.slice(0, num) + '...';
}

/**
 * Throttles a function to limit how often it can be called
 */
export function throttle(func: Function, limit: number): (...args: any[]) => void {
    let inThrottle: boolean = false;
    
    return function executedFunction(...args: any[]) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * Checks if a value is null or undefined
 */
export function isNullOrUndefined(value: any): boolean {
    return value === null || value === undefined;
}

/**
 * Safely parses JSON with error handling
 */
export function safeJsonParse(json: string, fallback: any = null): any {
    try {
        return JSON.parse(json);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return fallback;
    }
}
