import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { RequestOptionsArgs } from '@angular/http';

@Injectable()
export class QuoteService {

  constructor(private http: Http) { }

  getCloseQuote(ticker: String) {
	var endpoint = "/api/close/quote/" + ticker;
		
	console.log(endpoint);

	return this.http.get(endpoint).map(response => response.json());
  }
}
