/**
 * Beta Feedback Widget for Eco Donations Platform
 * Collects user feedback during beta testing phase
 */

import { API_CONFIG, BETA_CONFIG } from '../config/config.js';

class BetaFeedbackWidget {
    constructor() {
        this.isVisible = false;
        this.feedbackData = [];
        this.init();
    }

    init() {
        if (!BETA_CONFIG.enabled || !BETA_CONFIG.showWidget) return;

        this.createWidget();
        this.setupEventListeners();
        this.loadFeedbackData();
    }

    createWidget() {
        // Create floating feedback button
        const feedbackButton = document.createElement('div');
        feedbackButton.id = 'beta-feedback-button';
        feedbackButton.innerHTML = `
            <div class="feedback-btn">
                <span>🧪 Beta Feedback</span>
            </div>
        `;

        // Create feedback modal
        const feedbackModal = document.createElement('div');
        feedbackModal.id = 'beta-feedback-modal';
        feedbackModal.innerHTML = `
            <div class="feedback-overlay">
                <div class="feedback-content">
                    <div class="feedback-header">
                        <h3>🌱 Help Us Improve Eco Donations</h3>
                        <button class="close-btn">&times;</button>
                    </div>

                    <div class="feedback-body">
                        <p>We're in beta! Your feedback helps us build a better platform.</p>

                        <form id="feedback-form">
                            <div class="form-group">
                                <label>What are you testing?</label>
                                <select name="feature" required>
                                    <option value="">Select a feature...</option>
                                    <option value="donation-flow">Making a donation</option>
                                    <option value="auto-donation">Auto-donation setup</option>
                                    <option value="governance">Governance voting</option>
                                    <option value="wallet-connection">Wallet connection</option>
                                    <option value="mobile-experience">Mobile experience</option>
                                    <option value="ui-design">User interface</option>
                                    <option value="performance">Site performance</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>How was your experience?</label>
                                <div class="rating-buttons">
                                    <button type="button" class="rating-btn" data-rating="1">😞 Poor</button>
                                    <button type="button" class="rating-btn" data-rating="2">😐 Okay</button>
                                    <button type="button" class="rating-btn" data-rating="3">😊 Good</button>
                                    <button type="button" class="rating-btn" data-rating="4">🤩 Great</button>
                                </div>
                                <input type="hidden" name="rating" required>
                            </div>

                            <div class="form-group">
                                <label>Feedback Type</label>
                                <select name="type" required>
                                    <option value="">Select type...</option>
                                    <option value="bug">🐛 Bug Report</option>
                                    <option value="feature">💡 Feature Request</option>
                                    <option value="improvement">⚡ Improvement</option>
                                    <option value="compliment">❤️ Compliment</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Tell us more (optional)</label>
                                <textarea name="message" placeholder="What went well? What could be better? Any suggestions?"></textarea>
                            </div>

                            <div class="form-group">
                                <label>Contact (optional)</label>
                                <input type="email" name="contact" placeholder="your@email.com - for follow-up">
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="submit-btn">Send Feedback</button>
                                <button type="button" class="cancel-btn">Cancel</button>
                            </div>
                        </form>

                        <div id="feedback-success" class="success-message" style="display:none;">
                            <h4>Thank you! 🙏</h4>
                            <p>Your feedback helps us improve Eco Donations.</p>
                        </div>

                        <div id="feedback-error" class="error-message" style="display:none;">
                            <h4>Oops! Something went wrong</h4>
                            <p>Please try again or contact us directly.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add CSS styles
        const styles = document.createElement('style');
        styles.textContent = `
            #beta-feedback-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                font-family: 'Inter', sans-serif;
            }

            .feedback-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
                font-weight: 500;
            }

            .feedback-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            }

            #beta-feedback-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: none;
                font-family: 'Inter', sans-serif;
            }

            .feedback-overlay {
                background: rgba(0,0,0,0.8);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .feedback-content {
                background: white;
                border-radius: 15px;
                max-width: 500px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }

            .feedback-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 25px;
                border-bottom: 1px solid #eee;
            }

            .feedback-header h3 {
                margin: 0;
                color: #2c5aa0;
                font-weight: 600;
            }

            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .feedback-body {
                padding: 25px;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: #333;
            }

            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 12px;
                border: 2px solid #e1e5e9;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.3s ease;
            }

            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #667eea;
            }

            .form-group textarea {
                resize: vertical;
                min-height: 80px;
            }

            .rating-buttons {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                margin-bottom: 10px;
            }

            .rating-btn {
                padding: 10px;
                border: 2px solid #e1e5e9;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
            }

            .rating-btn:hover {
                border-color: #667eea;
            }

            .rating-btn.selected {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }

            .form-actions {
                display: flex;
                gap: 10px;
                margin-top: 30px;
            }

            .submit-btn {
                flex: 1;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: transform 0.3s ease;
            }

            .submit-btn:hover {
                transform: translateY(-1px);
            }

            .cancel-btn {
                background: #f8f9fa;
                color: #666;
                border: 1px solid #e1e5e9;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
            }

            .success-message,
            .error-message {
                text-align: center;
                padding: 20px;
                border-radius: 8px;
                margin-top: 20px;
            }

            .success-message {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }

            .error-message {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }

            @media (max-width: 600px) {
                .feedback-content {
                    margin: 10px;
                    max-height: 95vh;
                }

                .rating-buttons {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(styles);
        document.body.appendChild(feedbackButton);
        document.body.appendChild(feedbackModal);
    }

    setupEventListeners() {
        const button = document.getElementById('beta-feedback-button');
        const modal = document.getElementById('beta-feedback-modal');
        const closeBtn = modal.querySelector('.close-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const form = modal.querySelector('#feedback-form');
        const ratingBtns = modal.querySelectorAll('.rating-btn');

        button.addEventListener('click', () => this.showModal());
        closeBtn.addEventListener('click', () => this.hideModal());
        cancelBtn.addEventListener('click', () => this.hideModal());

        modal.addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.feedback-overlay')) {
                this.hideModal();
            }
        });

        // Rating button selection
        ratingBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                ratingBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                form.querySelector('input[name="rating"]').value = btn.dataset.rating;
            });
        });

        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    showModal() {
        document.getElementById('beta-feedback-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        document.getElementById('beta-feedback-modal').style.display = 'none';
        document.body.style.overflow = '';
        this.resetForm();
    }

    resetForm() {
        const form = document.getElementById('feedback-form');
        const successMsg = document.getElementById('feedback-success');
        const errorMsg = document.getElementById('feedback-error');

        form.reset();
        form.style.display = 'block';
        successMsg.style.display = 'none';
        errorMsg.style.display = 'none';

        // Reset rating buttons
        form.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    async handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Add metadata
        data.timestamp = new Date().toISOString();
        data.url = window.location.href;
        data.userAgent = navigator.userAgent;
        data.platform = 'web';

        try {
            // Try to submit to backend first
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // Timeout after 3 seconds

            const response = await fetch(API_CONFIG.feedback, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                this.showSuccess();
                this.logBetaAction('feedback_submitted', data);
                console.log('📝 Feedback submitted to backend successfully');
            } else {
                // Backend returned error, save locally
                this.saveFeedbackLocally(data);
                this.showSuccess();
                console.log('📝 Backend error, feedback saved locally');
            }
        } catch (error) {
            // Backend not available, save locally
            console.log('📝 Backend not available, saving feedback locally:', error.message);
            this.saveFeedbackLocally(data);
            this.showSuccess();
        }
    }

    showSuccess() {
        const form = document.getElementById('feedback-form');
        const successMsg = document.getElementById('feedback-success');

        form.style.display = 'none';
        successMsg.style.display = 'block';

        setTimeout(() => {
            this.hideModal();
        }, 3000);
    }

    showError() {
        const form = document.getElementById('feedback-form');
        const errorMsg = document.getElementById('feedback-error');

        form.style.display = 'none';
        errorMsg.style.display = 'block';
    }

    async loadFeedbackData() {
        try {
            // Check if we're in development mode and if a backend is expected
            const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

            if (!isDevelopment) {
                // In production, we might not have a backend yet
                console.log('📝 Beta feedback: Production mode, skipping backend connection');
                return;
            }

            // Try to connect to backend, but don't fail if it's not available
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // Timeout after 2 seconds

            const response = await fetch(API_CONFIG.feedback, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                this.feedbackData = await response.json();
                console.log('📝 Beta feedback data loaded successfully');
            } else {
                console.log('📝 Beta feedback: Backend returned non-OK status, using local storage fallback');
                this.loadLocalFeedbackData();
            }
        } catch (error) {
            // Backend not available, use local storage instead
            console.log('📝 Beta feedback: Backend not available, using local storage fallback');
            this.loadLocalFeedbackData();
        }
    }

    loadLocalFeedbackData() {
        try {
            const localData = localStorage.getItem('beta-feedback-data');
            if (localData) {
                this.feedbackData = JSON.parse(localData);
                console.log('📝 Loaded feedback data from local storage');
            } else {
                this.feedbackData = [];
                console.log('📝 No local feedback data found, starting fresh');
            }
        } catch (error) {
            console.error('📝 Error loading local feedback data:', error);
            this.feedbackData = [];
        }
    }

    saveFeedbackLocally(feedbackData) {
        try {
            // Add to our feedback array
            this.feedbackData.push(feedbackData);

            // Save to localStorage
            localStorage.setItem('beta-feedback-data', JSON.stringify(this.feedbackData));

            // Also save individual feedback with timestamp for easy retrieval
            const feedbackKey = `beta-feedback-${Date.now()}`;
            localStorage.setItem(feedbackKey, JSON.stringify(feedbackData));

            this.logBetaAction('feedback_saved_locally', feedbackData);
            console.log('📝 Feedback saved to local storage successfully');
        } catch (error) {
            console.error('📝 Error saving feedback locally:', error);
        }
    }

    logBetaAction(action, data = {}) {
        if (BETA_CONFIG.userTracking) {
            console.log('[BETA]', action, data);
        }
    }
}

// Initialize feedback widget when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.betaFeedbackWidget = new BetaFeedbackWidget();
    });
} else {
    window.betaFeedbackWidget = new BetaFeedbackWidget();
}

export default BetaFeedbackWidget;
