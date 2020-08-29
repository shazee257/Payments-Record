const express = require("express");
const router = express.Router();

// Load Models
const Vendor = require("../models/vendor");
const Invoice = require("../models/invoice");
const Transaction = require("../models/transaction");

// Get All Vendors
router.get("/", async (req, res) => {
  const vendors = await Vendor.find({}).lean();
  res.render("vendors/list", {
    vendors,
    login: true,
    title: "All Vendors' List",
  });
});

// GET - New Vendor
router.get("/new", (req, res) => {
  res.render("vendors/new", { login: true, title: "New Vendor" });
});

// POST - New Vendor
router.post("/new", async (req, res) => {
  const vendor = await Vendor.create(req.body);
  res.redirect("/vendors");
});

// GET - Edit Vendor
router.get("/edit/:id", async (req, res) => {
  const vendor = await Vendor.findById(req.params.id).lean();
  res.render("vendors/edit", {
    vendor,
    login: true,
    title: "Edit Vendor Information",
  });
});

// POST - Edit Vendor
router.post("/edit/:id", async (req, res) => {
  await Vendor.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/vendors");
});

// GET - Delete Vendor
router.get("/delete/:id", async (req, res) => {
  let match = false;
  const invoices = await Invoice.find().lean();
  invoices.map((inv) => {
    if (inv.vendor == req.params.id) {
      match = true;
    }
  });
  if (match) {
    req.flash(
      "error_msg",
      "This vendor contains payment invoice(s), please remove invoice(s) to perform this operation!"
    );
  } else {
    await Vendor.findByIdAndDelete(req.params.id);
  }
  res.redirect("/vendors");
});

//
//
//
//
// INVOICE SECTION
//
//
//

// Get All Invoices with Transactions & Vendors
router.get("/invoices", async (req, res) => {
  const invoices = await Invoice.find({ customer: null })
    .select("number amount date vendor")
    .populate("transactions vendor")
    .lean();
  res.render("vendors/invoices/list", {
    invoices,
    login: true,
    title: "All Vendors' Invoices",
  });
});

// Show Single Invoice by ID
router.get("/invoices/detail/:number", async (req, res) => {
  const invoice = await Invoice.findOne({
    number: req.params.number,
  })
    .populate("transactions vendor")
    .lean();
  res.render("vendors/invoices/detail", { invoice, login: true });
});

// Make Payment against invoice
router.post("/invoices/payments/:number", async (req, res) => {
  const invoice = await Invoice.findOne({ number: req.params.number });
  const transaction = await Transaction.create(req.body);
  invoice.transactions.push(transaction);
  await invoice.save();
  res.redirect(`/vendors/invoices/detail/${invoice.number}`);
});

// Create a new Invoice
router.get("/invoices/new", async (req, res) => {
  const vendors = await Vendor.find({}).lean();
  res.render("vendors/invoices/new", {
    vendors,
    login: true,
    title: "Create a new Invoice",
  });
});

// Create New Invoice
router.post("/invoices/new", async (req, res) => {
  const invoice = await Invoice.create(req.body);
  res.redirect("/vendors/invoices");
});

// Edit Invoice
router.get("/invoices/edit/:id", async (req, res) => {
  const vendors = await Vendor.find({}).lean();
  const invoice = await Invoice.findById(req.params.id)
    .populate("vendor")
    .lean();
  res.render("vendors/invoices/edit", {
    invoice,
    vendors,
    login: true,
    title: "Update Invoice",
  });
});

// Update Invoice
router.post("/invoices/edit/:id", async (req, res) => {
  await Invoice.findByIdAndUpdate(req.params.id, {
    amount: Number(req.body.amount),
    vendor: req.body.vendor,
    date: Date.parse(req.body.date),
  });
  res.redirect("/vendors/invoices");
});

// Delete Invoice
router.get("/invoices/delete/:id", async (req, res) => {
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
  res.redirect("/vendors/invoices");
});

//
//
//
//
//

// Get Vendor Invoices
router.get("/invoices/vendor/:id", async (req, res) => {
  const vendor = await Vendor.findById(req.params.id).lean();
  const invoices = await Invoice.find({ vendor: req.params.id })
    .populate("transactions vendor")
    .lean();
  res.render("vendors/invoices/vendor-invoices", {
    invoices,
    login: true,
    title: `Invoices - ${vendor.name}`,
  });
});

// Get - Edit Payment
router.get("/invoices/payment/edit/:id", async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).lean();
  const invoice = await Invoice.findOne({ transactions: req.params.id }).lean();
  res.render("vendors/invoices/edit-payment", {
    number: invoice.number,
    transaction,
    login: true,
  });
});

// Post - Edit Payment
router.post("/invoices/payment/edit/:id", async (req, res) => {
  await Transaction.findByIdAndUpdate(req.params.id, {
    amount: req.body.amount,
    date: Date.parse(req.body.date),
  });
  const invoice = await Invoice.findOne({ transactions: req.params.id }).lean();
  res.redirect(`/vendors/invoices/detail/${invoice.number}`);
});

// Get - Delete  Payment
router.get("/invoices/payment/delete/:id", async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  const invoice = await Invoice.findOne({ transactions: req.params.id });
  //console.log(invoice.transactions);
  const index = invoice.transactions.indexOf(req.params.id);
  if (index > -1) {
    invoice.transactions.splice(index, 1);
  }
  invoice.save();
  res.redirect(`/vendors/invoices/detail/${invoice.number}`);
});

module.exports = router;
