import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Resource} from '../models/resource.model';


const API = 'http://127.0.0.1:8000';

@Injectable({
  providedIn: 'root'
})

export class ResourcesService {

  constructor(private httpService: HttpService, private httpClient: HttpClient) {
  }

  listResources() {
    return this.httpClient.get(API + '/resources', {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  listResourcesByCategory(categoryId: number) {
    return this.httpClient.get(API + `/category/${categoryId}/resources`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  createResource(model: Resource) {
    return this.httpClient.post(API + '/resources', model, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  updateResource(model: Resource) {
    return this.httpClient.put(API + '/resources/' + model.id, model, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  deleteResource(id: number) {
    return this.httpClient.delete(API + '/resources/' + id, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }
}
