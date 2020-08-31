const moment = require("moment");

module.exports = {
  formatDate: (date, format) => {
    return moment(date).format(format);
  },
  // Paid Amount per Invoice
  invoicePaidAmount: (invoice) => {
    let paid = 0;
    invoice.transactions.map((item) => {
      paid += item.amount;
    });
    return paid;
  },
  // Due Amount per Invoice
  invoiceDueAmount: (invoice) => {
    let paid = 0;
    invoice.transactions.map((item) => {
      paid += item.amount;
    });
    return invoice.amount - paid;
  },
  // Total Invoices Amount
  invoicesAmount: (invoices) => {
    let paid = 0;
    invoices.map((item) => {
      paid += item.amount;
    });
    return paid;
  },
  // Total Paid Amount
  invoicesPaidAmount: (invoices) => {
    let paid = 0;
    invoices.map((inv) => {
      inv.transactions.map((item) => {
        paid += item.amount;
      });
    });
    return paid;
  },
  // Total Balance Amount
  invoicesDueAmount: (invoices) => {
    let paid = 0;
    let invoicesAmount = 0;
    invoices.map((inv) => {
      invoicesAmount += inv.amount;
      inv.transactions.map((item) => {
        paid += item.amount;
      });
    });
    return invoicesAmount - paid;
  },
  selectedVendor: (id, id2) => {
    if (id.toString() === id2.toString()) {
      return `selected`;
    }
  },
  // Select Public Private auto on edit form
  select: (selected, options) => {
    return options
      .fn(this)
      .replace(
        new RegExp(' value="' + selected + '"'),
        '$& selected="selected"'
      )
      .replace(
        new RegExp(">" + selected + "</option>"),
        ' selected="selected"$&'
      );
  },
};
