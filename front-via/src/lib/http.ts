import axios, { AxiosError } from 'axios';
import { supabase } from './supabase';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;

let queue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  queue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  queue = [];
};

// REQUEST
http.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// RESPONSE
http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as any;

    if (!original || original._retry) return Promise.reject(error);

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return http(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data, error: err } = await supabase.auth.refreshSession();

      if (err || !data.session) {
        processQueue(err, null);
        await supabase.auth.signOut();
        return Promise.reject(error);
      }

      const newToken = data.session.access_token;

      processQueue(null, newToken);

      original.headers.Authorization = `Bearer ${newToken}`;

      isRefreshing = false;

      return http(original);
    } catch (err) {
      processQueue(err, null);
      isRefreshing = false;
      return Promise.reject(err);
    }
  }
);