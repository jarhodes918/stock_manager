import Stock from '../models/stock';
import BaseCtrl from './base';

export default class StockCtrl extends BaseCtrl {
  model = Stock;

	// Get close quote
	GetCloseQuote = (req, res) => {
			var ticker = req.params.ticker;
			var json;
			var endpoint = 'https://api.iextrading.com/1.0/stock/' + ticker + '/quote';
			var request = require("request");

			request.get(endpoint, (error, response, body) => {
				if (error) { console.log("have error: " + error) }; 
				if (!error) { console.log("no error: " + error) }; 
					json = JSON.parse(body);
					console.log("which one: " + json.close);
					res.status(200).json({ 'CloseQuote': json.close});
			});
	}
  
   // Get Stocks By User
  GetStocksByUser = (req, res) => {
    this.model.find({ creator: req.params.user }, (err, docs) => {
      if (err) { return console.error(err); }
      res.status(200).json(docs);
    });
  }
  // Get id of one stock by user
  GetStockByUser = (req, res) => {
    this.model.findOne({ creator: req.params.userstock.split("-")[0], name: req.params.userstock.split("-")[1] }, (err, item) => {
      if (err) { return console.error(err); }
		return res.status(200).json(item);
    });
  }

  DeleteStockByUser = (req, res) => {
    this.model.remove({ creator: req.params.userstock.split("-")[0], name: req.params.userstock.split("-")[1] }, (err) => {
      if (err) { return console.error(err); }
      res.sendStatus(200);
    });
  }

}
