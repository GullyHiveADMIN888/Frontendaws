import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId'); // optional (future-proof)

  let headers: any = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (role) {
    headers['X-User-Role'] = role;
  }

  if (userId) {
    headers['X-User-Id'] = userId;
  }

  if (Object.keys(headers).length > 0) {
    req = req.clone({ setHeaders: headers });
  }

  return next(req);
};
