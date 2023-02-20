import {Component, OnInit} from '@angular/core';
import {ReservationModel} from '../../models/reservation.model';
import {ConfirmationService} from 'primeng/api';
import {UserModel} from '../../models/user.model';
import {AuthenticationService} from '../../services/auth.service';
import {ReservationsService} from '../../services/reservations.service';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css']
})
export class ReservationsComponent implements OnInit {

  reservations: ReservationModel[] = [];
  user: UserModel;

  constructor(private authService: AuthenticationService,
              private confirmationService: ConfirmationService,
              private reservationsService: ReservationsService) {
  }

  ngOnInit() {
    this.authService.loginUser.subscribe(response => {
      this.user = response;
    });
    this.loadReservations();
  }

  private loadReservations() {
    this.reservationsService.loadAllReservations().subscribe((res: any) => {
      this.reservations = res.map(x => {
        const reservation = new ReservationModel();
        reservation.id = x.id;
        reservation.fromDate = x.from_date;
        reservation.toDate = x.to_date;
        reservation.status = x.status;
        reservation.resourceName = x.resource_name;
        reservation.user = x.user_name;
        reservation.quantity = x.quantity;
        return reservation;
      });
    });
  }
}
