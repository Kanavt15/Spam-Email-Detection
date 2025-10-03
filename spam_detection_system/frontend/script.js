// Configuration
const API_BASE_URL = 'http://localhost:5000';

// DOM Elements
const elements = {
    messageInput: document.getElementById('messageInput'),
    charCount: document.getElementById('charCount'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    clearBtn: document.getElementById('clearBtn'),
    trainBtn: document.getElementById('trainBtn'),
    resultSection: document.getElementById('resultSection'),
    predictionBadge: document.getElementById('predictionBadge'),
    predictionIcon: document.getElementById('predictionIcon'),
    predictionText: document.getElementById('predictionText'),
    spamProgress: document.getElementById('spamProgress'),
    hamProgress: document.getElementById('hamProgress'),
    spamPercentage: document.getElementById('spamPercentage'),
    hamPercentage: document.getElementById('hamPercentage'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingText: document.getElementById('loadingText'),
    toastContainer: document.getElementById('toastContainer'),
    apiStatus: document.getElementById('apiStatus'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    hamSamples: document.getElementById('hamSamples'),
    spamSamples: document.getElementById('spamSamples')
};

// State
let isAnalyzing = false;
let isTraining = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkApiStatus();
    loadInitialData();
    initScrollAnimations();
});

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Add staggered animation for process steps
                if (entry.target.classList.contains('process-step')) {
                    const steps = document.querySelectorAll('.process-step');
                    steps.forEach((step, index) => {
                        setTimeout(() => {
                            step.style.animationDelay = `${index * 0.1}s`;
                            step.classList.add('animate-step');
                        }, index * 100);
                    });
                }

                // Add circular motion for cards
                if (entry.target.classList.contains('info-card')) {
                    setTimeout(() => {
                        entry.target.style.transform = 'perspective(1000px) rotateY(0deg)';
                        entry.target.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    }, 200);
                }

                // Animate network nodes with circular motion
                if (entry.target.querySelector('.bayesian-network')) {
                    const nodes = entry.target.querySelectorAll('.network-node');
                    nodes.forEach((node, index) => {
                        setTimeout(() => {
                            node.style.animation = `circularBounce 0.8s ease-out ${index * 0.1}s forwards`;
                        }, 300);
                    });
                }
            }
        });
    }, observerOptions);

    // Observe all info cards
    document.querySelectorAll('.info-card').forEach(card => {
        observer.observe(card);
    });

    // Observe process steps
    document.querySelectorAll('.process-step').forEach(step => {
        observer.observe(step);
    });

    // Add smooth scroll behavior for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add parallax effect for cards
    window.addEventListener('scroll', () => {
        const cards = document.querySelectorAll('.info-card');
        const scrollY = window.pageYOffset;
        
        cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const speed = 0.02 * (index + 1);
            const yPos = -(scrollY * speed);
            const rotateY = Math.sin(scrollY * 0.001 + index) * 2;
            
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                card.style.transform = `translateY(${yPos}px) rotateY(${rotateY}deg)`;
            }
        });
    });
}

// Event Listeners
function setupEventListeners() {
    // Message input character counter
    elements.messageInput.addEventListener('input', updateCharacterCount);
    
    // Analyze button
    elements.analyzeBtn.addEventListener('click', analyzeMessage);
    
    // Clear button
    elements.clearBtn.addEventListener('click', clearMessage);
    
    // Train button
    elements.trainBtn.addEventListener('click', trainModel);
    
    // Enter key to analyze
    elements.messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            analyzeMessage();
        }
    });
    
    // Sample message click to analyze
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('sample-item')) {
            const message = e.target.textContent.trim();
            elements.messageInput.value = message;
            updateCharacterCount();
            elements.messageInput.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Character counter
function updateCharacterCount() {
    const count = elements.messageInput.value.length;
    elements.charCount.textContent = count;
    
    // Update analyze button state
    elements.analyzeBtn.disabled = count === 0 || isAnalyzing;
}

// Clear message
function clearMessage() {
    elements.messageInput.value = '';
    elements.resultSection.classList.add('hidden');
    updateCharacterCount();
    elements.messageInput.focus();
}

// Show loading overlay
function showLoading(text = 'Processing...') {
    elements.loadingText.textContent = text;
    elements.loadingOverlay.classList.remove('hidden');
}

// Hide loading overlay
function hideLoading() {
    elements.loadingOverlay.classList.add('hidden');
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    elements.toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
    
    // Click to dismiss
    toast.addEventListener('click', () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
}

// API request helper
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Check API status
async function checkApiStatus() {
    try {
        const response = await apiRequest('/status');
        updateApiStatus(true);
        updateModelStatus(response);
    } catch (error) {
        updateApiStatus(false);
        showToast('Cannot connect to API server. Please make sure the backend is running.', 'error');
    }
}

// Update API status indicator
function updateApiStatus(isOnline) {
    if (isOnline) {
        elements.statusDot.className = 'status-dot online';
        elements.statusText.textContent = 'Connected';
    } else {
        elements.statusDot.className = 'status-dot offline';
        elements.statusText.textContent = 'Disconnected';
    }
}

// Update model status (simplified - no DOM updates needed)
function updateModelStatus(status) {
    elements.analyzeBtn.disabled = !status.model_trained || elements.messageInput.value.trim() === '';
    elements.trainBtn.disabled = isTraining;
}

// Analyze message
async function analyzeMessage() {
    const message = elements.messageInput.value.trim();
    
    if (!message) {
        showToast('Please enter a message to analyze', 'warning');
        return;
    }
    
    if (isAnalyzing) return;
    
    isAnalyzing = true;
    elements.analyzeBtn.disabled = true;
    elements.analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    
    try {
        const result = await apiRequest('/predict', {
            method: 'POST',
            body: JSON.stringify({ message })
        });
        
        displayResultEnhanced(result);
        showToast('Analysis completed successfully!', 'success');
        
    } catch (error) {
        showToast(`Analysis failed: ${error.message}`, 'error');
        elements.resultSection.classList.add('hidden');
    } finally {
        isAnalyzing = false;
        elements.analyzeBtn.disabled = false;
        elements.analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Message';
        updateCharacterCount();
    }
}

// Display analysis result
function displayResult(result) {
    const { prediction, confidence, is_spam } = result;
    
    // Update prediction badge
    elements.predictionBadge.className = `prediction-badge ${prediction}`;
    elements.predictionIcon.className = is_spam ? 'fas fa-exclamation-triangle' : 'fas fa-shield-alt';
    elements.predictionText.textContent = is_spam ? 'SPAM DETECTED' : 'LEGITIMATE MESSAGE';
    
    // Update confidence meters
    const spamPercentage = Math.round(confidence.spam * 100);
    const hamPercentage = Math.round(confidence.ham * 100);
    
    elements.spamProgress.style.width = `${spamPercentage}%`;
    elements.hamProgress.style.width = `${hamPercentage}%`;
    elements.spamPercentage.textContent = `${spamPercentage}%`;
    elements.hamPercentage.textContent = `${hamPercentage}%`;
    
    // Show result section
    elements.resultSection.classList.remove('hidden');
    elements.resultSection.scrollIntoView({ behavior: 'smooth' });
}

// Train model
async function trainModel() {
    if (isTraining) return;
    
    if (!confirm('Training the model will take some time. Do you want to continue?')) {
        return;
    }
    
    isTraining = true;
    elements.trainBtn.disabled = true;
    elements.trainBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Training...';
    showLoading('Training model... This may take a few minutes.');
    
    try {
        const result = await apiRequest('/train', {
            method: 'POST'
        });
        
        showToast(`Model trained successfully! Accuracy: ${(result.accuracy * 100).toFixed(2)}%`, 'success');
        checkApiStatus(); // Refresh status
        
    } catch (error) {
        showToast(`Training failed: ${error.message}`, 'error');
    } finally {
        isTraining = false;
        elements.trainBtn.disabled = false;
        elements.trainBtn.innerHTML = '<i class="fas fa-play"></i> Train Model';
        hideLoading();
    }
}

// Load dataset statistics
async function loadBayesianInfo() {
    try {
        const result = await apiRequest('/bayesian-info');
        console.log('Bayesian Network Info:', result.bayesian_info);
        // Add interactive animations to the Bayesian network visualization
        animateBayesianNetwork();
    } catch (error) {
        console.log('Could not load Bayesian info, using static display');
        // Still show the animation even if API call fails
        animateBayesianNetwork();
    }
}

// Animate the Bayesian network visualization
function animateBayesianNetwork() {
    const nodes = document.querySelectorAll('.network-node');
    const arrows = document.querySelectorAll('.arrow');
    const stats = document.querySelectorAll('.stat-item');
    
    // Add staggered animation to nodes
    nodes.forEach((node, index) => {
        setTimeout(() => {
            node.style.animation = 'nodeAppear 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards';
            
            // Add click interaction
            node.addEventListener('click', function() {
                this.style.animation = 'nodeClick 0.6s ease';
                setTimeout(() => {
                    this.style.animation = '';
                }, 600);
            });
        }, index * 300);
    });
    
    // Animate arrows after nodes
    setTimeout(() => {
        arrows.forEach((arrow, index) => {
            setTimeout(() => {
                arrow.style.animation = 'arrowFlow 2s ease infinite';
                arrow.style.opacity = '1';
            }, index * 150);
        });
    }, nodes.length * 300);
    
    // Animate statistics
    setTimeout(() => {
        stats.forEach((stat, index) => {
            setTimeout(() => {
                stat.style.animation = 'slideUp 0.6s ease forwards';
            }, index * 100);
        });
    }, (nodes.length * 300) + 500);
    
    // Add interactive hover effects to process steps
    addProcessStepInteractions();
}

// Add interactive effects to process steps
function addProcessStepInteractions() {
    const processSteps = document.querySelectorAll('.process-step');
    
    processSteps.forEach((step, index) => {
        step.addEventListener('mouseenter', function() {
            // Highlight the step number
            const stepNumber = this.querySelector('.step-number');
            stepNumber.style.animation = 'numberPulse 0.6s ease';
            
            // Animate the visual elements
            const visual = this.querySelector('.step-visual');
            if (visual) {
                visual.style.transform = 'scale(1.02)';
            }
        });
        
        step.addEventListener('mouseleave', function() {
            const stepNumber = this.querySelector('.step-number');
            stepNumber.style.animation = '';
            
            const visual = this.querySelector('.step-visual');
            if (visual) {
                visual.style.transform = 'scale(1)';
            }
        });
    });
}

// Enhanced display result with animations
function displayResultEnhanced(result) {
    const { prediction, confidence, is_spam } = result;
    
    // Update prediction badge with enhanced animation
    elements.predictionBadge.className = `prediction-badge ${prediction}`;
    elements.predictionIcon.className = is_spam ? 'fas fa-exclamation-triangle' : 'fas fa-shield-alt';
    elements.predictionText.textContent = is_spam ? 'SPAM DETECTED' : 'LEGITIMATE MESSAGE';
    
    // Animate the badge appearance
    elements.predictionBadge.style.animation = 'badgeAppear 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Update confidence meters with staggered animation
    const spamPercentage = Math.round(confidence.spam * 100);
    const hamPercentage = Math.round(confidence.ham * 100);
    
    // Reset bars
    elements.spamProgress.style.width = '0%';
    elements.hamProgress.style.width = '0%';
    
    // Animate bars with delay
    setTimeout(() => {
        elements.spamProgress.style.width = `${spamPercentage}%`;
        elements.spamPercentage.textContent = `${spamPercentage}%`;
    }, 300);
    
    setTimeout(() => {
        elements.hamProgress.style.width = `${hamPercentage}%`;
        elements.hamPercentage.textContent = `${hamPercentage}%`;
    }, 600);
    
    // Show result section with animation
    elements.resultSection.classList.remove('hidden');
    elements.resultSection.style.animation = 'slideDown 0.6s ease';
    elements.resultSection.scrollIntoView({ behavior: 'smooth' });
    
    // Add particle effect for dramatic results
    if (spamPercentage > 80 || hamPercentage > 80) {
        createParticleEffect(elements.predictionBadge);
    }
}

// Create particle effect for high confidence results
function createParticleEffect(element) {
    const rect = element.getBoundingClientRect();
    const particles = [];
    
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: linear-gradient(45deg, #667eea, #f093fb);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
        `;
        
        document.body.appendChild(particle);
        particles.push(particle);
        
        // Animate particle
        const angle = (i / 12) * 2 * Math.PI;
        const velocity = 100 + Math.random() * 50;
        const duration = 1000 + Math.random() * 500;
        
        particle.animate([
            { 
                transform: 'translate(0, 0) scale(1)', 
                opacity: 1 
            },
            { 
                transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`, 
                opacity: 0 
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }).addEventListener('finish', () => {
            particle.remove();
        });
    }
}

// Display statistics
function displayBayesianConcepts() {
    // This function can be used to show dynamic Bayesian network information
    // For now, the static HTML provides the educational content
    console.log('Bayesian network concepts displayed');
}

// Load sample messages
async function loadSamples() {
    try {
        const result = await apiRequest('/samples?count=8');
        displaySamples(result.samples);
    } catch (error) {
        elements.hamSamples.innerHTML = '<div class="loading">Failed to load samples</div>';
        elements.spamSamples.innerHTML = '<div class="loading">Failed to load samples</div>';
    }
}

// Display sample messages
function displaySamples(samples) {
    // Ham samples
    const hamHTML = samples.ham_samples.map(message => 
        `<div class="sample-item ham" title="Click to analyze this message">${escapeHtml(message)}</div>`
    ).join('');
    
    // Spam samples
    const spamHTML = samples.spam_samples.map(message => 
        `<div class="sample-item spam" title="Click to analyze this message">${escapeHtml(message)}</div>`
    ).join('');
    
    elements.hamSamples.innerHTML = hamHTML;
    elements.spamSamples.innerHTML = spamHTML;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load initial data
async function loadInitialData() {
    loadBayesianInfo();
    loadSamples();
}

// Periodic status check
setInterval(checkApiStatus, 30000); // Check every 30 seconds

// Add some example messages for quick testing
const exampleMessages = [
    "Hey, are we still meeting for lunch tomorrow?",
    "CONGRATULATIONS! You've won a $1000 gift card! Click here to claim: suspicious-link.com",
    "Thanks for the great presentation today. Let's discuss the details next week.",
    "URGENT! Your account will be suspended unless you verify your password immediately!",
    "Can you pick up some milk on your way home?",
    "Free iPhone 13! Text WIN to 12345 now! Limited time offer!"
];

// Add quick test button functionality
function addQuickTestButtons() {
    const quickTestSection = document.createElement('div');
    quickTestSection.className = 'quick-test-section';
    quickTestSection.innerHTML = `
        <h3><i class="fas fa-lightning-bolt"></i> Quick Test Examples</h3>
        <div class="quick-test-buttons">
            ${exampleMessages.map((msg, index) => 
                `<button class="btn btn-secondary quick-test-btn" data-message="${escapeHtml(msg)}">
                    Example ${index + 1}
                </button>`
            ).join('')}
        </div>
    `;
    
    // Add event listeners for quick test buttons
    quickTestSection.addEventListener('click', function(e) {
        if (e.target.classList.contains('quick-test-btn')) {
            const message = e.target.getAttribute('data-message');
            elements.messageInput.value = message;
            updateCharacterCount();
            elements.messageInput.scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    // Insert after the input section
    const inputSection = document.querySelector('.input-section');
    inputSection.parentNode.insertBefore(quickTestSection, inputSection.nextSibling);
}

// Add CSS for quick test section
const quickTestCSS = `
    .quick-test-section {
        margin: 20px 0;
        padding: 20px;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .quick-test-section h3 {
        margin-bottom: 15px;
        color: #333;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .quick-test-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .quick-test-btn {
        font-size: 0.85rem;
        padding: 8px 16px;
    }
    
    @media (max-width: 768px) {
        .quick-test-buttons {
            flex-direction: column;
        }
    }
`;

// Add the CSS to the document
const style = document.createElement('style');
style.textContent = quickTestCSS;
document.head.appendChild(style);

// Initialize quick test buttons when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    addQuickTestButtons();
});
