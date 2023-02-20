import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})

export class HttpService {

  //#region Constructor
  constructor(private httpClient: HttpClient) {
  }
  //#endregion

  //#region Public Methods
  public httpPost(url: string, model?: any) {
    return this.httpClient.post<any>(`${url}`, model, {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
        .set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }

  public httpGet(url: string) {
    return this.httpClient.get<any>(url, {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
        .set('Authorization', `Bearer ${localStorage.getItem('access_token') as string}`)
    })
      .pipe(map(resposne => {
        return resposne;
      }));
  }
  //#endregion
}
