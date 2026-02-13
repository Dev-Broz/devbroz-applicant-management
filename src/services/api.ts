const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const applicationsApi = {
  /**
   * Get all applications from Firebase with job listing details
   */
  getAll: async (filters?: {
    jobId?: string;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
  }) => {
    const params = new URLSearchParams();
    if (filters?.jobId) params.append('jobId', filters.jobId);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.orderBy) params.append('orderBy', filters.orderBy);
    if (filters?.order) params.append('order', filters.order);

    const response = await fetch(
      `${API_BASE_URL}/api/applications?${params.toString()}`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Get single application by ID with job listing details
   */
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/applications/${id}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Get application statistics
   */
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/applications/stats`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Search applications
   */
  search: async (query: string, field?: string) => {
    const params = new URLSearchParams({ query });
    if (field) params.append('field', field);

    const response = await fetch(
      `${API_BASE_URL}/api/applications/search?${params.toString()}`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Create new application
   */
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Update application
   */
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Delete application
   */
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Get all job listings
   */
  getJobListings: async () => {
    const response = await fetch(`${API_BASE_URL}/api/applications/jobs`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Get single job listing by job_id
   */
  getJobListingByJobId: async (jobId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/applications/jobs/${jobId}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },
};

/**
 * Projects API - Kanban Projects Management
 */
export const projectsApi = {
  /**
   * Get all Kanban projects
   */
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/projects`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Get single project by ID
   */
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Create new Kanban project
   */
  create: async (name: string, applicantIds: string[]) => {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, applicantIds }),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Update Kanban project
   */
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Delete Kanban project
   */
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Update applicant status (when dragging in Kanban)
   */
  updateApplicantStatus: async (applicantId: string, status: string) => {
    const response = await fetch(`${API_BASE_URL}/api/projects/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicantId, status }),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },
};
