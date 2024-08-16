import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken();
    const refreshToken = this.authService.getRefreshToken();
  
    let authReq = req;
    if (authToken) {
      const headersConfig: any = {
        Authorization: `Bearer ${authToken}`,
      };
      
      if (refreshToken) {
        headersConfig['x-refresh-token'] = refreshToken;
      }
      
      authReq = req.clone({
        setHeaders: headersConfig,
      });
    }
  
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !authReq.url.includes('login')) {
          return this.authService.refreshToken().pipe(
            switchMap((tokens) => {
              this.authService.setTokens(tokens);  // Atualiza os tokens

              // Clonar a requisição original com os novos tokens
              const newAuthReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${tokens.authToken}`,
                  'x-refresh-token': tokens.refreshToken,
                },
              });
              return next.handle(newAuthReq);
            }),
            catchError((err) => {
              this.authService.logout();
              return throwError(err);
            })
          );
        }
        return throwError(error);
      })
    );
  }
  
}