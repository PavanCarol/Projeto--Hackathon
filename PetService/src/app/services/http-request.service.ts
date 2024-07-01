import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpRequestService {
  constructor(private http: HttpClient) {}

  request(apiUrl: string): Observable<any> {
    const body = {};

    return this.http.post(`http://localhost:3300/api${apiUrl}`, body);
  }
}
