const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
  },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
  date: {
    type: Date,
    default: Date.now,
  },
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
