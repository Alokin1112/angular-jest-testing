import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User, UserPage } from 'src/app/shared/types';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
  ) { }

  signUp(body: { username: string, email: string, password: string }) {
    return this.http?.post("/api/1.0/users", body)
  }

  isEmailTaken(email: string) {
    return this.http.post("/api/1.0/user/email", { email })
  }

  activate(token: string) {
    return this.http.post('/api/1.0/users/token/' + token, {});
  }
  loadUsers(): Observable<UserPage> {
    return this.http.get<UserPage>('/api/1.0/users');
  }

}
