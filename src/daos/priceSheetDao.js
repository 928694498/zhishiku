const db = require('../database/db');

class PriceSheetDao {
  static create(priceSheet) {
    return new Promise((resolve, reject) => {
      const { channel_id, name, destination_country, volume_weight_factor } = priceSheet;
      db.run(
        'INSERT INTO price_sheets (channel_id, name, destination_country, volume_weight_factor) VALUES (?, ?, ?, ?)',
        [channel_id, name, destination_country, volume_weight_factor || 5000],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...priceSheet, volume_weight_factor: volume_weight_factor || 5000 });
        }
      );
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT ps.*, c.name as channel_name FROM price_sheets ps LEFT JOIN channels c ON ps.channel_id = c.id WHERE ps.status = 1 ORDER BY ps.id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static findByChannelId(channelId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM price_sheets WHERE channel_id = ? AND status = 1', [channelId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM price_sheets WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static addPriceTier(tier) {
    return new Promise((resolve, reject) => {
      const { price_sheet_id, min_weight, max_weight, base_price, price_per_kg, fuel_surcharge } = tier;
      db.run(
        'INSERT INTO price_tiers (price_sheet_id, min_weight, max_weight, base_price, price_per_kg, fuel_surcharge) VALUES (?, ?, ?, ?, ?, ?)',
        [price_sheet_id, min_weight, max_weight, base_price, price_per_kg, fuel_surcharge],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...tier });
        }
      );
    });
  }

  static getPriceTiers(priceSheetId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM price_tiers WHERE price_sheet_id = ? ORDER BY min_weight', [priceSheetId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static addAdditionalFee(fee) {
    return new Promise((resolve, reject) => {
      const { price_sheet_id, channel_id, name, fee_type, amount, percentage } = fee;
      db.run(
        'INSERT INTO additional_fees (price_sheet_id, channel_id, name, fee_type, amount, percentage) VALUES (?, ?, ?, ?, ?, ?)',
        [price_sheet_id, channel_id, name, fee_type, amount, percentage],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...fee });
        }
      );
    });
  }

  static getAdditionalFees(priceSheetId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM additional_fees WHERE price_sheet_id = ?', [priceSheetId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static update(id, priceSheet) {
    return new Promise((resolve, reject) => {
      const { name, destination_country, volume_weight_factor } = priceSheet;
      db.run(
        'UPDATE price_sheets SET name = ?, destination_country = ?, volume_weight_factor = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, destination_country, volume_weight_factor, id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...priceSheet });
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE price_sheets SET status = 0 WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      });
    });
  }
}

module.exports = PriceSheetDao;