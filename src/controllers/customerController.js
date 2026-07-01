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
  console.log('[getCustomer] Request body received:', req.body);

  const customers = readCustomers();
  const customer = customers[0];
  console.log('[getCustomer] Returning first customer:', customer.id);

  res.json({ success: true, data: customer });
};

const updateCustomer = (req, res, next) => {
  console.log('[updateCustomer] Request body received:', req.body);
  const { cnic, ...updates } = req.body;
  console.log('[updateCustomer] Fields to update:', updates);

  const customers = readCustomers();
  const before = { ...customers[0] };
  customers[0] = { ...customers[0], ...updates };
  console.log('[updateCustomer] Before:', before);
  console.log('[updateCustomer] After: ', customers[0]);

  writeCustomers(customers);
  console.log('[updateCustomer] Update complete for customer:', customers[0].id);

  res.json({ success: true, data: customers[0] });
};

module.exports = { getCustomer, updateCustomer };
