import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { StockService } from '../services/stock.service';
import { QuoteService } from '../services/quote.service';
import { ToastComponent } from '../shared/toast/toast.component';
import { Stock } from '../shared/models/stock.model';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})

export class StocksComponent implements OnInit {

  stock = new Stock();
  stocks: Stock[] = [];
  isLoading = false;
  isEditing = false;

  addStockForm: FormGroup;
  ticker = new FormControl('', Validators.required);
  shares = new FormControl('', Validators.required);
  purchasePrice = new FormControl('', Validators.required);

  constructor(private stockService: StockService,
			  private quoteService: QuoteService,              
			  private auth: AuthService,              
              private router: Router,
              private formBuilder: FormBuilder,
              public toast: ToastComponent) { }

  ngOnInit() {

	if (!this.auth.loggedIn) {
      this.router.navigate(['/']);
    }

    this.getStocks(this.auth.currentUser.username);
			
    this.addStockForm = this.formBuilder.group({
       ticker: this.ticker,
       shares: this.shares,
       purchasePrice: this.purchasePrice
    });
  }

  getlatestPrice(stock: Stock) {
	  	
	this.quoteService.getlatestPrice(stock.ticker).subscribe(
		data => {if (data.latestPrice == "Invalid ticker") {
					alert("Invalid ticker please delete: " + stock.ticker);
				 }
				 else
				 {
					stock.latestPrice = +data.latestPrice;
				    stock.latestTotal = stock.shares * stock.latestPrice;
		            stock.gainloss = stock.latestTotal - stock.purchaseTotal;
				 }}, 
		error => {}, 
        () => {}
	);
  }

  showlatestPrices() {

	for (var i = 0; i < 10; i++) {
		console.log("show prices: " + this.stocks.length);
	}
  }
  
  getStocks(user) {
    this.stockService.getStocks(user).subscribe(
      data => {this.stocks = data; 
	           for (var i = 0; i < this.stocks.length; i++) {
				   console.log(i); 
				   this.getlatestPrice(this.stocks[i]);
			   }},
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  getStock(userstock) {
    this.stockService.getStockByUser(userstock).subscribe(
      data => this.stock = data,
      error => console.log(error),
      () => this.isLoading = false
    );
	
  }

  addStock() {

	var stock = new Stock();

	stock.ticker = this.addStockForm.controls["ticker"].value;
	stock.shares = +this.addStockForm.controls["shares"].value;
	stock.purchasePrice = +this.addStockForm.controls["purchasePrice"].value;
	stock.purchaseTotal = stock.shares * stock.purchasePrice;
	stock.creator = this.auth.currentUser.username;
	
	console.log(stock);	  

	this.quoteService.getlatestPrice(stock.ticker).subscribe(
		data => {if (data.latestPrice == "Invalid ticker") {
					alert("Invalid ticker please change: " + stock.ticker);
				 }
				 else
				 {
					stock.latestPrice = +data.latestPrice;
				    stock.latestTotal = stock.shares * stock.latestPrice;
		            stock.gainloss = stock.latestTotal - stock.purchaseTotal;

					this.stockService.addStock(stock).subscribe(
					  res => {
						this.stocks.push(res);
						this.addStockForm.reset();
						this.toast.setMessage('item added successfully.', 'success');
					  },
					  error => console.log(error)
					);
				  }}, 
		error => {console.log(error)}, 
        () => {}
	);	
  }
  
  enableStockEditing(stock: Stock) {

	console.log("in enableStockEditing: " + stock._id);	  
	console.log("in enableStockEditing: " + stock.ticker);	  
    
	this.isEditing = true;
    this.stock = stock;

	console.log("leaving enableStockEditing: " + this.stock._id);	  
	console.log("leaving enableStockEditing: " + this.stock.ticker);	  
  }

  cancelStockEditing() {

    console.log("in cancelStockEditing: ");	  
    
	this.isEditing = false;
    this.stock = new Stock();
    this.toast.setMessage('item editing cancelled.', 'warning');
    // reload the stocks to reset the editing
    this.getStocks(this.auth.currentUser.username);
  }

  editStock(stock: Stock) {

	stock.ticker = stock.ticker.toUpperCase();
	stock.purchaseTotal = stock.shares * stock.purchasePrice;
	
	this.quoteService.getlatestPrice(stock.ticker).subscribe(
		data => {if (data.latestPrice == "Invalid ticker") {
					alert("Invalid ticker please change: " + stock.ticker);
				 }
				 else
				 {
					stock.latestPrice = +data.latestPrice;
				    stock.latestTotal = stock.shares * stock.latestPrice;
		            stock.gainloss = stock.latestTotal - stock.purchaseTotal;

					this.stockService.editStock(stock).subscribe(
					  () => {
						this.isEditing = false;
						this.stock = stock;
						this.toast.setMessage('item edited successfully.', 'success');
					  },
					  error => console.log(error)
					);
				  }}, 
		error => {console.log(error)}, 
        () => {}
	);	
  }

  deleteStock(stock: Stock) {

	console.log("in delete: " + stock._id);	  

    if (window.confirm('Are you sure you want to permanently delete this item?')) {
      this.stockService.deleteStock(stock).subscribe(
        () => {
          const pos = this.stocks.map(elem => elem._id).indexOf(stock._id);
          this.stocks.splice(pos, 1);
          this.toast.setMessage('item deleted successfully.', 'success');
        },
        error => console.log(error)
      );
    }
  }
}
