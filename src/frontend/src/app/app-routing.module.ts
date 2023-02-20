import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './components/home-component/home.component';
import {LoginComponent} from './components/login-component/login.component';
import {AuthGuard} from './guards/auth.guard';
import {ListUsersComponent} from './components/list-users/list-users.component';
import {ReservationsComponent} from './components/reservations/reservations.component';
import {MyReservationsComponent} from './components/my-reservations/my-reservations.component';

const routes: Routes = [

  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
  {path: 'users', component: ListUsersComponent, canActivate: [AuthGuard]},
  {path: 'reservations', component: ReservationsComponent, canActivate: [AuthGuard]},
  {path: 'my-reservations', component: MyReservationsComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
