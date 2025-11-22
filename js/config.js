/**
 * API Configuration for Azaya Marketing
 * =====================================
 * This file centralizes all API endpoint configurations
 * Making it easy to switch between development and production
 */

// Environment detection
const isLocalhost = window.location.hostname === 'localhost' ||
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '';

// API Base URLs
const API_CONFIG = {
  // Production API (Render)
  production: 'https://azaya-marketing-lp-backend.onrender.com',

  // Development API (Local)
  development: 'http://localhost:5000',

  // Get current environment
  get baseURL() {
    // You can override this by setting a custom environment
    // Uncomment the line below to force production even in localhost
    return this.development;

    // return isLocalhost ? this.development : this.production;
  }
};

// API Endpoints
const API_ENDPOINTS = {
  // Contact Form
  contact: {
    send: '/api/contact'
  },

  // Authentication
  auth: {
    login: '/login'
  },

  // Blog Endpoints
  blogs: {
    all: '/api/blogs',
    featured: '/api/blogs/featured',
    byId: (id) => `/api/blogs/${id}`,
    byCategory: (category) => `/api/blogs/category/${category}`,
    byStatus: (status) => `/api/blogs/status/${status}`,
    search: (query) => `/api/blogs/search/${query}`,
    categories: '/api/blogs/meta/categories',
    create: '/api/blogs',
    update: (id) => `/api/blogs/${id}`,
    delete: (id) => `/api/blogs/${id}`,
    incrementView: (id) => `/api/blogs/${id}/view`
  },

  // Comment Endpoints
  comments: {
    submit: '/api/comments',
    getByBlog: (blogId) => `/api/comments/blog/${blogId}`,
    admin: {
      all: '/api/comments/admin/all',
      stats: '/api/comments/admin/stats',
      delete: (userId, commentId) => `/api/comments/admin/${userId}/${commentId}`
    }
  }
};

/**
 * Build full API URL
 * @param {string} endpoint - Endpoint path
 * @returns {string} Full API URL
 */
function getApiUrl(endpoint) {
  return `${API_CONFIG.baseURL}${endpoint}`;
}

/**
 * Make API Request with error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} Response data
 */
async function apiRequest(endpoint, options = {}) {
  const url = getApiUrl(endpoint);

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  const config = { ...defaultOptions, ...options };

  try {
    console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    console.log(`✅ API Response: Success`);
    return data;

  } catch (error) {
    console.error(`❌ API Error:`, error);
    throw error;
  }
}

/**
 * Send contact form
 * @param {Object} formData - Contact form data {name, lastname, email, phone, company, subject, message}
 * @returns {Promise} Response
 */
async function sendContactForm(formData) {
  return apiRequest(API_ENDPOINTS.contact.send, {
    method: 'POST',
    body: JSON.stringify(formData)
  });
}

/**
 * Authenticate user
 * @param {Object} credentials - {username, password}
 * @returns {Promise} Auth response with token
 */
async function login(credentials) {
  return apiRequest(API_ENDPOINTS.auth.login, {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

/**
 * Get all blogs
 * @returns {Promise} Array of blogs
 */
async function getAllBlogs() {
  return apiRequest(API_ENDPOINTS.blogs.all);
}

/**
 * Get featured blogs
 * @returns {Promise} Array of featured blogs
 */
async function getFeaturedBlogs() {
  return apiRequest(API_ENDPOINTS.blogs.featured);
}

/**
 * Get blog by ID
 * @param {string} id - Blog ID
 * @returns {Promise} Blog object
 */
async function getBlogById(id) {
  return apiRequest(API_ENDPOINTS.blogs.byId(id));
}

/**
 * Search blogs
 * @param {string} query - Search query
 * @returns {Promise} Array of matching blogs
 */
async function searchBlogs(query) {
  return apiRequest(API_ENDPOINTS.blogs.search(query));
}

/**
 * Submit comment
 * @param {Object} commentData - Comment data {blogId, name, email, comment}
 * @returns {Promise} Created comment
 */
async function submitComment(commentData) {
  return apiRequest(API_ENDPOINTS.comments.submit, {
    method: 'POST',
    body: JSON.stringify(commentData)
  });
}

/**
 * Get comments for a blog
 * @param {string} blogId - Blog ID
 * @returns {Promise} Array of comments
 */
async function getBlogComments(blogId) {
  return apiRequest(API_ENDPOINTS.comments.getByBlog(blogId));
}

// Export for use in other files
window.API = {
  config: API_CONFIG,
  endpoints: API_ENDPOINTS,
  getUrl: getApiUrl,
  request: apiRequest,

  // Helper methods
  contact: {
    send: sendContactForm
  },
  auth: {
    login
  },
  blogs: {
    getAll: getAllBlogs,
    getFeatured: getFeaturedBlogs,
    getById: getBlogById,
    search: searchBlogs
  },
  comments: {
    submit: submitComment,
    getByBlog: getBlogComments
  }
};

// Log current configuration
console.log(`🔧 API Configuration loaded`);
console.log(`📍 Environment: ${isLocalhost ? 'Development' : 'Production'}`);
console.log(`🌐 Base URL: ${API_CONFIG.baseURL}`);
