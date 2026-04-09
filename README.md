# 国际物流知识库系统

一款功能完整的国际物流知识库系统，支持通过 API 或 MCP 模式与企业微信智能机器人对接，提供知识查询、业务操作指引及报价计算功能。

## 功能特性

### 1. Web 管理界面
- 美观的图形化管理界面
- 支持所有功能的可视化操作
- 运费计算器直观易用
- 响应式设计，支持移动端

### 2. 物流渠道管理
- 支持添加、编辑、删除物流渠道
- 管理渠道代码、描述等基本信息

### 2. 报价计算系统
- 支持添加国际物流渠道报价单
- **自定义体积重系数** - 每个报价单可独立设置体积重计算公式（长×宽×高/系数）
- 自动计算体积重和计费重量（取实际重量与体积重较大值）
- 支持阶梯价格、燃油附加费、自定义附加费

### 3. 客户匹配管理
- 录入客户信息及类型
- 为客户关联适配的物流产品/渠道
- 支持优先级设置，实现精准匹配指引

### 4. 操作指引管理
- 详细录入各物流渠道全流程操作
- 包含走价备案、下单、贴标、订仓等步骤
- 支持对接人信息管理

### 5. 自定义问答系统
- 支持添加、修改、归档国际物流相关知识问答
- 支持关键词搜索
- 支持分类管理

### 6. 多模式对接
- REST API 接口
- MCP (Model Context Protocol) 服务
- 企业微信智能机器人对接示例

## 项目结构

```
zhishiku/
├── src/
│   ├── server.js              # 主服务器入口
│   ├── mcp-server.js          # MCP 服务入口
│   ├── wecom-bot.js           # 企业微信机器人客户端
│   ├── database/
│   │   └── db.js              # 数据库连接和初始化
│   ├── daos/                  # 数据访问层
│   │   ├── channelDao.js
│   │   ├── priceSheetDao.js
│   │   ├── customerDao.js
│   │   ├── operationGuideDao.js
│   │   └── faqDao.js
│   ├── services/              # 业务逻辑层
│   │   └── pricingService.js  # 报价计算服务
│   └── routes/
│       └── api.js             # API 路由
├── scripts/
│   └── init-data.js           # 示例数据初始化脚本
├── data/                      # 数据库文件目录（自动创建）
├── package.json
├── mcp-server.json           # MCP 配置
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化示例数据（可选）

```bash
npm run init-data
```

### 3. 启动服务器

```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

### 4. 访问管理后台

打开浏览器访问：`http://localhost:3000/`

### 5. 健康检查

访问 `http://localhost:3000/health` 确认服务正常运行。

## API 接口文档

### 物流渠道

- `GET /api/channels` - 获取所有渠道
- `POST /api/channels` - 创建新渠道

### 报价单

- `GET /api/price-sheets` - 获取所有报价单
- `POST /api/price-sheets` - 创建报价单（可设置 volume_weight_factor，默认5000）
- `PUT /api/price-sheets/:id` - 更新报价单（支持修改体积重系数）
- `GET /api/price-sheets/:id/tiers` - 获取价格区间
- `POST /api/price-sheets/:id/tiers` - 添加价格区间
- `POST /api/price-sheets/:id/fees` - 添加附加费
- `POST /api/pricing/calculate` - 计算报价

**创建报价单请求示例：**
```json
{
  "channel_id": 1,
  "name": "DHL-美国报价单",
  "destination_country": "美国",
  "volume_weight_factor": 5000
}
```

**报价计算请求示例：**
```json
{
  "price_sheet_id": 1,
  "actual_weight": 2.5,
  "length": 30,
  "width": 20,
  "height": 15
}
```

### 客户管理

- `GET /api/customers` - 获取所有客户
- `POST /api/customers` - 创建客户
- `GET /api/customers/:id/channels` - 获取客户适配渠道
- `POST /api/customers/:id/channels` - 关联客户与渠道

### 操作指引

- `GET /api/operation-guides` - 获取所有操作指引
- `GET /api/channels/:id/operation-guides` - 获取指定渠道的操作指引
- `POST /api/operation-guides` - 创建操作指引

### 问答管理

- `GET /api/faq` - 获取所有问答（支持 ?q=关键词 搜索）
- `POST /api/faq` - 添加问答
- `PUT /api/faq/:id` - 修改问答
- `POST /api/faq/:id/archive` - 归档问答

## MCP 服务

本项目提供 MCP (Model Context Protocol) 服务，可与支持 MCP 的 AI 助手集成。

### MCP 工具列表

- `list_channels` - 获取所有可用的物流渠道
- `list_price_sheets` - 获取所有报价单
- `calculate_price` - 计算物流费用
- `list_customers` - 获取所有客户信息
- `get_customer_channels` - 获取指定客户的适配渠道
- `get_operation_guides` - 获取指定渠道的操作指引
- `search_faq` - 搜索知识库问答
- `list_faq` - 获取所有问答列表

### 配置 MCP

将 `mcp-server.json` 中的配置添加到您的 MCP 客户端配置文件中。

## 企业微信智能机器人对接

项目包含企业微信机器人客户端示例，支持以下指令：

- `渠道` 或 `channel` - 查看可用渠道
- `报价单` 或 `price` - 查看可用报价单
- `算价 <报价单ID> <实际重量(kg)> <长(cm)> <宽(cm)> <高(cm)>` - 计算运费
- `指引 <渠道ID>` - 查看操作指引
- `客户渠道 <客户ID>` - 查看客户适配渠道
- 直接发送问题 - 自动搜索知识库

### 使用示例

```javascript
const WeComBotClient = require('./src/wecom-bot');

const bot = new WeComBotClient();

async function example() {
  const response = await bot.handleMessage('算价 1 2.5 30 20 15');
  console.log(response);
  
  const faqResponse = await bot.handleMessage('体积重怎么计算？');
  console.log(faqResponse);
}
```

## 数据库

项目使用 SQLite 数据库，数据库文件位于 `data/knowledge_base.db`。

### 主要数据表

- `channels` - 物流渠道
- `price_sheets` - 报价单
- `price_tiers` - 价格区间
- `additional_fees` - 附加费
- `customers` - 客户信息
- `customer_channel_mapping` - 客户-渠道关联
- `operation_guides` - 操作指引
- `faq` - 问答知识

## 技术栈

- **后端**: Node.js + Express
- **数据库**: SQLite3
- **MCP SDK**: @modelcontextprotocol/sdk
- **其他**: axios, cors, body-parser

## 开发说明

### 运行开发模式

```bash
npm run dev
```

### 添加新功能

1. 在 `src/daos/` 中添加数据访问方法
2. 在 `src/services/` 中添加业务逻辑
3. 在 `src/routes/api.js` 中添加 API 路由
4. 在 `src/mcp-server.js` 中添加 MCP 工具（如需要）

## 许可证

MIT License
