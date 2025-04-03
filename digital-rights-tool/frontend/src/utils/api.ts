// Fetch-based API client

// Helper function to get auth token
const getToken = () => localStorage.getItem('token');

// Base API URL
const baseURL = '/api';

// Helper to handle unauthorized responses
const handleUnauthorized = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Only redirect if not already on the login page to avoid loops
  const currentPath = window.location.pathname;
  if (currentPath !== '/login' && currentPath !== '/register') {
    window.location.href = '/login';
  }
};

// Main API object with methods for different HTTP verbs
const api = {
  // GET request
  async get(url: string) {
    const token = getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${baseURL}${url}`, {
      method: 'GET',
      headers
    });
    
    if (response.status === 401) {
      handleUnauthorized();
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return {
      data: await response.json(),
      status: response.status
    };
  },
  
  // POST request
  async post(url: string, data?: any) {  // Removed the 'options' parameter
    const token = getToken();
    const headers: HeadersInit = {};
    
    // Only set Content-Type for JSON requests, not for FormData
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${baseURL}${url}`, {
      method: 'POST',
      headers,
      body: data instanceof FormData ? data : JSON.stringify(data)
    });
    
    if (response.status === 401) {
      handleUnauthorized();
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.json();
      console.log('API Response:', responseData); // Add logging
      return {
        data: responseData,
        status: response.status
      };
    } else {
      return {
        data: await response.text(),
        status: response.status
      };
    }
  },
  
  // PUT request
  async put(url: string, data: any) {
    const token = getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${baseURL}${url}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    
    if (response.status === 401) {
      handleUnauthorized();
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return {
      data: await response.json(),
      status: response.status
    };
  },
  
  // DELETE request
  async delete(url: string) {
    const token = getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${baseURL}${url}`, {
      method: 'DELETE',
      headers
    });
    
    if (response.status === 401) {
      handleUnauthorized();
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return {
      data: await response.json(),
      status: response.status
    };
  }
};

export default api;
