/**
 * Wardrobe Showcase - Interactive Functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Copy-to-clipboard functionality for theme install commands
    const copyButtons = document.querySelectorAll('.copy-btn');

    copyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            // Get the install command from the sibling element
            const installCommand = this.previousElementSibling.textContent.trim();

            // Use modern Clipboard API if available
            if (navigator.clipboard) {
                navigator.clipboard.writeText(installCommand).then(() => {
                    // Provide visual feedback
                    showCopyFeedback(this);
                }).catch(() => {
                    // Fallback if clipboard API fails
                    fallbackCopy(installCommand, this);
                });
            } else {
                // Fallback for older browsers
                fallbackCopy(installCommand, this);
            }
        });
    });

    /**
     * Show visual feedback when copy succeeds
     */
    function showCopyFeedback(button) {
        const originalText = button.textContent;
        const originalClass = button.className;

        // Change button appearance
        button.textContent = 'Copied!';
        button.classList.add('copied');

        // Reset after 2 seconds
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }

    /**
     * Fallback copy method for older browsers
     */
    function fallbackCopy(text, button) {
        try {
            // Create a temporary textarea
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);

            // Select and copy
            textarea.select();
            const successful = document.execCommand('copy');

            if (successful) {
                showCopyFeedback(button);
            }

            // Remove the temporary element
            document.body.removeChild(textarea);
        } catch (err) {
            console.error('Copy failed:', err);
            alert('Copy failed. Please copy manually: ' + text);
        }
    }

    /**
     * Smooth scroll behavior for navigation links
     */
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    /**
     * Track which theme cards are viewed (for analytics later)
     */
    const themeCards = document.querySelectorAll('.theme-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const theme = entry.target.getAttribute('data-theme');
                // Could send analytics here
                console.log('Viewed theme:', theme);
            }
        });
    }, {
        threshold: 0.5
    });

    themeCards.forEach(card => {
        observer.observe(card);
    });

    /**
     * Email capture form handling
     */
    const emailForm = document.getElementById('email-form');
    const emailInput = document.getElementById('email-input');
    const formMessage = document.getElementById('form-message');
    const notifyBtn = document.querySelector('.notify-btn');

    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = emailInput.value.trim();

            // Validate email format
            if (!validateEmail(email)) {
                showFormError('Please enter a valid email address');
                emailInput.classList.add('error');
                return;
            }

            // Clear any previous error states
            emailInput.classList.remove('error');
            formMessage.className = 'form-message';

            // Send to API endpoint
            submitEmail(email);
        });

        // Clear error state on input focus
        emailInput.addEventListener('focus', function() {
            emailInput.classList.remove('error');
            if (formMessage.classList.contains('error')) {
                formMessage.textContent = '';
            }
        });
    }

    /**
     * Validate email format
     */
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Submit email to API endpoint
     */
    function submitEmail(email) {
        // Configurable API endpoint - replace with your actual endpoint
        const apiEndpoint = 'https://api.example.com/notifications/subscribe';

        // Disable button and show loading state
        notifyBtn.disabled = true;
        const originalText = notifyBtn.textContent;
        notifyBtn.textContent = 'Subscribing...';

        // Create request payload
        const payload = {
            email: email,
            source: 'wardrobe-showcase',
            timestamp: new Date().toISOString()
        };

        // Send POST request
        fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Success
            showFormSuccess('Thanks! Check your email for confirmation.');
            emailInput.value = '';
            notifyBtn.classList.add('success');
            setTimeout(() => {
                notifyBtn.classList.remove('success');
                notifyBtn.textContent = originalText;
                notifyBtn.disabled = false;
            }, 3000);
        })
        .catch(error => {
            console.error('Email submission error:', error);
            // Show user-friendly error message
            showFormError('Something went wrong. Please try again.');
            notifyBtn.textContent = originalText;
            notifyBtn.disabled = false;
        });
    }

    /**
     * Show form success message
     */
    function showFormSuccess(message) {
        formMessage.textContent = message;
        formMessage.classList.add('success');
    }

    /**
     * Show form error message
     */
    function showFormError(message) {
        formMessage.textContent = message;
        formMessage.classList.add('error');
    }
});

/**
 * Keyboard navigation support
 */
document.addEventListener('keydown', function(e) {
    // Focus navigation with Tab key (built-in)
    // Copy command with Enter when button is focused
    if (e.key === 'Enter') {
        const target = document.activeElement;
        if (target && target.classList.contains('copy-btn')) {
            target.click();
        }
    }
});
