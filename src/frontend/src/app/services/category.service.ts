import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {CategoryModel} from '../models/category.model';


const API = 'http://127.0.0.1:8000';

@Injectable({
  providedIn: 'root'
})

export class CategoryService {

  //#region Fields
  //#endregion

  //#region Constructor
  constructor(private httpService: HttpService, private httpClient: HttpClient) {
  }

  //#endregion

  //#region Public Methods
  listCategories() {
    return this.httpClient.get(API + '/categories', {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  listChildCategories(categoryId: number) {
    return this.httpClient.get(API + `/categories/${categoryId}/children`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  listPrimaryCategories() {
    return this.httpClient.get(API + '/categories/primary', {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  createCategory(model: CategoryModel) {
    return this.httpClient.post(API + '/categories', model, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  getCategory(id: number) {
    return this.httpClient.get(API + `/categories/${id}`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  listLeafCategoriesByCategory(categoryId: number) {
    return this.httpClient.get(API + `/category/${categoryId}/leafs`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  listPrimaryLeafCategories() {
    return this.httpClient.get(API + `/category/primary-leafs`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  listAllLeafCategories() {
    return this.httpClient.get(API + `/category/leafs`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }
  //#endregion
}
