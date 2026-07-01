const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

const DATA_PATH = path.join(__dirname, '../../data/customers.json');

const readCustomers = () => {
  console.log('[customerController] Reading customers from:', DATA_PATH);
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  console.log('[customerController] Total customers loaded:', data.length);
  return data;
};

const writeCustomers = (data) => {
  console.log('[customerController] Writing', data.length, 'customers to:', DATA_PATH);
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  console.log('[customerController] Write successful');
};

const getCustomer = (req, res, next) => {
  console.log('[getCustomer] Query params received:', req.query);
  const { cnic } = req.query;
  console.log('[getCustomer] Extracted CNIC:', cnic);

  const customers = readCustomers();
  const customer = customers.find((c) => c.cnic === cnic);
  console.log('[getCustomer] Match found:', customer ? `yes (id: ${customer.id})` : 'no');

  if (!customer) {
    console.log('[getCustomer] No customer found for CNIC:', cnic, '— returning 404');
    return next(new AppError(`Customer with CNIC ${cnic} not found`, 404));
  }

  console.log('[getCustomer] Returning customer:', customer.id);
  res.json({ success: true, data: customer });
};

const updateCustomer = (req, res, next) => {
  console.log('[updateCustomer] Query params received:', req.query);
  console.log('[updateCustomer] Request body received:', req.body);
  const { cnic } = req.query;
  console.log('[updateCustomer] Extracted CNIC:', cnic);

  const customers = readCustomers();
  const index = customers.findIndex((c) => c.cnic === cnic);
  console.log('[updateCustomer] Customer index in array:', index);

  if (index === -1) {
    console.log('[updateCustomer] No customer found for CNIC:', cnic, '— returning 404');
    return next(new AppError(`Customer with CNIC ${cnic} not found`, 404));
  }

  const before = { ...customers[index] };
  customers[index] = { ...customers[index], ...req.body };
  console.log('[updateCustomer] Fields changed:', Object.keys(req.body));
  console.log('[updateCustomer] Before:', before);
  console.log('[updateCustomer] After: ', customers[index]);

  writeCustomers(customers);
  console.log('[updateCustomer] Update complete for customer:', customers[index].id);

  res.json({ success: true, data: customers[index] });
};

module.exports = { getCustomer, updateCustomer };
