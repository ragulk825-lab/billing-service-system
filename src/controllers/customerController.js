import { getDatabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get all customers
export async function getCustomers(req, res) {
  try {
    const db = await getDatabase();
    const customers = await db.all(
      `SELECT id, name, phone, email, alternatePhone, address, city, state, pincode, gstin, outstandingBalance, status, createdAt
       FROM customers WHERE status = 'active' ORDER BY name ASC`
    );

    res.json({
      success: true,
      count: customers.length,
      data: customers
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
}

// Get customer by ID
export async function getCustomerById(req, res) {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
}

// Create new customer
export async function createCustomer(req, res) {
  try {
    const { name, phone, email, alternatePhone, address, city, state, pincode, gstin } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const db = await getDatabase();

    // Check if customer with this phone already exists
    const existingCustomer = await db.get('SELECT id FROM customers WHERE phone = ?', [phone]);
    if (existingCustomer) {
      return res.status(409).json({ error: 'Customer with this phone number already exists' });
    }

    const customerId = uuidv4();

    await db.run(
      `INSERT INTO customers (id, name, phone, email, alternatePhone, address, city, state, pincode, gstin, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customerId, name, phone, email || null, alternatePhone || null, address || null, city || null, state || null, pincode || null, gstin || null, 'active']
    );

    const newCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [customerId]);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: newCustomer
    });

  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
}

// Update customer
export async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, email, alternatePhone, address, city, state, pincode, gstin, outstandingBalance } = req.body;

    const db = await getDatabase();

    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if new phone is unique
    if (phone && phone !== customer.phone) {
      const existingCustomer = await db.get('SELECT id FROM customers WHERE phone = ? AND id != ?', [phone, id]);
      if (existingCustomer) {
        return res.status(409).json({ error: 'Phone number already exists for another customer' });
      }
    }

    await db.run(
      `UPDATE customers SET name = ?, phone = ?, email = ?, alternatePhone = ?, address = ?, city = ?, state = ?, pincode = ?, gstin = ?, outstandingBalance = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name || customer.name,
        phone || customer.phone,
        email !== undefined ? email : customer.email,
        alternatePhone !== undefined ? alternatePhone : customer.alternatePhone,
        address !== undefined ? address : customer.address,
        city !== undefined ? city : customer.city,
        state !== undefined ? state : customer.state,
        pincode !== undefined ? pincode : customer.pincode,
        gstin !== undefined ? gstin : customer.gstin,
        outstandingBalance !== undefined ? outstandingBalance : customer.outstandingBalance,
        id
      ]
    );

    const updatedCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: updatedCustomer
    });

  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
}

// Delete customer
export async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Mark as inactive instead of hard delete
    await db.run('UPDATE customers SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', ['inactive', id]);

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
}

// Search customers
export async function searchCustomers(req, res) {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const db = await getDatabase();
    const searchTerm = `%${query}%`;

    const customers = await db.all(
      `SELECT * FROM customers WHERE (name LIKE ? OR phone LIKE ? OR email LIKE ?) AND status = 'active'
       ORDER BY name ASC LIMIT 20`,
      [searchTerm, searchTerm, searchTerm]
    );

    res.json({
      success: true,
      count: customers.length,
      data: customers
    });

  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ error: 'Failed to search customers' });
  }
}

// Get customer billing history
export async function getCustomerBillingHistory(req, res) {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const customer = await db.get('SELECT id FROM customers WHERE id = ?', [id]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const bills = await db.all(
      `SELECT id, invoiceNumber, billDate, subtotal, discountAmount, taxAmount, totalAmount, paidAmount, paymentStatus
       FROM bills WHERE customerId = ? AND status != 'cancelled' ORDER BY billDate DESC LIMIT 50`,
      [id]
    );

    res.json({
      success: true,
      count: bills.length,
      data: bills
    });

  } catch (error) {
    console.error('Error fetching billing history:', error);
    res.status(500).json({ error: 'Failed to fetch billing history' });
  }
}

// Get customer service history
export async function getCustomerServiceHistory(req, res) {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const customer = await db.get('SELECT id FROM customers WHERE id = ?', [id]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const services = await db.all(
      `SELECT id, serviceId, deviceType, serialNumber, problemDescription, status, createdAt
       FROM services WHERE customerId = ? ORDER BY createdAt DESC LIMIT 50`,
      [id]
    );

    res.json({
      success: true,
      count: services.length,
      data: services
    });

  } catch (error) {
    console.error('Error fetching service history:', error);
    res.status(500).json({ error: 'Failed to fetch service history' });
  }
}

export default {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getCustomerBillingHistory,
  getCustomerServiceHistory
};
