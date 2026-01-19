/**
 * Alchemy of Things
 * Main JavaScript - handles work loading and display
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        worksPath: '/data/works.json',
        photographyPath: '/data/photography.json'
    };

    /**
     * Fetch works data from JSON
     */
    async function fetchWorks(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching works:', error);
            return [];
        }
    }

    /**
     * Create a work item element
     */
    function createWorkItem(work, type = 'painting') {
        const item = document.createElement('article');
        item.className = 'work-item';
        
        const availabilityClass = work.available ? 'available' : 'sold';
        const availabilityText = work.available ? 'Available' : 'Sold';
        
        item.innerHTML = `
            <a href="/work.html?id=${work.id}" class="work-link">
                <div class="work-image-container">
                    <img 
                        src="${work.image}" 
                        alt="${work.title}" 
                        class="work-image"
                        loading="lazy"
                    >
                </div>
                <div class="work-meta">
                    <span class="work-title">${work.title}</span>
                    <span class="work-year">${work.year}</span>
                    <span class="work-medium">${work.medium}</span>
                    <span class="work-dimensions">${work.dimensions}</span>
                    <span class="work-availability ${availabilityClass}">${availabilityText}</span>
                </div>
            </a>
        `;
        
        return item;
    }

    /**
     * Render works to container
     */
    function renderWorks(works, container, type = 'painting') {
        container.innerHTML = '';
        
        if (works.length === 0) {
            container.innerHTML = '<p class="empty-state">No works to display at this time.</p>';
            return;
        }

        // Sort by year descending (newest first)
        const sorted = [...works].sort((a, b) => b.year - a.year);
        
        sorted.forEach(work => {
            const item = createWorkItem(work, type);
            container.appendChild(item);
        });
    }

    /**
     * Initialize paintings page
     */
    async function initPaintings() {
        const container = document.getElementById('paintings');
        if (!container) return;

        container.innerHTML = '<div class="loading"></div>';
        
        const works = await fetchWorks(CONFIG.worksPath);
        renderWorks(works, container, 'painting');
    }

    /**
     * Initialize photography page
     */
    async function initPhotography() {
        const container = document.getElementById('photography');
        if (!container) return;

        container.innerHTML = '<div class="loading"></div>';
        
        const works = await fetchWorks(CONFIG.photographyPath);
        renderWorks(works, container, 'photography');
    }

    /**
     * Initialize single work page
     */
    async function initSingleWork() {
        const container = document.getElementById('single-work');
        if (!container) return;

        // Get work ID from URL
        const params = new URLSearchParams(window.location.search);
        const workId = params.get('id');
        
        if (!workId) {
            container.innerHTML = '<p class="empty-state">Work not found.</p>';
            return;
        }

        container.innerHTML = '<div class="loading"></div>';

        // Try paintings first, then photography
        let works = await fetchWorks(CONFIG.worksPath);
        let work = works.find(w => w.id === workId);
        let type = 'painting';
        
        if (!work) {
            works = await fetchWorks(CONFIG.photographyPath);
            work = works.find(w => w.id === workId);
            type = 'photography';
        }

        if (!work) {
            container.innerHTML = '<p class="empty-state">Work not found.</p>';
            return;
        }

        const backLink = type === 'photography' ? '/photography.html' : '/';
        const backText = type === 'photography' ? 'Photography' : 'Paintings';
        const availabilityText = work.available ? 'Available' : 'Sold';

        container.innerHTML = `
            <a href="${backLink}" class="back-link">${backText}</a>
            <img 
                src="${work.image}" 
                alt="${work.title}" 
                class="single-work-image"
            >
            <div class="single-work-meta">
                <div class="single-work-info">
                    <h1 class="single-work-title">${work.title}</h1>
                    <p class="single-work-details">
                        ${work.year} · ${work.medium} · ${work.dimensions}
                    </p>
                    <p class="single-work-details">${availabilityText}</p>
                </div>
                ${work.available ? `
                    <a href="/inquire.html?work=${encodeURIComponent(work.title)}&id=${work.id}" class="inquire-btn">
                        Inquire
                    </a>
                ` : ''}
            </div>
        `;

        // Update page title
        document.title = `${work.title} — Alchemy of Things`;
    }

    /**
     * Initialize inquiry form
     */
    function initInquiryForm() {
        const form = document.getElementById('inquiry-form');
        if (!form) return;

        // Pre-fill work reference from URL
        const params = new URLSearchParams(window.location.search);
        const workTitle = params.get('work');
        const workRef = document.getElementById('work-reference');
        
        if (workTitle && workRef) {
            workRef.textContent = `Regarding: ${workTitle}`;
        }

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.form-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'sending...';
            submitBtn.disabled = true;

            // Form will be handled by Netlify Forms
            try {
                const formData = new FormData(form);
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                });

                if (response.ok) {
                    form.innerHTML = `
                        <p class="empty-state">
                            Thank you for your inquiry.<br>
                            A response will follow when appropriate.
                        </p>
                    `;
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                alert('There was an error sending your inquiry. Please try again.');
            }
        });
    }

    /**
     * Initialize based on current page
     */
    function init() {
        // Determine which page we're on and initialize accordingly
        const path = window.location.pathname;
        
        if (path === '/' || path === '/index.html') {
            initPaintings();
        } else if (path === '/photography.html') {
            initPhotography();
        } else if (path === '/work.html') {
            initSingleWork();
        } else if (path === '/inquire.html') {
            initInquiryForm();
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
