// =============================================
// Λ◦T Admin Panel JavaScript
// =============================================

// Default password (CHANGE THIS!)
const DEFAULT_PASSWORD = 'alchemy2025';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initLoginForm();
    initArtworkForm();
    loadAboutSection();
});

// ===== Authentication =====
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('aot_admin_auth');
    if (isAuthenticated === 'true') {
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadArtworks();
    loadAboutSection();
}

function initLoginForm() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('passwordInput').value;
        const savedPassword = localStorage.getItem('aot_admin_password') || DEFAULT_PASSWORD;
        
        if (password === savedPassword) {
            sessionStorage.setItem('aot_admin_auth', 'true');
            showDashboard();
        } else {
            document.getElementById('loginError').textContent = 'Invalid password';
        }
    });
}

function logout() {
    sessionStorage.removeItem('aot_admin_auth');
    showLogin();
    document.getElementById('passwordInput').value = '';
    document.getElementById('loginError').textContent = '';
}

function changePassword() {
    const newPassword = document.getElementById('newPassword').value;
    if (newPassword && newPassword.length >= 6) {
        localStorage.setItem('aot_admin_password', newPassword);
        alert('Password updated successfully!');
        document.getElementById('newPassword').value = '';
    } else {
        alert('Password must be at least 6 characters');
    }
}

// ===== Tab Navigation =====
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

// ===== Artworks Management =====
function getArtworks() {
    const artworks = localStorage.getItem('aot_artworks');
    return artworks ? JSON.parse(artworks) : [];
}

function saveArtworks(artworks) {
    localStorage.setItem('aot_artworks', JSON.stringify(artworks));
}

function loadArtworks() {
    const artworks = getArtworks();
    const container = document.getElementById('artworksList');
    
    if (artworks.length === 0) {
        container.innerHTML = '<p style="padding: 2rem; text-align: center; color: #666;">No artworks yet. Click "Add New Artwork" to get started.</p>';
        return;
    }
    
    container.innerHTML = artworks.map(artwork => `
        <div class="artwork-card">
            <img src="${artwork.image || 'images/placeholder.jpg'}" alt="${artwork.title}" class="artwork-card-image">
            <div class="artwork-card-content">
                <h3 class="artwork-card-title">${artwork.title}</h3>
                <p class="artwork-card-details">${artwork.medium} | ${artwork.size} | ${artwork.year}</p>
                <p class="artwork-card-details">Price: ${artwork.price}</p>
                <span class="artwork-card-status ${artwork.status}">${artwork.status === 'available' ? 'Available' : 'Sold'}</span>
                <div class="artwork-card-actions">
                    <button onclick="editArtwork('${artwork.id}')" class="btn-secondary">Edit</button>
                    <button onclick="deleteArtwork('${artwork.id}')" class="btn-danger">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function openArtworkModal(artworkId = null) {
    const modal = document.getElementById('artworkModal');
    const form = document.getElementById('artworkForm');
    const title = document.getElementById('modalTitle');
    
    // Reset form
    form.reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('artworkId').value = '';
    
    if (artworkId) {
        // Edit mode
        title.textContent = 'Edit Artwork';
        const artworks = getArtworks();
        const artwork = artworks.find(a => a.id === artworkId);
        
        if (artwork) {
            document.getElementById('artworkId').value = artwork.id;
            document.getElementById('artworkTitle').value = artwork.title;
            document.getElementById('artworkMedium').value = artwork.medium;
            document.getElementById('artworkSize').value = artwork.size;
            document.getElementById('artworkYear').value = artwork.year;
            document.getElementById('artworkStatus').value = artwork.status;
            document.getElementById('artworkPrice').value = artwork.price;
            
            if (artwork.image) {
                document.getElementById('imagePreview').innerHTML = `<img src="${artwork.image}" alt="Preview">`;
            }
        }
    } else {
        // Add mode
        title.textContent = 'Add New Artwork';
    }
    
    modal.classList.add('active');
}

function closeArtworkModal() {
    document.getElementById('artworkModal').classList.remove('active');
}

function initArtworkForm() {
    // Image preview
    document.getElementById('artworkImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('imagePreview').innerHTML = `<img src="${event.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Form submission
    document.getElementById('artworkForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveArtwork();
    });
}

function saveArtwork() {
    const artworks = getArtworks();
    const id = document.getElementById('artworkId').value || generateId();
    
    const imageFile = document.getElementById('artworkImage').files[0];
    const existingArtwork = artworks.find(a => a.id === id);
    
    const artwork = {
        id: id,
        title: document.getElementById('artworkTitle').value,
        medium: document.getElementById('artworkMedium').value,
        size: document.getElementById('artworkSize').value,
        year: document.getElementById('artworkYear').value,
        status: document.getElementById('artworkStatus').value,
        price: document.getElementById('artworkPrice').value,
        image: existingArtwork ? existingArtwork.image : ''
    };
    
    if (imageFile) {
        // Convert image to base64
        const reader = new FileReader();
        reader.onload = function(event) {
            artwork.image = event.target.result;
            finalizeArtworkSave(artwork, artworks);
        };
        reader.readAsDataURL(imageFile);
    } else {
        finalizeArtworkSave(artwork, artworks);
    }
}

function finalizeArtworkSave(artwork, artworks) {
    const existingIndex = artworks.findIndex(a => a.id === artwork.id);
    
    if (existingIndex >= 0) {
        artworks[existingIndex] = artwork;
    } else {
        artworks.push(artwork);
    }
    
    saveArtworks(artworks);
    loadArtworks();
    closeArtworkModal();
    generateHTMLFile();
}

function editArtwork(id) {
    openArtworkModal(id);
}

function deleteArtwork(id) {
    if (confirm('Are you sure you want to delete this artwork?')) {
        let artworks = getArtworks();
        artworks = artworks.filter(a => a.id !== id);
        saveArtworks(artworks);
        loadArtworks();
        generateHTMLFile();
    }
}

function generateId() {
    return 'artwork_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ===== About Section =====
function getAboutData() {
    const about = localStorage.getItem('aot_about');
    return about ? JSON.parse(about) : {
        lead: 'Creating visual moments where feeling becomes tangible.',
        p1: 'These pieces explore how we hold emotion in space. The red focal points against blue and white natural voids. Joy, loss, recognition. Moments where memory finds form.',
        p2: 'I've spent years understanding how people move through space, how light falls, where the eye rests. Now I paint those invisible structures—the architecture we build around our feelings, the voids we navigate between moments.',
        p3: 'Each piece is an exploration. Acrylic on canvas. Immediate, direct, unrefined in the best way—catching something before it disappears.'
    };
}

function loadAboutSection() {
    const about = getAboutData();
    document.getElementById('aboutLead').value = about.lead;
    document.getElementById('aboutP1').value = about.p1;
    document.getElementById('aboutP2').value = about.p2;
    document.getElementById('aboutP3').value = about.p3;
}

function saveAboutSection() {
    const about = {
        lead: document.getElementById('aboutLead').value,
        p1: document.getElementById('aboutP1').value,
        p2: document.getElementById('aboutP2').value,
        p3: document.getElementById('aboutP3').value
    };
    
    localStorage.setItem('aot_about', JSON.stringify(about));
    alert('About section saved successfully!');
    generateHTMLFile();
}

// ===== Data Export/Import =====
function exportData() {
    const data = {
        artworks: getArtworks(),
        about: getAboutData(),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aot-backup-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    const file = document.getElementById('importFile').files[0];
    if (!file) {
        alert('Please select a file to import');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.artworks) {
                saveArtworks(data.artworks);
                loadArtworks();
            }
            
            if (data.about) {
                localStorage.setItem('aot_about', JSON.stringify(data.about));
                loadAboutSection();
            }
            
            alert('Data imported successfully!');
            generateHTMLFile();
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// ===== Generate HTML File =====
function generateHTMLFile() {
    const artworks = getArtworks();
    const about = getAboutData();
    
    // This generates the gallery HTML based on admin data
    // You would copy this HTML into your index.html manually
    // Or set up an automatic process to update the live site
    
    console.log('Gallery data updated. Export HTML to update your live site.');
    console.log('Artworks:', artworks);
    console.log('About:', about);
}
