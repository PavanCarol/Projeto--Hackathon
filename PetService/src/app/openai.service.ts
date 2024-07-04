import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class OpenaiService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private apiKey = 'sk-proj-YNMzG6LN2LBe8aPFMEEqT3BlbkFJ6Mcl45uKcE0MZWYKaKab';

  constructor(private http: HttpClient) {}

  getChatResponse(messages: any[]): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    });

    const body = JSON.stringify({
      model: 'gpt-4', // ou use 'gpt-3.5-turbo'
      messages: messages,
    });

    return this.http.post(this.apiUrl, body, { headers: headers });
  }
}
