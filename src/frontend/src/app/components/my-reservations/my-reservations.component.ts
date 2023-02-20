import { Component, OnInit } from '@angular/core';
import {UserModel} from '../../models/user.model';
import {ConfirmationService, Message, MessageService} from 'primeng/api';
import {AuthenticationService} from '../../services/auth.service';
import {ReservationModel} from '../../models/reservation.model';
import {ReservationsService} from '../../services/reservations.service';

@Component({
  selector: 'app-my-reservations',
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.css']
})
export class MyReservationsComponent implements OnInit {

  reservations: ReservationModel[] = [];
  user: UserModel;

  constructor(private authService: AuthenticationService,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,
              private reservationsService: ReservationsService) { }

  ngOnInit() {
    this.authService.loginUser.subscribe(response => {
      this.user = response;
    });
    this.loadReservations();
  }

  cancelReservation(reservation: ReservationModel) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to cancel this reservation?',
      header: 'Cancel reservation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.reservationsService.cancelReservation(reservation.id).subscribe(_ => {
          this.loadReservations();
          this.messageService.add({severity: 'success', summary: 'Reservation canceled!', life: 3000});
        });
      }
    });
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
        reservation.quantity = x.quantity;
        return reservation;
      });
    });
  }
}
