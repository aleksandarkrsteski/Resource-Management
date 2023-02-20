import {Component} from '@angular/core';
import {AuthenticationService} from './services/auth.service';
import {Router} from '@angular/router';
import {UserModel} from './models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public isLoggedin = false;
  public user: UserModel;

  constructor(private router: Router, private authenticationService: AuthenticationService) {
    this.authenticationService.loginUser.subscribe(response => {
      this.isLoggedin = !!response;
      if (this.isLoggedin) {
        this.user = response;
      }
    });
  }

  public logout(): void {
    localStorage.removeItem('access_token');
    this.authenticationService.loginUser.next(null);
    this.router.navigate(['login']);
  }
}
