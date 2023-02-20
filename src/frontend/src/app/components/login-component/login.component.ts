import {Component, OnInit} from '@angular/core';
import {LoginModel} from '../../models/login.model';
import {AuthenticationService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {MessageService} from 'primeng/api';
import {JwtHelperService} from '@auth0/angular-jwt';
import {UserModel} from '../../models/user.model';

@Component({
  selector: 'app-login-component',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public loginModel: LoginModel = new LoginModel();

  constructor(private authService: AuthenticationService,
              public router: Router,
              public messageService: MessageService,
              public authenticationService: AuthenticationService,
              public jwtHelperService: JwtHelperService) {
  }

  ngOnInit() {
  }

  public login(): void {
    this.authService.login(this.loginModel).subscribe(response => {
      localStorage.setItem('access_token', response.access_token);

      const tokenDecoded = this.jwtHelperService.decodeToken(response.access_token);
      const user = new UserModel();
      user.id = tokenDecoded.usrid;
      user.role = tokenDecoded.rl;
      user.email = tokenDecoded.sub;

      this.authenticationService.loginUser.next(user);
      this.router.navigateByUrl('home');
    }, err => {
      this.messageService.add({ severity: 'error', summary: 'Credentials not valid', life: 2000 });
    });
  }
}
