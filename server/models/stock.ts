import * as mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  ticker: { type: String, required: true, trim: true },
  shares: { type: Number, required: true, trim: true },
  pprice: { type: Number, required: true, trim: true },
  ptotal: { type: Number, required: true, trim: true },
  nprice: { type: Number, required: true, trim: true },
  ntotal: { type: Number, required: true, trim: true },
  gainloss: { type: Number, required: true, trim: true },
  creator: { type: String, required: true, trim: true }
});

const Stock = mongoose.model('Stock', stockSchema);

export default Stock;
