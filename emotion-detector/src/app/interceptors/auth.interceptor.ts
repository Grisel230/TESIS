import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Obtener el token del servicio de autenticación
  const token = authService.getToken();
  
  console.log('🔐 AuthInterceptor ejecutándose para URL:', req.url);
  console.log('🔐 Token disponible:', !!token);
  
  // Si hay token, agregarlo al header Authorization
  if (token) {
    console.log('🔐 Agregando token a la request');
    const authRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authRequest);
  }
  
  console.log('🔐 No hay token, continuando sin autenticación');
  // Si no hay token, continuar con la request original
  return next(req);
};
