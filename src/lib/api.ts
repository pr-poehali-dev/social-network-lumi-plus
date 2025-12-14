import func2url from '../../backend/func2url.json';

const API_URLS = func2url;

export const getAuthToken = (): string | null => {
  return localStorage.getItem('lumi_auth_token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('lumi_auth_token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('lumi_auth_token');
};

export const getCurrentUser = (): any | null => {
  const userStr = localStorage.getItem('lumi_current_user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: any) => {
  localStorage.setItem('lumi_current_user', JSON.stringify(user));
};

export const removeCurrentUser = () => {
  localStorage.removeItem('lumi_current_user');
};

export const api = {
  auth: {
    register: async (username: string, email: string, password: string, full_name: string) => {
      const response = await fetch(API_URLS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          username,
          email,
          password,
          full_name
        })
      });
      return response.json();
    },
    
    login: async (email: string, password: string) => {
      const response = await fetch(API_URLS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email,
          password
        })
      });
      return response.json();
    },
    
    verify: async (token: string) => {
      const response = await fetch(API_URLS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          token
        })
      });
      return response.json();
    }
  },
  
  posts: {
    getAll: async (limit = 20, offset = 0) => {
      const response = await fetch(`${API_URLS.posts}?limit=${limit}&offset=${offset}`);
      return response.json();
    },
    
    create: async (caption: string, mediaFiles: any[], mediaType: string, location?: string) => {
      const token = getAuthToken();
      const response = await fetch(API_URLS.posts, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'create',
          caption,
          media_files: mediaFiles,
          media_type: mediaType,
          location
        })
      });
      return response.json();
    },
    
    like: async (postId: number) => {
      const token = getAuthToken();
      const response = await fetch(API_URLS.posts, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'like',
          post_id: postId
        })
      });
      return response.json();
    }
  }
};
