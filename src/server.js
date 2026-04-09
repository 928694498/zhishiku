const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ success: true, message: '国际物流知识库系统运行正常', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`管理后台: http://localhost:${PORT}/`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
  console.log(`API文档: /api/*`);
});

module.exports = app;