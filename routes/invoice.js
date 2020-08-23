const express = require("express");
const router = express.Router();

// Load Model
const Invoice = require("../models/invoice");
const Transaction = require("../models/Transaction");
const Vendor = require("../models/vendor");

// Get All Invoices with Transactions & Vendors
router.get("/", async (req, res) => {
  const invoices = await Invoice.find({})
    //    .select("number date amount vendor transactions")
    .populate("transactions vendor") //, "amount date name phone")
    .lean();
  res.render("invoices/list", { invoices, login: true });
  //res.json(invoices);
});

// Show Single Invoice by ID
router.get("/detail/:number", async (req, res) => {
  const invoice = await Invoice.findOne({
    number: req.params.number,
  })
    .populate("transactions vendor")
    .lean();
  res.render("invoices/detail", { invoice, login: true });
  //res.json(invoice);
});

// Make Payment against invoice
router.post("/payments/:number", async (req, res) => {
  const invoice = await Invoice.findOne({ number: req.params.number });
  const transaction = await Transaction.create(req.body);
  invoice.transactions.push(transaction);
  await invoice.save();
  res.redirect(`/invoices/detail/${invoice.number}`);
});

// Create a new Invoice
router.get("/new", async (req, res) => {
  const vendors = await Vendor.find({}).lean();
  res.render("invoices/new", { vendors, login: true });
});

// Create New Invoice
router.post("/new", async (req, res) => {
  const invoice = await Invoice.create({
    number: req.body.number,
    amount: Number(req.body.amount),
    vendor: req.body.vendor,
  });
  res.redirect("/invoices");
});

// Edit Invoice
router.get("/edit/:id", async (req, res) => {
  const vendors = await Vendor.find({}).lean();
  const invoice = await Invoice.findById(req.params.id)
    .populate("vendor")
    .lean();
  res.render("invoices/edit", { invoice, vendors, login: true });
});

// Update Invoice
router.post("/edit/:id", async (req, res) => {
  await Invoice.findByIdAndUpdate(req.params.id, {
    amount: Number(req.body.amount),
    vendor: req.body.vendor,
    date: Date.parse(req.body.date),
  });
  res.redirect("/invoices");
});

// Delete Invoice
router.get("/delete/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (invoice.transactions.length < 1 || invoice.transactions == undefined) {
      await Invoice.findByIdAndDelete(req.params.id);
    } else {
      req.flash(
        "error_msg",
        "This invoice contains payment transactions, please delete transactions to remove the invoice!"
      );
    }
  } catch (error) {
    console.log(error);
  }
  res.redirect("/invoices");
});

// //
// //
// //
// //
// //
// //
// //

// // Find Single Payment by ID
// router.get("/payment/:id", async (req, res) => {
//   const transaction = await Transaction.findById(req.params.id).select(
//     "amount date"
//   );
//   res.json(transaction);
// });

// // Edit Payment by ID
// router.put("/payment/edit/:id", async (req, res) => {
//   await Transaction.findByIdAndUpdate(req.params.id, {
//     amount: req.body.amount,
//   });
//   const transaction = await await Transaction.findById(req.params.id).select(
//     "amount date"
//   );
//   res.json(transaction);
// });

// // Delete Payment via Invoice & via Transaction by ID
// router.delete("/payment/:id", async (req, res) => {
//   await Transaction.findByIdAndDelete(req.params.id);
//   let invoice = await Invoice.findOne({
//     transactions: { $in: req.params.id },
//   });

//   // Remove Invoice.Transaction Array Element
//   const index = invoice.transactions.indexOf(req.params.id);
//   if (index > -1) {
//     invoice.transactions.splice(index, 1);
//   }
//   await invoice.save();

//   res.json(invoice);
// });

module.exports = router;
