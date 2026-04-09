#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const ChannelDao = require('./daos/channelDao');
const PriceSheetDao = require('./daos/priceSheetDao');
const CustomerDao = require('./daos/customerDao');
const OperationGuideDao = require('./daos/operationGuideDao');
const FaqDao = require('./daos/faqDao');
const PricingService = require('./services/pricingService');

const server = new Server(
  {
    name: 'logistics-knowledge-base',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_channels',
        description: '获取所有可用的物流渠道',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_price_sheets',
        description: '获取所有报价单',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'calculate_price',
        description: '计算物流费用',
        inputSchema: {
          type: 'object',
          properties: {
            price_sheet_id: { type: 'number', description: '报价单ID' },
            actual_weight: { type: 'number', description: '实际重量（kg）' },
            length: { type: 'number', description: '长度（cm）' },
            width: { type: 'number', description: '宽度（cm）' },
            height: { type: 'number', description: '高度（cm）' },
          },
          required: ['price_sheet_id', 'actual_weight', 'length', 'width', 'height'],
        },
      },
      {
        name: 'list_customers',
        description: '获取所有客户信息',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_customer_channels',
        description: '获取指定客户的适配渠道',
        inputSchema: {
          type: 'object',
          properties: {
            customer_id: { type: 'number', description: '客户ID' },
          },
          required: ['customer_id'],
        },
      },
      {
        name: 'get_operation_guides',
        description: '获取指定渠道的操作指引',
        inputSchema: {
          type: 'object',
          properties: {
            channel_id: { type: 'number', description: '渠道ID' },
          },
          required: ['channel_id'],
        },
      },
      {
        name: 'search_faq',
        description: '搜索知识库问答',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '搜索关键词' },
          },
          required: ['query'],
        },
      },
      {
        name: 'list_faq',
        description: '获取所有问答列表',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'list_channels': {
        const channels = await ChannelDao.findAll();
        result = { channels };
        break;
      }

      case 'list_price_sheets': {
        const sheets = await PriceSheetDao.findAll();
        result = { price_sheets: sheets };
        break;
      }

      case 'calculate_price': {
        const { price_sheet_id, actual_weight, length, width, height } = args;
        const calculation = await PricingService.calculatePrice(
          price_sheet_id,
          actual_weight,
          length,
          width,
          height
        );
        result = { calculation };
        break;
      }

      case 'list_customers': {
        const customers = await CustomerDao.findAll();
        result = { customers };
        break;
      }

      case 'get_customer_channels': {
        const channels = await CustomerDao.getCustomerChannels(args.customer_id);
        result = { customer_channels: channels };
        break;
      }

      case 'get_operation_guides': {
        const guides = await OperationGuideDao.findByChannelId(args.channel_id);
        result = { operation_guides: guides };
        break;
      }

      case 'search_faq': {
        const faqs = await FaqDao.search(args.query);
        result = { faq: faqs };
        break;
      }

      case 'list_faq': {
        const faqs = await FaqDao.findAll();
        result = { faq: faqs };
        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `错误: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('物流知识库MCP服务器已启动');
}

main().catch((error) => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});
