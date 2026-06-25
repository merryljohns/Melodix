/**
 * Melodix Contact Form Validation & Toast System
 * Performs client-side constraints validations on form submission
 * and displays styled toast notifications.
 */

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('melodix-contact-form');
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const phoneInput = document.getElementById('contact-phone');
    const messageInput = document.getElementById('contact-message');
    const wordCountSpan = document.getElementById('word-count');
    const toastContainer = document.getElementById('toast-box-container');

    if (!contactForm) return;

    // --- Message Word Counter ---
    messageInput.addEventListener('input', () => {
        const words = getWordCount(messageInput.value);
        wordCountSpan.textContent = words;
        
        // Visual indicator if limit is exceeded
        if (words > 200) {
            wordCountSpan.style.color = '#ff4757'; // Error Red
        } else {
            wordCountSpan.style.color = ''; // Inherited
        }
    });

    // --- Form Submit Validation ---
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Mandatory Fields Checks
        const nameVal = nameInput.value.trim();
        const emailVal = emailInput.value.trim();
        const phoneVal = phoneInput.value.trim();
        const messageVal = messageInput.value.trim();

        if (!nameVal || !emailVal || !phoneVal || !messageVal) {
            showToast('All fields are mandatory. Please fill in all details.', 'error');
            return;
        }

        // 2. Email Format Validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(emailVal)) {
            showToast('Please enter a valid email address (e.g. name@domain.com).', 'error');
            return;
        }

        // 3. Phone Number validations (only numeric values, exactly 10 digits)
        const isNumeric = /^\d+$/.test(phoneVal);
        if (!isNumeric) {
            showToast('Phone number must accept only numeric digits.', 'error');
            return;
        }

        if (phoneVal.length !== 10) {
            showToast('Phone number must be exactly 10 digits.', 'error');
            return;
        }

        // 4. Message length limit check (maximum 200 words)
        const wordsCount = getWordCount(messageVal);
        if (wordsCount > 200) {
            showToast(`Your message exceeds the 200-word limit (Currently: ${wordsCount} words).`, 'error');
            return;
        }

        // 5. Success Flow
        showToast('Your message has been sent successfully! Our team will contact you shortly.', 'success');
        
        // Log submission for testing
        console.log('Contact Form Submitted successfully:', {
            name: nameVal,
            email: emailVal,
            phone: phoneVal,
            message: messageVal,
            wordCount: wordsCount
        });

        // Reset fields
        contactForm.reset();
        wordCountSpan.textContent = '0';
    });

    // --- Helper: Count words in string ---
    function getWordCount(str) {
        const cleanedStr = str.trim().replace(/\s+/g, ' ');
        if (cleanedStr === '') return 0;
        return cleanedStr.split(' ').length;
    }

    // --- Toast Spawning Method ---
    function showToast(message, type = 'success') {
        if (!toastContainer) return;

        // Create toaster element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Set icon depending on type
        const iconSymbol = type === 'success' ? '✓' : '✗';
        
        toast.innerHTML = `
            <div class="toast-icon">${iconSymbol}</div>
            <div class="toast-message">${message}</div>
        `;

        // Append to container
        toastContainer.appendChild(toast);

        // Force layout reflow before adding class to trigger CSS transition
        toast.offsetHeight;

        // Slide in toaster
        toast.classList.add('show');

        // Automatically slide out and remove toaster after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            // Remove from DOM after transition completes
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, 4000);
    }

    // --- Listen to global player favorite toggles to show helpful toasts ---
    document.addEventListener('trackFavoriteToggled', (e) => {
        const { title, isFavorite } = e.detail;
        if (isFavorite) {
            showToast(`Added "${title}" to your Favorites.`, 'success');
        } else {
            showToast(`Removed "${title}" from your Favorites.`, 'success');
        }
    });
});
