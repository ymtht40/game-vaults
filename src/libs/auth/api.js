// Shared axios client for internal /api routes (used by checkout and other client code)

import axios from 'axios';
import { toast } from 'sonner';
import { appConfig } from '@/libs/config/appConfig'; // NOTE: module id: 516799

const apiClient = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.response.use(
  // Unwrap the response so callers receive the JSON body directly
  (response) => response.data,
  (error) => {
    let message = '';

    if (error.response?.status === 401) {
      toast.error('Please login');

      // redirect() from next/navigation only works during render, so use a hard navigation here
      if (typeof window !== 'undefined') {
        const here = window.location.pathname + window.location.search;
        const loginUrl = appConfig.auth.loginUrl;
        window.location.assign(`${loginUrl}?redirectTo=${encodeURIComponent(here)}`);
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      message = 'Pick a plan to use this feature';
    } else {
      message = error?.response?.data?.error || error.message || error.toString();
    }

    error.message = typeof message === 'string' ? message : JSON.stringify(message);

    console.error(error.message);
    toast.error(error.message || 'something went wrong...');

    return Promise.reject(error);
  },
);

export { apiClient };
export default apiClient;
