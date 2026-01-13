// =============================================
// Λ◦T – Gallery JavaScript
// Interactions, animations, and translations
// =============================================

// ===== Translation Data =====
const translations = {
    en: {
        nav: {
            gallery: 'Gallery',
            about: 'About',
            enquire: 'Enquire'
        },
        hero: {
            line1: 'I paint what moves through me.',
            line2: 'Joy, loss, recognition.',
            line3: 'Moments held in space.',
            subtitle: 'Original acrylic works by Takura',
            scroll: 'Scroll to explore'
        },
        gallery: {
            title: 'Collection',
            description: 'Exploring how we hold emotion in space. Red focal points against blue and white voids. Each piece catches something before it escapes.'
        },
        about: {
            title: 'About the Work',
            lead: 'Creating visual moments where feeling becomes tangible.',
            p1: 'These pieces explore how we hold emotion in space. The red focal points against blue and white natural voids. Joy, loss, recognition. Moments where memory finds form.',
            p2: 'I've spent years understanding how people move through space, how light falls, where the eye rests. Now I paint those invisible structures—the architecture we build around our feelings, the voids we navigate between moments.',
            p3: 'Each piece is an exploration. Acrylic on canvas. Immediate, direct, unrefined in the best way—catching something before it disappears.',
            medium: { title: 'Medium', text: 'Acrylic on canvas' },
            style: { title: 'Visual Language', text: 'Abstract spatial exploration—red focal elements against blue and white natural voids' },
            collection: { title: 'Collection', text: '15 original works, 2024-2025' },
            approach: { title: 'Approach', text: 'Each piece explores themes of joy, loss, and recognition through spatial experience' }
        },
        contact: {
            title: 'Enquire About a Piece',
            subtitle: 'All works are original, one-of-a-kind. Pricing transparent: time + materials + margin. Direct sales, no gallery commission.',
            form: {
                name: 'Your Name',
                email: 'Email',
                phone: 'Phone (Optional)',
                artwork: 'Piece You're Interested In',
                select: 'Select a piece',
                general: 'General Enquiry',
                message: 'Message',
                submit: 'Send Enquiry'
            },
            direct: {
                title: 'Prefer to reach out directly?',
                email: 'Email:',
                whatsapp: 'WhatsApp:'
            }
        }
    },
    fr: {
        nav: {
            gallery: 'Galerie',
            about: 'À Propos',
            enquire: 'Contact'
        },
        hero: {
            line1: 'Je peins ce qui me traverse.',
            line2: 'Joie, perte, reconnaissance.',
            line3: 'Moments suspendus dans l\'espace.',
            subtitle: 'Œuvres acryliques originales par Takura',
            scroll: 'Défiler pour explorer'
        },
        gallery: {
            title: 'Collection',
            description: 'Explorer comment nous retenons l\'émotion dans l\'espace. Points focaux rouges contre des vides bleus et blancs. Chaque pièce capture quelque chose avant qu\'il ne s\'échappe.'
        },
        about: {
            title: 'À Propos de l\'Œuvre',
            lead: 'Créer des moments visuels où le sentiment devient tangible.',
            p1: 'Ces pièces explorent comment nous retenons l\'émotion dans l\'espace. Les points focaux rouges contre les vides naturels bleus et blancs. Joie, perte, reconnaissance. Moments où la mémoire trouve sa forme.',
            p2: 'J\'ai passé des années à comprendre comment les gens se déplacent dans l\'espace, comment la lumière tombe, où le regard se pose. Maintenant je peins ces structures invisibles—l\'architecture que nous construisons autour de nos sentiments, les vides que nous naviguons entre les moments.',
            p3: 'Chaque pièce est une exploration. Acrylique sur toile. Immédiat, direct, brut dans le meilleur sens—capturer quelque chose avant qu\'il ne disparaisse.',
            medium: { title: 'Médium', text: 'Acrylique sur toile' },
            style: { title: 'Langage Visuel', text: 'Exploration spatiale abstraite—éléments focaux rouges contre des vides naturels bleus et blancs' },
            collection: { title: 'Collection', text: '15 œuvres originales, 2024-2025' },
            approach: { title: 'Approche', text: 'Chaque pièce explore les thèmes de la joie, de la perte et de la reconnaissance à travers l\'expérience spatiale' }
        },
        contact: {
            title: 'Demander une Œuvre',
            subtitle: 'Toutes les œuvres sont originales et uniques. Prix transparents : temps + matériaux + marge. Ventes directes, sans commission de galerie.',
            form: {
                name: 'Votre Nom',
                email: 'Email',
                phone: 'Téléphone (Optionnel)',
                artwork: 'Œuvre qui Vous Intéresse',
                select: 'Sélectionner une œuvre',
                general: 'Demande Générale',
                message: 'Message',
                submit: 'Envoyer la Demande'
            },
            direct: {
                title: 'Préférez-vous nous contacter directement ?',
                email: 'Email :',
                whatsapp: 'WhatsApp :'
            }
        }
    },
    de: {
        nav: {
            gallery: 'Galerie',
            about: 'Über',
            enquire: 'Anfrage'
        },
        hero: {
            line1: 'Ich male, was mich bewegt.',
            line2: 'Freude, Verlust, Erkennung.',
            line3: 'Momente im Raum festgehalten.',
            subtitle: 'Original-Acrylwerke von Takura',
            scroll: 'Scrollen zum Erkunden'
        },
        gallery: {
            title: 'Kollektion',
            description: 'Erkunden, wie wir Emotionen im Raum festhalten. Rote Brennpunkte gegen blaue und weiße Leerstellen. Jedes Stück fängt etwas ein, bevor es entweicht.'
        },
        about: {
            title: 'Über die Arbeit',
            lead: 'Visuelle Momente schaffen, in denen Gefühl greifbar wird.',
            p1: 'Diese Werke erkunden, wie wir Emotionen im Raum festhalten. Die roten Brennpunkte gegen natürliche blaue und weiße Leerstellen. Freude, Verlust, Erkennung. Momente, in denen Erinnerung Form findet.',
            p2: 'Ich habe Jahre damit verbracht zu verstehen, wie Menschen sich durch den Raum bewegen, wie Licht fällt, wo das Auge ruht. Jetzt male ich diese unsichtbaren Strukturen—die Architektur, die wir um unsere Gefühle bauen, die Leerstellen, die wir zwischen Momenten navigieren.',
            p3: 'Jedes Stück ist eine Erkundung. Acryl auf Leinwand. Unmittelbar, direkt, unverfeinert im besten Sinne—etwas einfangen, bevor es verschwindet.',
            medium: { title: 'Medium', text: 'Acryl auf Leinwand' },
            style: { title: 'Visuelle Sprache', text: 'Abstrakte räumliche Erkundung—rote Brennpunkte gegen blaue und weiße natürliche Leerstellen' },
            collection: { title: 'Kollektion', text: '15 Originalwerke, 2024-2025' },
            approach: { title: 'Ansatz', text: 'Jedes Stück erforscht Themen von Freude, Verlust und Erkennung durch räumliche Erfahrung' }
        },
        contact: {
            title: 'Anfrage zu einem Werk',
            subtitle: 'Alle Werke sind Original und Unikate. Transparente Preisgestaltung: Zeit + Material + Marge. Direktverkauf, keine Galerieprovision.',
            form: {
                name: 'Ihr Name',
                email: 'E-Mail',
                phone: 'Telefon (Optional)',
                artwork: 'Werk, das Sie Interessiert',
                select: 'Werk auswählen',
                general: 'Allgemeine Anfrage',
                message: 'Nachricht',
                submit: 'Anfrage Senden'
            },
            direct: {
                title: 'Möchten Sie direkt Kontakt aufnehmen?',
                email: 'E-Mail:',
                whatsapp: 'WhatsApp:'
            }
        }
    }
};

// ===== Current Language State =====
let currentLang = 'en';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Λ◦T Gallery - Script loaded successfully');
    console.log('Initializing components...');
    initScrollAnimations();
    initFormHandling();
    initSmoothScroll();
    initLanguageSwitcher();
    console.log('All components initialized');
});

// ===== Language Switcher =====
function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    console.log('Language switcher initialized. Found ' + langButtons.length + ' buttons');
    
    langButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            console.log('Switching to language: ' + lang);
            switchLanguage(lang);
            
            // Update active state
            langButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Load saved language preference
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && translations[savedLang]) {
        switchLanguage(savedLang);
        document.querySelector(`[data-lang="${savedLang}"]`)?.classList.add('active');
        document.querySelector('[data-lang="en"]')?.classList.remove('active');
    }
}

function switchLanguage(lang) {
    console.log('switchLanguage called with: ' + lang);
    
    if (!translations[lang]) {
        console.error('No translations found for language: ' + lang);
        return;
    }
    
    currentLang = lang;
    localStorage.setItem('preferred-language', lang);
    console.log('Language preference saved: ' + lang);
    
    // Update all translatable elements
    let updatedCount = 0;
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getNestedTranslation(translations[lang], key);
        
        if (translation) {
            element.textContent = translation;
            updatedCount++;
        } else {
            console.warn('No translation found for key: ' + key);
        }
    });
    
    console.log('Updated ' + updatedCount + ' elements to ' + lang);
}

function getNestedTranslation(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

// ===== Scroll Animations =====
function initScrollAnimations() {
    const artworkItems = document.querySelectorAll('.artwork-item');
    
    // Create intersection observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add stagger delay to each item
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all artwork items
    artworkItems.forEach(item => {
        observer.observe(item);
    });
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = document.querySelector('.nav').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== Form Handling =====
function initFormHandling() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        artwork: document.getElementById('artwork').value,
        message: document.getElementById('message').value
    };
    
    // For GoDaddy hosting, you'll need to set up email forwarding
    // or use a service like Formspree, EmailJS, or similar
    
    // Option 1: Use mailto (opens email client)
    const subject = encodeURIComponent(`Inquiry: ${formData.artwork || 'General'}`);
    const body = encodeURIComponent(
        `Name: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Phone: ${formData.phone || 'Not provided'}\n` +
        `Artwork: ${formData.artwork || 'General Inquiry'}\n\n` +
        `Message:\n${formData.message}`
    );
    
    window.location.href = `mailto:enquiries@alchemyofthings.com?subject=${subject}&body=${body}`;
    
    // Show success message
    alert('Opening your email client. If it doesn\'t open automatically, please email us directly at enquiries@alchemyofthings.com');
    
    // Reset form
    e.target.reset();
    
    // Option 2: Use a form service (recommended for production)
    // Uncomment and configure one of these services:
    
    /*
    // FORMSPREE (formspree.io)
    fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        alert('Thank you! Your inquiry has been sent. We\'ll respond within 24 hours.');
        e.target.reset();
    })
    .catch(error => {
        alert('Sorry, there was an error sending your message. Please email us directly.');
        console.error('Form error:', error);
    });
    */
    
    /*
    // EMAILJS (emailjs.com)
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', formData)
        .then(function(response) {
            alert('Thank you! Your inquiry has been sent. We\'ll respond within 24 hours.');
            e.target.reset();
        }, function(error) {
            alert('Sorry, there was an error sending your message. Please email us directly.');
            console.error('Form error:', error);
        });
    */
}

// ===== Open Inquiry for Specific Artwork =====
function openInquiry(artworkName) {
    // Scroll to contact form
    const contactSection = document.getElementById('contact');
    const navHeight = document.querySelector('.nav').offsetHeight;
    const targetPosition = contactSection.offsetTop - navHeight - 20;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
    
    // Pre-select the artwork in the form
    setTimeout(() => {
        const artworkSelect = document.getElementById('artwork');
        if (artworkSelect) {
            // Find the option that matches the artwork name
            for (let option of artworkSelect.options) {
                if (option.value === artworkName) {
                    option.selected = true;
                    break;
                }
            }
        }
        
        // Focus on the name field
        document.getElementById('name').focus();
    }, 800); // Delay to allow scroll to complete
}

// ===== Navbar Scroll Effect =====
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        nav.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// ===== Image Lazy Loading (fallback for older browsers) =====
if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    console.log('Native lazy loading supported');
} else {
    // Fallback for older browsers
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}
