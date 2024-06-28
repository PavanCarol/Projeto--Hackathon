import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpRequestService {
  constructor(private http: HttpClient) {}

  getToken() {
    const url =
      'https://login.microsoftonline.com/e35fd86c-d440-44e9-ac11-d6664b6b15b1/oauth2/token';

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new HttpParams()
      .set('client_id', 'd2611b85-13b9-440c-a029-2f86a24ad48b')
      .set('client_secret', 'y.u8Q~Xj3laOa6IHra1gKxZlCvpjozLx1PSIgcuN')
      .set('grant_type', 'client_credentials')
      .set('resource', 'https://newproject.crm.dynamics.com');

    this.http.post(url, body, { headers }).subscribe(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.error(err);
      }
    );
  }
}
