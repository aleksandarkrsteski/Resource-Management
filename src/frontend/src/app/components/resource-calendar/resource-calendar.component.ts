import {Component, OnDestroy, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {CalendarOptions} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {AddReservationComponent} from '../add-reservation/add-reservation.component';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {MessageService} from 'primeng/api';
import {ResourcesService} from '../../services/resources.service';
import {CategoryService} from '../../services/category.service';
import {FullCalendarComponent} from '@fullcalendar/angular';
import {ReservationsService} from '../../services/reservations.service';
import * as moment from 'moment';
import * as R from 'ramda';
import {timeout} from 'rxjs/operators';
import {AuthenticationService} from '../../services/auth.service';
import {UserModel} from '../../models/user.model';


@Component({
  selector: 'app-resource-calendar',
  templateUrl: './resource-calendar.component.html',
  styleUrls: ['./resource-calendar.component.css']
})
export class ResourceCalendarComponent implements OnInit, OnDestroy {

  @ViewChild(FullCalendarComponent, {static: false}) calendar: FullCalendarComponent;
  resourceId: number;
  spinner = false;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialDate: new Date(),
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'today,dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true
  };
  showCalendar = true;
  user: UserModel;

  constructor(private ref: DynamicDialogRef,
              private config: DynamicDialogConfig,
              public dialogService: DialogService,
              public messageService: MessageService,
              private reservatoinsService: ReservationsService,
              public resourcesService: ResourcesService,
              private categoryService: CategoryService,
              private authenticationService: AuthenticationService) {
    if (this.config.data !== undefined && this.config.data.resourceId) {
      this.resourceId = this.config.data.resourceId;
    }
  }

  ngOnInit() {
    this.authenticationService.loginUser.subscribe(response => {
      this.user = response;
    });
    // Get the current date
    const today = new Date();

    const endOfMonth = moment(today).add(7, 'months').endOf('month').format('YYYY-MM-DD HH:mm:ss');
    const startOfMonth = moment(today).add(-1, 'months').startOf('month').format('YYYY-MM-DD HH:mm:ss');

    this.loadReservationsForResource(startOfMonth, endOfMonth);
  }

  openDialog() {
    const ref = this.dialogService.open(AddReservationComponent, {
      data: {
        id: this.resourceId
      },
      header: 'Reserve a Resource',
      width: '500px',
      styleClass: 'calendar'
    });

    ref.onClose.subscribe((item: any) => {
      if (item) {
        this.calendar.getApi().gotoDate(item.startDate);
        this.calendar.getApi().addEvent({title: 'New reservation', start: item.startDate, end: item.endDate});
        this.calendar.getApi().render();
        this.messageService.add({severity: 'success', summary: 'Reservation successful!', life: 3000});
      }
    });
  }

  private loadReservationsForResource(fromDate, toDate) {
    this.reservatoinsService.loadReservationsPerResource(this.resourceId, fromDate, toDate).subscribe((res: any[]) => {
      this.calendar.getApi().destroy();
      res.forEach((x, index) => {
        const event = {title: 'Occupied ' + (index + 1), start: moment(x.from_date).toDate(), end: moment(x.to_date).toDate()};
        this.calendar.getApi().addEvent(event);

      });
      this.reservatoinsService.loadAvailableResourcesNumber(this.resourceId, fromDate, toDate).subscribe(response => {
        this.spinner = true;
        setTimeout(() => {
          this.showCalendar = true;
          this.calendar.getApi().render();
          this.spinner = false;
        }, 1000);
      });

    }, error => {
      this.spinner = false;
    });

  }

  ngOnDestroy() {
  }
}
