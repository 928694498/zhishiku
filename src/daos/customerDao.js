const db = require('../database/db');

class CustomerDao {
  static create(customer) {
    return new Promise((resolve, reject) => {
      const { name, company, customer_type, contact_person, contact_phone, contact_email } = customer;
      db.run(
        'INSERT INTO customers (name, company, customer_type, contact_person, contact_phone, contact_email) VALUES (?, ?, ?, ?, ?, ?)',
        [name, company, customer_type, contact_person, contact_phone, contact_email],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...customer });
        }
      );
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM customers WHERE status = 1 ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM customers WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static addChannelMapping(mapping) {
    return new Promise((resolve, reject) => {
      const { customer_id, channel_id, priority, notes } = mapping;
      db.run(
        'INSERT INTO customer_channel_mapping (customer_id, channel_id, priority, notes) VALUES (?, ?, ?, ?)',
        [customer_id, channel_id, priority, notes],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...mapping });
        }
      );
    });
  }

  static getCustomerChannels(customerId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT ccm.*, c.name as channel_name, c.code as channel_code 
         FROM customer_channel_mapping ccm 
         LEFT JOIN channels c ON ccm.channel_id = c.id 
         WHERE ccm.customer_id = ? 
         ORDER BY ccm.priority DESC`,
        [customerId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE customers SET status = 0 WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      });
    });
  }
}

module.exports = CustomerDao;