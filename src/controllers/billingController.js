import { getDatabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

const GST_RATE = parseFloat(process.env.GST_RATE) || 18;
const CURRENCY = process.env.CURRENCY || 'INR';

// Generate invoice number
async function generateInvoiceNumber() {
  const db = await getDatabase();
  const today = moment().format('YYYYMMDD');
  const lastBill = await db.get(
    `SELECT invoiceNumber FROM bills WHERE invoiceNumber LIKE ? ORDER BY createdAt DESC LIMIT 1`,
    [`INV-${today}-%`]
  );

  let sequence = 1;
  if (lastBill) {
    const lastSequence = parseInt(lastBill.invoiceNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `INV-${today}-${String(sequence).padStart(4, '0')}`;
}

// Get all bills
export async function getBills(req, res) {
  try {
    const { status, paymentStatus, customerId } = req.query;
    const db = await getDatabase();

    let query = `SELECT b.*, c.name as customerName, c.phone as customerPhone
                 FROM bills b
                 LEFT JOIN customers c ON b.customerId = c.id
                 WHERE 1=1`;
    const params = [];

    if (status) {
      query += ` AND b.status = ?`;
      params.push(status);
    }

    if (paymentStatus) {
      query += ` AND b.paymentStatus = ?`;
      params.push(paymentStatus);
    }

    if (customerId) {
      query += ` AND b.customerId = ?`;
      params.push(customerId);
    }

    query += ` ORDER BY b.billDate DESC LIMIT 100`;

    const bills = await db.all(query, params);

    res.json({
      success: true,
      count: bills.length,
      data: bills
    });

  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
}

// Get bill by ID with items
export async function getBillById(req, res) {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const bill = await db.get(
      `SELECT b.*, c.name as customerName, c.phone as customerPhone, c.email as customerEmail, c.address as customerAddress
       FROM bills b
       LEFT JOIN customers c ON b.customerId = c.id
       WHERE b.id = ?`,
      [id]
    );

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const items = await db.all(
      `SELECT bi.*, p.name as productName, p.sku, p.hsn
       FROM billItems bi
       LEFT JOIN products p ON bi.productId = p.id
       WHERE bi.billId = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...bill,
        items
      }
    });

  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
}

// Create new bill
export async function createBill(req, res) {
  try {
    const { customerId, items, discountAmount, discountPercentage, notes, paymentMethod } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Customer and bill items are required' });
    }

    const db = await getDatabase();

    // Verify customer exists
    const customer = await db.get('SELECT id FROM customers WHERE id = ?', [customerId]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.quantity * item.unitPrice;
    }

    const calculatedDiscount = discountPercentage ? (subtotal * discountPercentage) / 100 : (discountAmount || 0);
    const taxableAmount = subtotal - calculatedDiscount;
    const taxAmount = (taxableAmount * GST_RATE) / 100;
    const totalAmount = taxableAmount + taxAmount;

    const billId = uuidv4();
    const invoiceNumber = await generateInvoiceNumber();

    await db.run(
      `INSERT INTO bills (id, invoiceNumber, customerId, subtotal, discountAmount, discountPercentage, taxAmount, totalAmount, paymentMethod, notes, createdBy, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [billId, invoiceNumber, customerId, subtotal, calculatedDiscount, discountPercentage || 0, taxAmount, totalAmount, paymentMethod || 'cash', notes || null, req.user.id, 'draft']
    );

    // Insert bill items
    for (const item of items) {
      const itemTotal = item.quantity * item.unitPrice - (item.discount || 0) + (item.tax || 0);

      await db.run(
        `INSERT INTO billItems (id, billId, productId, quantity, unitPrice, discount, tax, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), billId, item.productId, item.quantity, item.unitPrice, item.discount || 0, item.tax || 0, itemTotal]
      );

      // Update product inventory
      await db.run(
        `INSERT INTO inventory (id, productId, quantity, type, reference, notes, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), item.productId, -item.quantity, 'out', billId, `Bill: ${invoiceNumber}`, req.user.id]
      );
    }

    const newBill = await db.get('SELECT * FROM bills WHERE id = ?', [billId]);

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: {
        ...newBill,
        gstRate: GST_RATE,
        currency: CURRENCY
      }
    });

  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ error: 'Failed to create bill' });
  }
}

// Update bill status
export async function updateBillStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, paymentStatus, paidAmount } = req.body;

    const db = await getDatabase();

    const bill = await db.get('SELECT * FROM bills WHERE id = ?', [id]);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    let updateQuery = 'UPDATE bills SET updatedAt = CURRENT_TIMESTAMP';
    const params = [];

    if (status) {
      updateQuery += ', status = ?';
      params.push(status);
    }

    if (paymentStatus) {
      updateQuery += ', paymentStatus = ?';
      params.push(paymentStatus);
    }

    if (paidAmount !== undefined) {
      updateQuery += ', paidAmount = ?';
      params.push(paidAmount);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    await db.run(updateQuery, params);

    const updatedBill = await db.get('SELECT * FROM bills WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Bill updated successfully',
      data: updatedBill
    });

  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ error: 'Failed to update bill' });
  }
}

// Cancel bill
export async function cancelBill(req, res) {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const bill = await db.get('SELECT * FROM bills WHERE id = ?', [id]);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    if (bill.status === 'cancelled') {
      return res.status(400).json({ error: 'Bill is already cancelled' });
    }

    // Restore inventory
    const items = await db.all('SELECT * FROM billItems WHERE billId = ?', [id]);
    for (const item of items) {
      await db.run(
        `INSERT INTO inventory (id, productId, quantity, type, reference, notes, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), item.productId, item.quantity, 'in', id, `Bill cancelled: ${bill.invoiceNumber}`, req.user.id]
      );
    }

    await db.run('UPDATE bills SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', ['cancelled', id]);

    res.json({
      success: true,
      message: 'Bill cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling bill:', error);
    res.status(500).json({ error: 'Failed to cancel bill' });
  }
}

export default {
  getBills,
  getBillById,
  createBill,
  updateBillStatus,
  cancelBill
};
