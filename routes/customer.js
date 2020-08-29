const express = require("express");
const router = express.Router();

// Load Models
const Customer = require("../models/customer");
const Invoice = require("../models/invoice");
const Transaction = require("../models/transaction");

// Get All customers
router.get("/", async (req, res) => {
  const customers = await Customer.find().lean();
  res.render("customers/list", {
    customers,
    login: true,
    title: "All Customers' List",
  });
});

// GET - New customer
router.get("/new", (req, res) => {
  res.render("customers/new", { login: true, title: "New Customer" });
});

// POST - New customer
router.post("/new", async (req, res) => {
  const customer = await Customer.create(req.body);
  res.redirect("/customers");
});

// GET - Edit customer
router.get("/edit/:id", async (req, res) => {
  const customer = await Customer.findById(req.params.id).lean();
  res.render("customers/edit", {
    customer,
    login: true,
    title: "Edit Customer Information",
  });
});

// POST - Edit customer
router.post("/edit/:id", async (req, res) => {
  await Customer.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/customers");
});

// GET - Delete customer
router.get("/delete/:id", async (req, res) => {
  let match = false;
  const invoices = await Invoice.find().lean();
  invoices.map((inv) => {
    if (inv.customer == req.params.id) {
      match = true;
    }
  });
  if (match) {
    req.flash(
      "error_msg",
      "This customer contains payment invoice(s), please remove invoice(s) to perform this operation!"
    );
  } else {
    await Customer.findByIdAndDelete(req.params.id);
  }
  res.redirect("/customers");
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
  const invoices = await Invoice.find({ vendor: null })
    .populate("transactions customer")
    .lean();
  res.render("customers/invoices/list", {
    invoices,
    login: true,
    title: "All Customers' Invoices",
  });
});

// Show Single Invoice by ID
router.get("/invoices/detail/:number", async (req, res) => {
  const invoice = await Invoice.findOne({
    number: req.params.number,
  })
    .populate("transactions customer")
    .lean();
  res.render("customers/invoices/detail", { invoice, login: true });
});

// Make Payment against invoice
router.post("/invoices/payments/:number", async (req, res) => {
  const invoice = await Invoice.findOne({ number: req.params.number });
  const transaction = await Transaction.create(req.body);
  invoice.transactions.push(transaction);
  await invoice.save();
  res.redirect(`/customers/invoices/detail/${invoice.number}`);
});

// Create a new Invoice
router.get("/invoices/new", async (req, res) => {
  const customers = await Customer.find({}).lean();
  res.render("customers/invoices/new", {
    customers,
    login: true,
    title: "Create a new Invoice",
  });
});

// Create New Invoice
router.post("/invoices/new", async (req, res) => {
  const invoice = await Invoice.create(req.body);
  res.redirect("/customers/invoices");
});

// Edit Invoice
router.get("/invoices/edit/:id", async (req, res) => {
  const customers = await Customer.find({}).lean();
  const invoice = await Invoice.findById(req.params.id)
    .populate("customer")
    .lean();
  res.render("customers/invoices/edit", {
    invoice,
    customers,
    login: true,
    title: "Update Invoice",
  });
});

// Update Invoice
router.post("/invoices/edit/:id", async (req, res) => {
  await Invoice.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/customers/invoices");
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
  res.redirect("/customers/invoices");
});

//
//
//
//
//
//
//
//
//
// Get Customer Invoices
router.get("/invoices/customer/:id", async (req, res) => {
  const customer = await Customer.findById(req.params.id).lean();
  const invoices = await Invoice.find({ customer: req.params.id })
    .populate("transactions customer")
    .lean();
  res.render("customers/invoices/customer-invoices", {
    invoices,
    login: true,
    title: `Invoices - ${customer.name}`,
  });
});

module.exports = router;
