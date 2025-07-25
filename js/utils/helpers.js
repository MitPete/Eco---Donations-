/**
 * Utility functions for Eco Donations DApp
 * @author Eco Donations Team
 * @version 1.0.0
 */

import { ethers } from 'ethers';
import { ERROR_MESSAGES } from '../config.js';

/**
 * Clips an address to show first 6 and last 4 characters
 * @param {string} address - The address to clip
 * @returns {string} Clipped address
 */
export const clipAddress = (address) => {
  if (!address) return '';
  return address.slice(0, 6) + '...' + address.slice(-4);
};

/**
 * Formats a number with commas and specified decimal places
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number
 */
export const formatNumber = (num, decimals = 2) => {
  if (isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Animates a value from start to end over specified duration
 * @param {HTMLElement} element - The element to animate
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} duration - Animation duration in ms
 * @param {string} suffix - Optional suffix to append
 */
export const animateValue = (element, start, end, duration, suffix = '') => {
  if (!element) return;

  const startTimestamp = performance.now();
  const step = (timestamp) => {
    const elapsed = timestamp - startTimestamp;
    const progress = Math.min(elapsed / duration, 1);

    // Use easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = start + (end - start) * easeOutQuart;

    element.textContent = formatNumber(current, 0) + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

/**
 * Checks if a contract exists at the given address
 * @param {string} address - Contract address
 * @param {ethers.Provider} provider - Ethereum provider
 * @throws {Error} If contract doesn't exist
 */
export const ensureContract = async (address, provider) => {
  const code = await provider.getCode(address);
  if (code === '0x') {
    throw new Error(ERROR_MESSAGES.CONTRACT_NOT_FOUND);
  }
};

/**
 * Safely gets an element by ID with error handling
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} The element or null if not found
 */
export const getElementById = (id) => {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with ID '${id}' not found`);
  }
  return element;
};

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Validates Ethereum address format
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid address
 */
export const isValidAddress = (address) => {
  return ethers.isAddress(address);
};

/**
 * Formats Wei to Ether with specified decimal places
 * @param {string|BigNumber} wei - Wei amount
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted Ether amount
 */
export const formatEther = (wei, decimals = 4) => {
  if (!wei) return '0';
  const ether = ethers.formatEther(wei);
  return parseFloat(ether).toFixed(decimals);
};

/**
 * Creates a loading state for buttons
 * @param {HTMLElement} button - Button element
 * @param {boolean} isLoading - Loading state
 * @param {string} loadingText - Text to show during loading
 */
export const setButtonLoading = (button, isLoading, loadingText = 'Loading...') => {
  if (!button) return;

  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.classList.add('loading');
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
    button.classList.remove('loading');
  }
};

/**
 * Shows a toast notification
 * @param {string} message - Message to show
 * @param {string} type - Type of toast ('success', 'error', 'warning', 'info')
 * @param {number} duration - Duration in milliseconds
 */
export const showToast = (message, type = 'info', duration = 3000) => {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  // Add to document
  document.body.appendChild(toast);

  // Remove after duration
  setTimeout(() => {
    toast.remove();
  }, duration);
};

/**
 * Handles async function errors with user-friendly messages
 * @param {Function} asyncFn - Async function to wrap
 * @param {string} errorMessage - Custom error message
 * @returns {Function} Wrapped function
 */
export const handleAsync = (asyncFn, errorMessage = 'An error occurred') => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      console.error('Error:', error);
      showToast(errorMessage, 'error');
      throw error;
    }
  };
};
