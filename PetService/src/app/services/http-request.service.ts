import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpRequestService {
  constructor(private http: HttpClient) {}

  getToken() {
    this.http
      .get(
        'https://login.microsoftonline.com/e35fd86c-d440-44e9-ac11-d6664b6b15b1/oauth2/token'
      )
      .subscribe(
        (res) => {
          console.log(res);
        },
        (err) => {}
      );
  }
}
