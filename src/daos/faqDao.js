const db = require('../database/db');

class FaqDao {
  static create(faq) {
    return new Promise((resolve, reject) => {
      const { question, answer, category, keywords } = faq;
      db.run(
        'INSERT INTO faq (question, answer, category, keywords) VALUES (?, ?, ?, ?)',
        [question, answer, category, keywords],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...faq });
        }
      );
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM faq WHERE status = 1 AND is_archived = 0 ORDER BY id DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static search(query) {
    return new Promise((resolve, reject) => {
      const searchTerm = `%${query}%`;
      db.all(
        'SELECT * FROM faq WHERE status = 1 AND is_archived = 0 AND (question LIKE ? OR answer LIKE ? OR keywords LIKE ?)',
        [searchTerm, searchTerm, searchTerm],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM faq WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static update(id, faq) {
    return new Promise((resolve, reject) => {
      const { question, answer, category, keywords } = faq;
      db.run(
        'UPDATE faq SET question = ?, answer = ?, category = ?, keywords = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [question, answer, category, keywords, id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...faq });
        }
      );
    });
  }

  static archive(id) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE faq SET is_archived = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE faq SET status = 0 WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      });
    });
  }
}

module.exports = FaqDao;