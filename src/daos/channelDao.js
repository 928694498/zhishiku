const db = require('../database/db');

class ChannelDao {
  static create(channel) {
    return new Promise((resolve, reject) => {
      const { name, code, description } = channel;
      db.run(
        'INSERT INTO channels (name, code, description) VALUES (?, ?, ?)',
        [name, code, description],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...channel });
        }
      );
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM channels WHERE status = 1 ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM channels WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static update(id, channel) {
    return new Promise((resolve, reject) => {
      const { name, code, description } = channel;
      db.run(
        'UPDATE channels SET name = ?, code = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, code, description, id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...channel });
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE channels SET status = 0 WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      });
    });
  }
}

module.exports = ChannelDao;