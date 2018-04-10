import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Stock } from '../shared/models/stock.model';

@Injectable()
export class StockService {

  constructor(private http: HttpClient) { }

  getStocks(user): Observable<Stock[]> {
    return this.http.get<Stock[]>('/api/stocks/' + user);
  }

  countStocks(): Observable<number> {
    return this.http.get<number>('/api/stocks/count');
  }

  addStock(stock: Stock): Observable<Stock> {
    return this.http.post<Stock>('/api/stock', stock);
  }

  getStock(stock: Stock): Observable<Stock> {
    return this.http.get<Stock>(`/api/stock/${stock._id}`);
  }

  getStockByUser(userstock): Observable<Stock> {
    return this.http.get<Stock>('/api/stock/get/' + userstock);
  }

  editStock(stock: Stock): Observable<string> {
    return this.http.put(`/api/stock/${stock._id}`, stock, { responseType: 'text' });
  }

  deleteStock(stock: Stock): Observable<string> {
    return this.http.delete(`/api/stock/${stock._id}`, { responseType: 'text' });
  }
}
