// Utility functions for the game

/**
 * Generates a random ID string
 */
export function generateRandomId(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Returns a random number between min and max (inclusive)
 */
export function randomNumberInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Formats a number with commas for thousands
 */
export function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
 * Debounces a function to prevent multiple rapid calls
 */
export function debounce(func: Function, wait: number): (...args: any[]) => void {
    let timeout: NodeJS.Timeout | null = null;
    
    return function executedFunction(...args: any[]) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        
        if (timeout) {
            clearTimeout(timeout);
        }
        
        timeout = setTimeout(later, wait);
    };
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