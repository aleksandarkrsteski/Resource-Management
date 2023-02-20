import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {ReservationModel} from '../models/reservation.model';


const API = 'http://127.0.0.1:8000';

@Injectable({
  providedIn: 'root'
})

export class ReservationsService {

  //#region Fields
  //#endregion

  //#region Constructor
  constructor(private httpService: HttpService, private httpClient: HttpClient) {
  }

  //#endregion

  //#region Public Methods
  loadReservationsPerResource(resourceId: number, fromDate, toDate) {
    return this.httpClient.get(API + '/reservations/resource/' + resourceId + '?from_date=' + fromDate + '&to_date=' + toDate, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  loadAvailableResourcesNumber(resourceId: number, fromDate, toDate) {
    return this.httpClient.get(API + '/resources/' + resourceId + '/availability' +
      '?from_date=' + fromDate + '&to_date=' + toDate, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  createReservatgion(model: ReservationModel) {
    const request: any = {};
    request.user_id = model.userId;
    request.resource_id = model.resourceId;
    request.from_date = model.fromDate;
    request.to_date = model.toDate;
    request.status = 'PENDING';
    request.quantity = model.quantity;

    return this.httpClient.post(API + '/reservations', request, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  loadAllReservations() {
    return this.httpClient.get(API + '/reservations/', {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  cancelReservation(id: number) {
    return this.httpClient.delete(API + '/reservations/' + id, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }
}
