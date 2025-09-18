import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 0:
            errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.';
            break;
          case 400:
            errorMessage = error.error?.message || 'Solicitud incorrecta';
            break;
          case 401:
            errorMessage = 'No autorizado. Verifica tus credenciales.';
            break;
          case 403:
            errorMessage = 'Acceso denegado';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta nuevamente.';
            break;
          default:
            errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
        }
      }
      
      console.error('Error HTTP:', error);
      return throwError(() => new Error(errorMessage));
    })
  );
};
