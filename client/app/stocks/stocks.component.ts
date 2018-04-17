import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { StockService } from '../services/stock.service';
import { QuoteService } from '../services/quote.service';
import { ToastComponent } from '../shared/toast/toast.component';
import { Stock } from '../shared/models/stock.model';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Shape from 'd3-shape';
import * as d3Zoom from 'd3-zoom';
import * as d3Brush from 'd3-brush';
import * as d3TimeFormat from 'd3-time-format';
import * as d3Color from 'd3-color';

import { STATISTICS } from '../shared/data';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})

export class StocksComponent implements OnInit {

  private width: number;
  private height: number;
  private margin = {top: 20, right: 20, bottom: 30, left: 75};

  private x: any;
  private y: any;
  private svg: any;
  private g: any;

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

  showchart(chartdata) {  
	
	this.initSvg();
	this.initAxis(chartdata);
	this.drawAxis();
	this.drawBars(chartdata);	
  }  

  private initSvg() {
    this.svg = d3.select("svg");
    this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = +this.svg.attr("height") - this.margin.top - this.margin.bottom;
    this.g = this.svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
  }

  private initAxis(chartdata) {
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.4);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    this.x.domain(chartdata.map((d) => d.ticker));
    this.y.domain([0, d3Array.max(chartdata, (d) => d.total)]);
  }

  private drawAxis() {
    this.g.append("g")
          .attr("transform", "translate(0," + this.height + ")")
          .call(d3Axis.axisBottom(this.x));
    this.g.append("g")
          .call(d3Axis.axisLeft(this.y))
  }

  private drawBars(chartdata) {
    this.g.selectAll(".bar")
          .data(chartdata)
          .enter().append("rect")
          .attr("x", (d) => this.x(d.ticker) )
          .attr("y", (d) => this.y(d.total) )
          .attr("width", this.x.bandwidth() - 0)
          .attr("height", (d) => this.height - this.y(d.total) )
		  .attr("fill", (d) => {if (d.ticker.substring(d.ticker.length-1) == "y") { return "blue"} else { return "red"};} );
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
  
  getStocks(user) {
    this.stockService.getStocks(user).subscribe(
      data => {this.stocks = data; 
	           for (var i = 0; i < this.stocks.length; i++) {
				   this.getlatestPrice(this.stocks[i]);
			   }
				var chartdata = [];
				
				for (var i = 0; i < this.stocks.length; i++) {
					chartdata.push({ticker: i+1 + " " + this.stocks[i].ticker + "_Buy", total: this.stocks[i].purchaseTotal});
					chartdata.push({ticker: i+1 + " " + this.stocks[i].ticker + "_Now", total: this.stocks[i].latestTotal});
				}
				
				this.showchart(chartdata);
			   },
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
						this.getStocks(this.auth.currentUser.username);
					  },
					  error => console.log(error)
					);
				  }}, 
		error => {console.log(error)}, 
        () => {}
	);	
  }
  
  enableStockEditing(stock: Stock) {
	  
	this.isEditing = true;
    this.stock = stock;
  }

  cancelStockEditing() {
    
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
						this.getStocks(this.auth.currentUser.username);
					  },
					  error => console.log(error)
					);
				  }}, 
		error => {console.log(error)}, 
        () => {}
	);	
  }

  deleteStock(stock: Stock) {

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
