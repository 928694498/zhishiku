const db = require('../database/db');

class OperationGuideDao {
  static create(guide) {
    return new Promise((resolve, reject) => {
      const { channel_id, title, step_order, content, contact_person, contact_info } = guide;
      db.run(
        'INSERT INTO operation_guides (channel_id, title, step_order, content, contact_person, contact_info) VALUES (?, ?, ?, ?, ?, ?)',
        [channel_id, title, step_order, content, contact_person, contact_info],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...guide });
        }
      );
    });
  }

  static findByChannelId(channelId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM operation_guides WHERE channel_id = ? ORDER BY step_order', [channelId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT og.*, c.name as channel_name FROM operation_guides og LEFT JOIN channels c ON og.channel_id = c.id ORDER BY og.channel_id, og.step_order', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM operation_guides WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static update(id, guide) {
    return new Promise((resolve, reject) => {
      const { title, step_order, content, contact_person, contact_info } = guide;
      db.run(
        'UPDATE operation_guides SET title = ?, step_order = ?, content = ?, contact_person = ?, contact_info = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, step_order, content, contact_person, contact_info, id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...guide });
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM operation_guides WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      });
    });
  }
}

module.exports = OperationGuideDao;