// admin-dashboard.js
const API_BASE_URL = 'http://localhost:5000/api';
let currentEditId = null;
let uploadedImageData = null;
let featuredImageData = null;
let imageModal = null;
let currentFilter = 'all';

// ========================================
// AUTHENTICATION & SESSION VALIDATION
// ========================================

// Check authentication on page load
function checkAuth() {
    const session = sessionStorage.getItem('adminSession');

    if (!session) {
        // No session found - redirect to login
        window.location.href = './admin-panel.html';
        return false;
    }

    try {
        const data = JSON.parse(session);

        // Check if session has expired (24 hours)
        const sessionAge = Date.now() - data.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionAge > maxAge) {
            sessionStorage.removeItem('adminSession');
            alert('Session expired. Please login again.');
            window.location.href = './admin-panel.html';
            return false;
        }

        // Display admin email
        document.getElementById('adminEmail').textContent = data.email;
        return true;
    } catch (error) {
        console.error('Invalid session data:', error);
        sessionStorage.removeItem('adminSession');
        window.location.href = './admin-panel.html';
        return false;
    }
}

function getAuthToken() {
    const session = sessionStorage.getItem('adminSession');
    if (session) {
        const data = JSON.parse(session);
        return data.token;
    }
    return null;
}

function getAuthHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminSession');
        window.location.href = './admin-panel.html';
    }
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Validate session first
    if (!checkAuth()) {
        return; // Will redirect to login
    }

    // Initialize Bootstrap modal
    imageModal = new bootstrap.Modal(document.getElementById('imageModal'));

    // Character counters
    const metaTitle = document.getElementById('metaTitle');
    const metaTitleCount = document.getElementById('metaTitleCount');
    metaTitle.addEventListener('input', () => {
        metaTitleCount.textContent = metaTitle.value.length;
    });

    const metaDesc = document.getElementById('metaDescription');
    const metaDescCount = document.getElementById('metaDescCount');
    metaDesc.addEventListener('input', () => {
        metaDescCount.textContent = metaDesc.value.length;
    });

    // Category select handler
    document.getElementById('categorySelect').addEventListener('change', function() {
        const newCategoryInput = document.getElementById('newCategory');
        if (this.value === '__new__') {
            newCategoryInput.style.display = 'block';
            newCategoryInput.required = true;
        } else {
            newCategoryInput.style.display = 'none';
            newCategoryInput.required = false;
            newCategoryInput.value = '';
        }
    });

    // Featured image upload handlers
    setupFeaturedImageUpload();

    // Content image upload handlers
    setupContentImageUpload();

    // Load blogs
    loadBlogs();
});

// ========================================
// IMAGE UPLOAD HANDLERS
// ========================================

function setupFeaturedImageUpload() {
    const input = document.getElementById('featuredImageInput');
    const uploadArea = document.getElementById('featuredUploadArea');
    const preview = document.getElementById('featuredImagePreview');

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > 5 * 1024 * 1024) {
                showAlert('alertForm', 'Image size must be less than 5MB', 'danger');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                featuredImageData = event.target.result;
                displayFeaturedImagePreview(featuredImageData);
            };
            reader.readAsDataURL(file);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > 5 * 1024 * 1024) {
                showAlert('alertForm', 'Image size must be less than 5MB', 'danger');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                featuredImageData = event.target.result;
                displayFeaturedImagePreview(featuredImageData);
            };
            reader.readAsDataURL(file);
        }
    });
}

function displayFeaturedImagePreview(imageSrc) {
    const uploadArea = document.getElementById('featuredUploadArea');
    const preview = document.getElementById('featuredImagePreview');

    uploadArea.style.display = 'none';
    preview.style.display = 'block';
    preview.innerHTML = `
        <div class="upload-preview">
            <img src="${imageSrc}" alt="Featured Preview">
            <button type="button" class="remove-image" onclick="removeFeaturedImage()">
                <i class="bi bi-x"></i>
            </button>
        </div>
    `;
}

function removeFeaturedImage() {
    featuredImageData = null;
    document.getElementById('featuredUploadArea').style.display = 'block';
    document.getElementById('featuredImagePreview').style.display = 'none';
    document.getElementById('featuredImagePreview').innerHTML = '';
    document.getElementById('featuredImageInput').value = '';
}

function setupContentImageUpload() {
    const input = document.getElementById('imageFileInput');
    const uploadArea = document.getElementById('uploadArea');
    const preview = document.getElementById('imagePreview');

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedImageData = event.target.result;
                uploadArea.style.display = 'none';
                preview.style.display = 'block';
                preview.innerHTML = `
                    <div class="upload-preview">
                        <img src="${uploadedImageData}" alt="Preview">
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedImageData = event.target.result;
                uploadArea.style.display = 'none';
                preview.style.display = 'block';
                preview.innerHTML = `
                    <div class="upload-preview">
                        <img src="${uploadedImageData}" alt="Preview">
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    });
}

// ========================================
// ALERT HELPER
// ========================================

function showAlert(elementId, message, type = 'info') {
    const alertEl = document.getElementById(elementId);
    alertEl.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    setTimeout(() => {
        alertEl.innerHTML = '';
    }, 5000);
}

// ========================================
// PANEL SWITCHING
// ========================================

function switchPanel(panel) {
    const navLinks = document.querySelectorAll('#adminNav .nav-link');
    navLinks.forEach(link => link.classList.remove('active'));

    if (panel === 'list') {
        document.getElementById('listPanel').style.display = 'block';
        document.getElementById('addPanel').style.display = 'none';
        navLinks[0].classList.add('active');
        loadBlogs();
    } else {
        // Reset form completely when switching to add panel
        resetForm();
        document.getElementById('listPanel').style.display = 'none';
        document.getElementById('addPanel').style.display = 'block';
        navLinks[1].classList.add('active');
    }
}

// ========================================
// FILTER BLOGS
// ========================================

function filterBlogs(filter) {
    currentFilter = filter;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.filter-btn').classList.add('active');

    loadBlogs();
}

// ========================================
// RICH TEXT EDITOR
// ========================================

function formatText(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('contentEditor').focus();
}

function insertLink() {
    const url = prompt('Enter the URL:');
    if (url) {
        document.execCommand('createLink', false, url);
    }
    document.getElementById('contentEditor').focus();
}

function openImageModal() {
    imageModal.show();
    document.getElementById('imageUrlInput').value = '';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imagePreview').innerHTML = '';
    uploadedImageData = null;
}

function insertImage() {
    const urlInput = document.getElementById('imageUrlInput');
    const imageUrl = urlInput.value || uploadedImageData;

    if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';

        const editor = document.getElementById('contentEditor');
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.insertNode(img);
            range.collapse(false);
        } else {
            editor.appendChild(img);
        }

        imageModal.hide();
        editor.focus();
    } else {
        showAlert('alertForm', 'Please enter an image URL or upload an image', 'warning');
    }
}

function getEditorContent() {
    return document.getElementById('contentEditor').innerHTML;
}

// ========================================
// LOAD BLOGS
// ========================================

async function loadBlogs() {
    const container = document.getElementById('blogListContainer');
    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    try {
        let url = `${API_BASE_URL}/blogs`;

        // Add authentication header to get all blogs
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
            throw new Error('Failed to fetch blogs');
        }

        let blogs = await response.json();

        // Apply client-side filtering
        if (currentFilter !== 'all') {
            if (currentFilter === 'featured') {
                blogs = blogs.filter(blog => blog.featured === true);
            } else {
                blogs = blogs.filter(blog => blog.status === currentFilter);
            }
        }

        if (blogs.length === 0) {
            const filterText = currentFilter === 'all' ? 'blogs' : currentFilter + ' blogs';
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <h4 class="mt-3">No ${filterText} yet</h4>
                    <p>Start by adding your first blog post!</p>
                    <button class="btn btn-primary mt-3" onclick="switchPanel('add')">
                        <i class="bi bi-plus-circle me-2 fs-6"></i>Add New Blog
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="row g-4">
                ${blogs.map(blog => {
                    const blogId = blog._id || blog.id;
                    const title = (blog.title || 'Untitled').replace(/'/g, "\\'");
                    const statusBadge = blog.status ? `status-${blog.status}` : 'status-draft';
                    const statusText = blog.status ? blog.status.charAt(0).toUpperCase() + blog.status.slice(1) : 'Draft';

                    return `
                        <div class="col-md-6 col-lg-4">
                            <div class="blog-card position-relative">
                                ${blog.featured === true ? '<div class="featured-star"><i class="bi bi-star-fill"></i></div>' : ''}
                                ${blog.thumbnail ?
                                    `<img src="${blog.thumbnail}" alt="${blog.title || 'Blog'}" class="blog-thumbnail" onerror="this.src=''; this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                    <div class="blog-thumbnail bg-light align-items-center justify-content-center" style="display: none;"><i class="bi bi-image fs-1 text-muted"></i></div>` :
                                    '<div class="blog-thumbnail bg-light d-flex align-items-center justify-content-center"><i class="bi bi-image fs-1 text-muted"></i></div>'
                                }
                                <div class="blog-card-body">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <span class="badge ${statusBadge}">${statusText}</span>
                                        ${blog.categories && blog.categories.length > 0 ?
                                            `<span class="badge bg-secondary">${blog.categories[0]}</span>` : ''
                                        }
                                    </div>
                                    <div class="blog-title">${blog.title || 'Untitled'}</div>
                                    <div class="blog-meta mb-3">
                                        <i class="bi bi-calendar3 me-1"></i>
                                        ${blog.date ? new Date(blog.date).toLocaleDateString() : 'No date'}
                                    </div>
                                    <div class="d-flex gap-2">
                                        <button class="btn btn-sm btn-outline-primary" onclick="editBlog('${blogId}')">
                                            <i class="bi bi-pencil me-1"></i>Edit
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteBlog('${blogId}', '${title}')">
                                            <i class="bi bi-trash me-1"></i>Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

    } catch (error) {
        console.error('Error loading blogs:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-exclamation-triangle text-danger"></i>
                <h4 class="mt-3">Error loading blogs</h4>
                <p>${error.message}</p>
                <button class="btn btn-primary mt-3" onclick="loadBlogs()">
                    <i class="bi bi-arrow-clockwise me-2"></i>Retry
                </button>
            </div>
        `;
    }
}

// ========================================
// EDIT BLOG
// ========================================

async function editBlog(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
            throw new Error('Failed to fetch blog');
        }

        const blog = await response.json();
        currentEditId = id;

        switchPanel('add');
        document.getElementById('formTitle').textContent = 'Edit Blog';
        document.getElementById('submitBtnText').textContent = 'Update Blog';
        document.getElementById('blogId').value = id;

        // Basic fields
        document.getElementById('title').value = blog.title || '';
        document.getElementById('date').value = blog.date ? blog.date.split('T')[0] : '';
        document.getElementById('status').value = blog.status || 'draft';
        document.getElementById('featured').checked = blog.featured || false;

        // Category
        const categorySelect = document.getElementById('categorySelect');
        const category = blog.categories && blog.categories.length > 0 ? blog.categories[0] : '';
        const categoryExists = Array.from(categorySelect.options).some(opt => opt.value === category);

        if (categoryExists) {
            categorySelect.value = category;
        } else if (category) {
            categorySelect.value = '__new__';
            document.getElementById('newCategory').style.display = 'block';
            document.getElementById('newCategory').value = category;
        }

        // Content
        document.getElementById('contentEditor').innerHTML = blog.content || '<p>Start typing...</p>';

        // Featured image
        if (blog.thumbnail) {
            featuredImageData = blog.thumbnail;
            displayFeaturedImagePreview(blog.thumbnail);
        }

        // SEO fields
        if (blog.seo) {
            document.getElementById('metaTitle').value = blog.seo.metaTitle || '';
            document.getElementById('metaDescription').value = blog.seo.metaDescription || '';
            document.getElementById('keywords').value = (blog.seo.keywords || []).join(', ');
            document.getElementById('robotsIndex').checked = blog.seo.robotsIndex !== false;
            document.getElementById('robotsFollow').checked = blog.seo.robotsFollow !== false;

            document.getElementById('metaTitleCount').textContent = (blog.seo.metaTitle || '').length;
            document.getElementById('metaDescCount').textContent = (blog.seo.metaDescription || '').length;
        }

        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Error loading blog for edit:', error);
        showAlert('alertList', 'Failed to load blog for editing', 'danger');
    }
}

// ========================================
// DELETE BLOG
// ========================================

async function deleteBlog(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
            throw new Error('Failed to delete blog');
        }

        showAlert('alertList', 'Blog deleted successfully!', 'success');
        setTimeout(() => loadBlogs(), 1000);
    } catch (error) {
        console.error('Error deleting blog:', error);
        showAlert('alertList', 'Failed to delete blog', 'danger');
    }
}

// ========================================
// CANCEL EDIT
// ========================================

function cancelEdit() {
    if (currentEditId) {
        if (!confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
            return;
        }
    }
    resetForm();
    switchPanel('list');
}

// ========================================
// RESET FORM
// ========================================

function resetForm() {
    document.getElementById('blogForm').reset();
    document.getElementById('contentEditor').innerHTML = '<p>Start typing your blog content here...</p>';
    document.getElementById('formTitle').textContent = 'Add New Blog';
    document.getElementById('submitBtnText').textContent = 'Save Blog';
    document.getElementById('blogId').value = '';
    document.getElementById('newCategory').style.display = 'none';
    document.getElementById('metaTitleCount').textContent = '0';
    document.getElementById('metaDescCount').textContent = '0';
    document.getElementById('status').value = 'draft';
    document.getElementById('featured').checked = false;
    document.getElementById('robotsIndex').checked = true;
    document.getElementById('robotsFollow').checked = true;
    removeFeaturedImage();
    currentEditId = null;
}

// ========================================
// FORM SUBMISSION
// ========================================

document.getElementById("blogForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const content = getEditorContent();
    if (!content || content.trim() === '<p>Start typing your blog content here...</p>' || content.trim() === '') {
        showAlert('alertForm', 'Please enter blog content', 'warning');
        return;
    }

    // Get category
    const categorySelect = document.getElementById('categorySelect');
    const newCategoryInput = document.getElementById('newCategory');
    let category = categorySelect.value;

    if (category === '__new__') {
        category = newCategoryInput.value.trim();
        if (!category) {
            showAlert('alertForm', 'Please enter a category name', 'warning');
            return;
        }
    }

    const blogId = document.getElementById('blogId').value;
    const isEdit = !!blogId;

    const blogData = {
        title: document.getElementById("title").value,
        categories: category ? [category] : [],
        content: content,
        date: document.getElementById("date").value || new Date().toISOString().split('T')[0],
        thumbnail: featuredImageData || '',
        status: document.getElementById("status").value,
        featured: document.getElementById("featured").checked,
        seo: {
            metaTitle: document.getElementById("metaTitle").value,
            metaDescription: document.getElementById("metaDescription").value,
            keywords: document.getElementById("keywords").value
                .split(",")
                .map(k => k.trim())
                .filter(k => k),
            robotsIndex: document.getElementById("robotsIndex").checked,
            robotsFollow: document.getElementById("robotsFollow").checked
        }
    };

    try {
        const url = isEdit ? `${API_BASE_URL}/blogs/${blogId}` : `${API_BASE_URL}/blogs`;
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(blogData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const actionText = isEdit ? 'updated' : 'saved';
        showAlert('alertForm', `Blog ${actionText} successfully!`, 'success');

        setTimeout(() => {
            resetForm();
            switchPanel('list');
        }, 1500);

    } catch (error) {
        console.error("Failed to save blog:", error);
        showAlert('alertForm', 'Failed to save blog. Please try again.', 'danger');
    }
});
