import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TableModule} from 'primeng/table';
import {ConfirmationService, FilterService, MessageService, PrimeNGConfig} from 'primeng/api';
import {MatButtonModule, MatToolbarModule} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {FullCalendarModule} from '@fullcalendar/angular';

import {AddReservationComponent} from './components/add-reservation/add-reservation.component';
import {HomeComponent} from './components/home-component/home.component';
import {AppRoutingModule} from './app-routing.module';
import {ToastModule} from 'primeng/toast';
import {DialogService, DynamicDialogComponent, DynamicDialogModule} from 'primeng/dynamicdialog';
import {ButtonModule} from 'primeng/button';
import {RippleModule} from 'primeng/ripple';
import {CalendarModule} from 'primeng/calendar';
import {InputTextModule} from 'primeng/inputtext';
import {LoginComponent} from './components/login-component/login.component';
import {JwtModule} from '@auth0/angular-jwt';
import {ResourceCalendarComponent} from './components/resource-calendar/resource-calendar.component';
import {AuthGuard} from './guards/auth.guard';
import {CreateCategoryComponent} from './components/create-category/create-category.component';
import {DropdownModule} from 'primeng/dropdown';
import {TooltipModule} from 'primeng/tooltip';
import {SlideMenuModule} from 'primeng/slidemenu';
import {AddEntityPopupComponent} from './components/add-entity-popup/add-entity-popup.component';
import {AddOrEditResourceComponent} from './components/add-or-edit-resource/add-or-edit-resource.component';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {DialogModule} from 'primeng/dialog';
import {InputNumberModule} from 'primeng/inputnumber';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {CreateUserComponent} from './components/create-user/create-user.component';
import {ListUsersComponent} from './components/list-users/list-users.component';
import {PasswordModule} from 'primeng/password';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ReservationsComponent} from './components/reservations/reservations.component';
import {MyReservationsComponent} from './components/my-reservations/my-reservations.component';

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  timeGridPlugin,
  interactionPlugin
]);


@NgModule({
  declarations: [
    AppComponent,
    AddReservationComponent,
    HomeComponent,
    LoginComponent,
    ResourceCalendarComponent,
    CreateCategoryComponent,
    AddEntityPopupComponent,
    AddOrEditResourceComponent,
    CreateUserComponent,
    ListUsersComponent,
    ReservationsComponent,
    MyReservationsComponent
  ],
  imports: [BrowserModule,
    FormsModule,
    HttpClientModule,
    CalendarModule,
    FullCalendarModule,
    AppRoutingModule,
    DynamicDialogModule,
    BrowserAnimationsModule,
    TableModule,
    MatToolbarModule,
    MatButtonModule,
    RouterModule.forRoot([]),
    JwtModule.forRoot({
      config: {
        tokenGetter: () => {
          return localStorage.getItem('access_token');
        },
      },
    }),
    FullCalendarModule,
    ToastModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    DropdownModule,
    TooltipModule,
    SlideMenuModule,
    InputTextareaModule,
    DialogModule,
    InputNumberModule,
    ProgressSpinnerModule,
    PasswordModule,
    ConfirmDialogModule
  ],
  providers: [
    FilterService,
    MessageService,
    DialogService,
    PrimeNGConfig,
    AuthGuard,
    ConfirmationService],
  bootstrap: [AppComponent],
  entryComponents: [
    CreateUserComponent,
    DynamicDialogComponent,
    AddReservationComponent,
    ResourceCalendarComponent,
    CreateCategoryComponent,
    AddEntityPopupComponent,
    AddOrEditResourceComponent
  ]
})
export class AppModule {
}
