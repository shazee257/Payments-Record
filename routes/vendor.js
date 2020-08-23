const express = require("express");
const router = express.Router();

// Vendor Model
const Vendor = require("../models/vendor");

// Get All Vendors
router.get("/", async (req, res) => {
  const vendors = await Vendor.find({}).lean();
  res.render("vendors/list", { vendors, login: true });
});

// New Vendor
router.get("/new", (req, res) => {
  res.render("vendors/new", { login: true });
});

// Create New Vendor
router.post("/new", async (req, res) => {
  const vendor = await Vendor.create(req.body);
  res.redirect("/");
});

//
//
//
//
//
//

// Show Vendor by id
router.get("/:id", async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  res.json(vendor);
});

// Update vendor
router.put("/update/:id", async (req, res) => {
  await Vendor.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    description: req.body.description,
    address: req.body.address,
    phone: req.body.phone,
  });
  const updatedVendor = await Vendor.findById(req.params.id);
  res.json(updatedVendor);
});

// Delete Vendor
router.delete("/delete/:id", async (req, res) => {
  const vendor = await Vendor.findByIdAndDelete(req.params.id);
  console.log(vendor);
  res.json(`${vendor.name} is deleted successfully.`);
});

module.exports = router;
