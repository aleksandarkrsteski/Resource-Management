import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {JwtHelperService} from '@auth0/angular-jwt';
import {BehaviorSubject} from 'rxjs';
import {HttpService} from './http.service';
import {LoginModel} from '../models/login.model';
import {map} from 'rxjs/operators';
import {SignupModel} from '../models/signup.model';
import {UserModel} from '../models/user.model';


const USER_API = 'http://localhost:8000';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  // tslint:disable-next-line:variable-name
  public _isLoggedIn$ = new BehaviorSubject<boolean>(false);
  private readonly accessToken = 'access_token';
  public isLoggedIn$ = this._isLoggedIn$.asObservable();

  loginUser = new BehaviorSubject<UserModel | null>(null);

  get token(): any {
    return localStorage.getItem(this.accessToken);
  }

  constructor(private httpService: HttpService, private httpClient: HttpClient, private jwtHelperService: JwtHelperService) {
    if (this.token && !jwtHelperService.isTokenExpired(this.token)) {
      this._isLoggedIn$.next(!!this.token);
      if (this.token != null) {
        const tokenDecoded = this.jwtHelperService.decodeToken(this.token);
        const user = new UserModel();
        user.id = tokenDecoded.usrid;
        user.role = tokenDecoded.rl;
        user.email = tokenDecoded.sub;
        this.loginUser.next(user);
      } else {
        this.loginUser.next(null);
      }
    }
  }

  //#region Public Methods
  login(model: LoginModel) {
    const formData: FormData = new FormData();
    formData.append('username', model.username);
    formData.append('password', model.password);
    return this.httpClient
      .post<any>(USER_API + '/token', formData, {
        headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
      })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  register(model: SignupModel) {
    const url = USER_API + '/register';
    return this.httpService.httpPost(url, model)
      .pipe(map(response => {
        return response;
      }));
  }

  listUsers() {
    return this.httpClient.get(USER_API + '/users', {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  registerUser(model: UserModel) {
    return this.httpClient.post(USER_API + '/register', model, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  updateUser(model: UserModel) {
    return this.httpClient.put(USER_API + '/users/' + model.id, model, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  deleteUser(id: number) {
    return this.httpClient.delete(USER_API + '/users/' + id, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  //#endregion
}
