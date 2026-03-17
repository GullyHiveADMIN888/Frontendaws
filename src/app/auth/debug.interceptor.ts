// debug.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const debugInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔍 Request URL:', req.url);
  console.log('🔍 Request Headers:', req.headers.keys().map(key => ({
    key,
    value: req.headers.get(key)
  })));
  
  // Check if token exists
  const token = localStorage.getItem('token');
  console.log('🔍 Token in storage:', token ? 'Present (first 20 chars: ' + token.substring(0, 20) + '...)' : 'Not found');
  
  return next(req);
};