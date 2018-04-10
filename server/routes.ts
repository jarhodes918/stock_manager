import * as express from 'express';

import StockCtrl from './controllers/stock';
import UserCtrl from './controllers/user';
import Stock from './models/stock';
import User from './models/user';
 
export default function setRoutes(app) {

  const router = express.Router();

  const stockCtrl = new StockCtrl();
  const userCtrl = new UserCtrl();
  
  // Stock
  router.route('/stocks').get(stockCtrl.getAll);
  router.route('/stocks/count').get(stockCtrl.count);
  router.route('/stock').post(stockCtrl.insert);
  router.route('/stock/:id').get(stockCtrl.get);
  router.route('/stock/:id').put(stockCtrl.update);
  router.route('/stock/:id').delete(stockCtrl.delete);
  router.route('/stocks/:user').get(stockCtrl.GetStocksByUser);
  router.route('/stock/delete/:userstock').delete(stockCtrl.DeleteStockByUser);
  router.route('/stock/get/:userstock').get(stockCtrl.GetStockByUser);

  // Close Quote
  router.route('/close/quote/:ticker').get(stockCtrl.GetCloseQuote);

  // Users
  router.route('/login').post(userCtrl.login);
  router.route('/users').get(userCtrl.getAll);
  router.route('/users/count').get(userCtrl.count);
  router.route('/user').post(userCtrl.insert);
  router.route('/user/:id').get(userCtrl.get);
  router.route('/user/:id').put(userCtrl.update);
  router.route('/user/:id').delete(userCtrl.delete);

  // Set parameter
  //app.param('user',domainCtrl.DomainByUser);

  // Set parameter
  //app.param('userdomain',credentialCtrl.CredentialsByDomainUser);
  
  // Apply the routes to our application with the prefix /api
  app.use('/api', router);

}
