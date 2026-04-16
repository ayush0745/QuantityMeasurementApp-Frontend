import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quantity, ConvertResponse, HistoryItem } from '../../shared/models/quantity.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QuantityService {
  private base = `${environment.apiBase}/quantity`;

  constructor(private http: HttpClient) {}

  convert(from: Quantity, targetUnit: string): Observable<ConvertResponse> {
    return this.http.post<ConvertResponse>(`${this.base}/convert`, from, {
      params: new HttpParams().set('targetUnit', targetUnit)
    });
  }

  compare(q1: Quantity, q2: Quantity): Observable<boolean> {
    return this.http.post<boolean>(`${this.base}/compare`, { thisQuantity: q1, thatQuantity: q2 });
  }

  add(q1: Quantity, q2: Quantity): Observable<ConvertResponse> {
    return this.http.post<ConvertResponse>(`${this.base}/add`, { thisQuantity: q1, thatQuantity: q2 });
  }

  subtract(q1: Quantity, q2: Quantity): Observable<ConvertResponse> {
    return this.http.post<ConvertResponse>(`${this.base}/subtract`, { thisQuantity: q1, thatQuantity: q2 });
  }

  divide(q1: Quantity, q2: Quantity): Observable<number> {
    return this.http.post<number>(`${this.base}/divide`, { thisQuantity: q1, thatQuantity: q2 });
  }

  getHistory(): Observable<HistoryItem[]> {
    return this.http.get<HistoryItem[]>(`${this.base}/history`);
  }
}
