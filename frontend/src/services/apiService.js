import axios from 'axios';

// Create an axios instance with base configuration
const apiService = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiService.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints for leads
export const leadService = {
  // Submit a new lead
  createLead: (leadData) => {
    return apiService.post('/api/leads', leadData);
  },
  
  // Get all leads (for admin/contractors)
  getLeads: (params) => {
    return apiService.get('/api/leads', { params });
  },
  
  // Get a specific lead
  getLead: (id) => {
    return apiService.get(`/api/leads/${id}`);
  },
  
  // Update lead status
  updateLeadStatus: (id, status) => {
    return apiService.patch(`/api/leads/${id}/status`, { status });
  }
};

// API endpoints for user authentication
export const authService = {
  // Register a new user
  register: (userData) => {
    return apiService.post('/api/users/register', userData);
  },
  
  // Login user
  login: (credentials) => {
    return apiService.post('/api/users/login', credentials);
  },
  
  // Get current user profile
  getCurrentUser: () => {
    return apiService.get('/api/users/me');
  },
  
  // Update user profile
  updateProfile: (userData) => {
    return apiService.put('/api/users/me', userData);
  }
};

// API endpoints for contractors
export const contractorService = {
  // Get all contractors
  getContractors: (params) => {
    return apiService.get('/api/contractors', { params });
  },
  
  // Get a specific contractor
  getContractor: (id) => {
    return apiService.get(`/api/contractors/${id}`);
  },
  
  // Update contractor profile
  updateProfile: (data) => {
    return apiService.put('/api/contractors/me', data);
  },
  
  // Get contractor's leads
  getMyLeads: (params) => {
    return apiService.get('/api/contractors/me/leads', { params });
  }
};

// API endpoints for services
export const serviceService = {
  // Get all service categories
  getCategories: () => {
    return apiService.get('/api/services/categories');
  },
  
  // Get all services
  getServices: (categoryId) => {
    return apiService.get('/api/services', { 
      params: { categoryId }
    });
  }
};

// API endpoints for quotes
export const quoteService = {
  // Create a new quote
  createQuote: (quoteData) => {
    return apiService.post('/api/quotes', quoteData);
  },
  
  // Get quotes for a lead
  getQuotesForLead: (leadId) => {
    return apiService.get(`/api/quotes/lead/${leadId}`);
  },
  
  // Get a specific quote
  getQuote: (id) => {
    return apiService.get(`/api/quotes/${id}`);
  },
  
  // Update quote status
  updateQuoteStatus: (id, status) => {
    return apiService.patch(`/api/quotes/${id}/status`, { status });
  }
};

export default apiService;