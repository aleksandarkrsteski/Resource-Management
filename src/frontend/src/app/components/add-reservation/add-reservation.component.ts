import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {ReservationsService} from '../../services/reservations.service';
import {AuthenticationService} from '../../services/auth.service';
import {UserModel} from '../../models/user.model';
import {ReservationModel} from '../../models/reservation.model';
import * as moment from 'moment/moment';
import {Resource} from '../../models/resource.model';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-add-reservation',
  templateUrl: './add-reservation.component.html',
  styleUrls: ['./add-reservation.component.scss']
})
export class AddReservationComponent implements OnInit {

  startTime: any;
  endTime: any;
  name: any;
  user: UserModel;
  resourceId: number;
  quantity: number;
  available: boolean;
  spinner = false;

  constructor(private ref: DynamicDialogRef,
              private config: DynamicDialogConfig,
              private reservationsService: ReservationsService,
              private messageService: MessageService,
              private authenticationService: AuthenticationService) {
    if (this.config.data !== undefined && this.config.data.id) {
      this.resourceId = this.config.data.id;
    }
  }

  ngOnInit() {
    this.authenticationService.loginUser.subscribe(response => {
      this.user = response;
    });
  }

  reserve(): void {
    const reservation = new ReservationModel();
    reservation.userId = this.user.id;
    reservation.fromDate = moment(this.startTime).format('YYYY-MM-DD HH:mm:ss');
    reservation.toDate = moment(this.endTime).format('YYYY-MM-DD HH:mm:ss');
    reservation.resourceId = this.resourceId;
    reservation.quantity = this.quantity;
    this.reservationsService.createReservatgion(reservation).subscribe(_ => {
      this.ref.close({startDate: this.startTime, endDate: this.endTime});
    }, _ => {
      this.ref.close(false);
    });
  }

  testAvailability(): void {
    this.spinner = true;
    const fromDate = moment(this.startTime).format('YYYY-MM-DD HH:mm:ss');
    const toDate = moment(this.endTime).format('YYYY-MM-DD HH:mm:ss');
    this.reservationsService.loadAvailableResourcesNumber(this.resourceId, fromDate, toDate).subscribe((response: Resource) => {
      this.available = response.quantity >= this.quantity;
      this.spinner = false;

      if (this.available) {
        this.messageService.add({severity: 'success',
          summary: 'There are enough instances available for your requested dates!', life: 10000});
      } else {
        this.messageService.add({severity: 'error',
          summary: 'There are not available instances during the specified period.' +
            ' Please check the calendar for more detailed information' +
            ' about reservations', life: 10000});
      }
    });
  }
}
