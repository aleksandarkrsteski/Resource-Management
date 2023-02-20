import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {JwtHelperService} from '@auth0/angular-jwt';
import {AuthenticationService} from '../services/auth.service';

const jwtHelper = new JwtHelperService();
const TOKEN_KEY = 'access_token';

@Injectable()

export class AuthGuard implements CanActivate {

  //#region Fields
  //#endregion

  //#region Constructor
  constructor(private router: Router, private authenticationService: AuthenticationService) {
  }

  //#endregion

  // #Private Methods
  canActivate() {
    if (window.localStorage.getItem(TOKEN_KEY) && !jwtHelper.isTokenExpired(window.localStorage.getItem(TOKEN_KEY) as string)) {
      return true;

    } else {
      this.authenticationService.loginUser.next(null);
      this.authenticationService._isLoggedIn$.next(false);
      localStorage.removeItem(TOKEN_KEY);
      this.router.navigate(['login']);
      return false;
    }

  }

  //#endregion
}
