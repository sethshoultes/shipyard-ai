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
