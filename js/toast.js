/**
 * Toast Notification System
 * Provides user feedback for various app states and actions
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.init();
  }

  init() {
    // Create toast container if it doesn't exist
    this.container = document.querySelector('.toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', options = {}) {
    const {
      title = this.getDefaultTitle(type),
      duration = 5000,
      persistent = false,
      id = null
    } = options;

    const toastId = id || `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Remove existing toast with same ID if present
    if (this.toasts.has(toastId)) {
      this.hide(toastId);
    }

    const toast = this.createToast(toastId, type, title, message);
    this.container.appendChild(toast);
    this.toasts.set(toastId, toast);

    // Auto-hide unless persistent
    if (!persistent && duration > 0) {
      setTimeout(() => this.hide(toastId), duration);
    }

    return toastId;
  }

  createToast(id, type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.dataset.id = id;

    const icon = this.getIcon(type);

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    // Add close button event
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.hide(id));

    return toast;
  }

  hide(id) {
    const toast = this.toasts.get(id);
    if (toast) {
      toast.classList.add('toast-exit');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        this.toasts.delete(id);
      }, 300);
    }
  }

  hideAll() {
    this.toasts.forEach((toast, id) => this.hide(id));
  }

  getDefaultTitle(type) {
    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info'
    };
    return titles[type] || 'Notification';
  }

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '!',
      info: 'i'
    };
    return icons[type] || 'i';
  }

  // Convenience methods
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  error(message, options = {}) {
    return this.show(message, 'error', options);
  }

  warning(message, options = {}) {
    return this.show(message, 'warning', options);
  }

  info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  // Transaction-specific methods
  transactionPending(txHash, message = 'Transaction pending...') {
    const shortHash = txHash ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}` : '';
    return this.info(
      `${message} ${shortHash}`,
      {
        title: 'Transaction Submitted',
        persistent: true,
        id: `tx_${txHash}`
      }
    );
  }

  transactionSuccess(txHash, message = 'Transaction confirmed!') {
    const shortHash = txHash ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}` : '';
    // Hide pending toast
    if (txHash) {
      this.hide(`tx_${txHash}`);
    }
    return this.success(
      `${message} ${shortHash}`,
      {
        title: 'Transaction Confirmed',
        duration: 8000
      }
    );
  }

  transactionError(txHash, message = 'Transaction failed') {
    // Hide pending toast
    if (txHash) {
      this.hide(`tx_${txHash}`);
    }
    return this.error(message, {
      title: 'Transaction Failed',
      duration: 10000
    });
  }
}

/**
 * Loading Overlay Manager
 */
class LoadingManager {
  constructor() {
    this.overlay = null;
    this.isVisible = false;
  }

  show(message = 'Loading...') {
    if (this.isVisible) return;

    this.overlay = document.createElement('div');
    this.overlay.className = 'loading-overlay';
    this.overlay.innerHTML = `
      <div class="loading-modal">
        <div class="loading-spinner-large"></div>
        <p class="loading-text">${message}</p>
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.isVisible = true;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  hide() {
    if (this.overlay && this.isVisible) {
      document.body.removeChild(this.overlay);
      this.overlay = null;
      this.isVisible = false;

      // Restore body scroll
      document.body.style.overflow = '';
    }
  }

  update(message) {
    if (this.overlay) {
      const textEl = this.overlay.querySelector('.loading-text');
      if (textEl) {
        textEl.textContent = message;
      }
    }
  }
}

/**
 * Button Loading State Manager
 */
class ButtonLoadingManager {
  constructor() {
    this.loadingButtons = new Set();
  }

  start(button, text = null) {
    if (!button || button.disabled) return;

    // Store original state
    button._originalText = button.textContent;
    button._originalDisabled = button.disabled;

    // Apply loading state
    button.classList.add('btn-loading');
    button.disabled = true;

    if (text) {
      button.textContent = text;
    }

    this.loadingButtons.add(button);
  }

  stop(button) {
    if (!button || !this.loadingButtons.has(button)) return;

    // Restore original state
    button.classList.remove('btn-loading');
    button.disabled = button._originalDisabled || false;

    if (button._originalText) {
      button.textContent = button._originalText;
    }

    // Clean up
    delete button._originalText;
    delete button._originalDisabled;
    this.loadingButtons.delete(button);
  }

  stopAll() {
    this.loadingButtons.forEach(button => this.stop(button));
  }
}

// Global instances
window.toast = new ToastManager();
window.loading = new LoadingManager();
window.buttonLoading = new ButtonLoadingManager();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  window.loading.hide();
  window.buttonLoading.stopAll();
});

console.log('✅ Toast and Loading systems initialized');
