import * as mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  ticker: { type: String, required: true, trim: true, uppercase: true },
  shares: { type: Number, required: true, trim: true },
  purchasePrice: { type: Number, required: true, trim: true },
  purchaseTotal: { type: Number, required: true, trim: true },
  latestPrice: { type: Number, required: true, trim: true },
  latestTotal: { type: Number, required: true, trim: true },
  gainloss: { type: Number, required: true, trim: true },
  creator: { type: String, required: true, trim: true }
});

const Stock = mongoose.model('Stock', stockSchema);

export default Stock;
