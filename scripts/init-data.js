const db = require('../src/database/db');

async function initSampleData() {
  console.log('开始初始化示例数据...');

  const sampleChannels = [
    { name: 'DHL国际快递', code: 'DHL-INT', description: 'DHL全球快递服务，时效稳定' },
    { name: 'FedEx联邦快递', code: 'FEDEX-INT', description: 'FedEx国际快递服务' },
    { name: 'UPS联合包裹', code: 'UPS-INT', description: 'UPS全球物流服务' },
    { name: '专线物流-美国', code: 'SPECIAL-US', description: '美国专线，性价比高' },
    { name: '专线物流-欧洲', code: 'SPECIAL-EU', description: '欧洲专线，时效稳定' },
  ];

  for (const channel of sampleChannels) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO channels (name, code, description) VALUES (?, ?, ?)',
        [channel.name, channel.code, channel.description],
        function(err) {
          if (err) reject(err);
          else {
            channel.id = this.lastID;
            resolve(channel);
          }
        }
      );
    });
    console.log(`创建渠道: ${channel.name} (ID: ${channel.id})`);
  }

  const samplePriceSheets = [
    { channel_id: 1, name: 'DHL-美国报价单', destination_country: '美国', volume_weight_factor: 5000 },
    { channel_id: 4, name: '美国专线-标准报价', destination_country: '美国', volume_weight_factor: 6000 },
  ];

  for (const sheet of samplePriceSheets) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO price_sheets (channel_id, name, destination_country, volume_weight_factor) VALUES (?, ?, ?, ?)',
        [sheet.channel_id, sheet.name, sheet.destination_country, sheet.volume_weight_factor],
        function(err) {
          if (err) reject(err);
          else {
            sheet.id = this.lastID;
            resolve(sheet);
          }
        }
      );
    });
    console.log(`创建报价单: ${sheet.name} (ID: ${sheet.id}, 体积重系数: ${sheet.volume_weight_factor})`);
  }

  const samplePriceTiers = [
    { price_sheet_id: 1, min_weight: 0, max_weight: 0.5, base_price: 120, price_per_kg: 0, fuel_surcharge: 15 },
    { price_sheet_id: 1, min_weight: 0.5, max_weight: 1, base_price: 150, price_per_kg: 0, fuel_surcharge: 15 },
    { price_sheet_id: 1, min_weight: 1, max_weight: 5, base_price: 80, price_per_kg: 70, fuel_surcharge: 15 },
    { price_sheet_id: 1, min_weight: 5, max_weight: null, base_price: 60, price_per_kg: 60, fuel_surcharge: 15 },
    { price_sheet_id: 2, min_weight: 0, max_weight: 1, base_price: 80, price_per_kg: 0, fuel_surcharge: 10 },
    { price_sheet_id: 2, min_weight: 1, max_weight: 10, base_price: 50, price_per_kg: 45, fuel_surcharge: 10 },
    { price_sheet_id: 2, min_weight: 10, max_weight: null, base_price: 40, price_per_kg: 40, fuel_surcharge: 10 },
  ];

  for (const tier of samplePriceTiers) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO price_tiers (price_sheet_id, min_weight, max_weight, base_price, price_per_kg, fuel_surcharge) VALUES (?, ?, ?, ?, ?, ?)',
        [tier.price_sheet_id, tier.min_weight, tier.max_weight, tier.base_price, tier.price_per_kg, tier.fuel_surcharge],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
  console.log('创建价格区间完成');

  const sampleFees = [
    { price_sheet_id: 1, name: '挂号费', fee_type: 'fixed', amount: 20 },
    { price_sheet_id: 1, name: '偏远地区附加费', fee_type: 'percentage', percentage: 10 },
    { price_sheet_id: 2, name: '处理费', fee_type: 'fixed', amount: 10 },
  ];

  for (const fee of sampleFees) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO additional_fees (price_sheet_id, name, fee_type, amount, percentage) VALUES (?, ?, ?, ?, ?)',
        [fee.price_sheet_id, fee.name, fee.fee_type, fee.amount, fee.percentage],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
  console.log('创建附加费完成');

  const sampleCustomers = [
    { name: '张三', company: 'ABC贸易公司', customer_type: 'VIP', contact_person: '张三', contact_phone: '13800138000', contact_email: 'zhangsan@example.com' },
    { name: '李四', company: 'XYZ科技公司', customer_type: '普通', contact_person: '李四', contact_phone: '13900139000', contact_email: 'lisi@example.com' },
  ];

  for (const customer of sampleCustomers) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO customers (name, company, customer_type, contact_person, contact_phone, contact_email) VALUES (?, ?, ?, ?, ?, ?)',
        [customer.name, customer.company, customer.customer_type, customer.contact_person, customer.contact_phone, customer.contact_email],
        function(err) {
          if (err) reject(err);
          else {
            customer.id = this.lastID;
            resolve(customer);
          }
        }
      );
    });
    console.log(`创建客户: ${customer.name} (ID: ${customer.id})`);
  }

  const sampleMappings = [
    { customer_id: 1, channel_id: 1, priority: 10, notes: 'VIP客户优先使用DHL' },
    { customer_id: 1, channel_id: 4, priority: 5, notes: '备选美国专线' },
    { customer_id: 2, channel_id: 4, priority: 10, notes: '推荐使用美国专线' },
  ];

  for (const mapping of sampleMappings) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO customer_channel_mapping (customer_id, channel_id, priority, notes) VALUES (?, ?, ?, ?)',
        [mapping.customer_id, mapping.channel_id, mapping.priority, mapping.notes],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
  console.log('创建客户渠道映射完成');

  const sampleGuides = [
    { channel_id: 1, title: '走价备案', step_order: 1, content: '登录DHL系统，填写货物信息进行价格备案', contact_person: '王经理', contact_info: '138xxxx1234' },
    { channel_id: 1, title: '下单操作', step_order: 2, content: '在DHL官网或API下单，获取运单号', contact_person: '李专员', contact_info: '139xxxx5678' },
    { channel_id: 1, title: '贴标要求', step_order: 3, content: '使用DHL标准标签，贴在包裹正面显眼位置', contact_person: '张主管', contact_info: '137xxxx9012' },
    { channel_id: 1, title: '订仓安排', step_order: 4, content: '提前24小时预约仓库，确保货物准时送达', contact_person: '王经理', contact_info: '138xxxx1234' },
    { channel_id: 4, title: '走价备案', step_order: 1, content: '在专线系统中提交货物信息进行价格确认', contact_person: '赵经理', contact_info: '136xxxx3456' },
    { channel_id: 4, title: '下单操作', step_order: 2, content: '通过专线API或后台下单', contact_person: '钱专员', contact_info: '135xxxx7890' },
  ];

  for (const guide of sampleGuides) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO operation_guides (channel_id, title, step_order, content, contact_person, contact_info) VALUES (?, ?, ?, ?, ?, ?)',
        [guide.channel_id, guide.title, guide.step_order, guide.content, guide.contact_person, guide.contact_info],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
  console.log('创建操作指引完成');

  const sampleFaqs = [
    { question: '体积重怎么计算？', answer: '体积重计算公式：长×宽×高/系数（单位：cm/kg）。系数可在报价单中自定义配置（默认为5000）。计费重量取实际重量和体积重中的较大值。', category: '计费规则', keywords: '体积重,计费重量,计算' },
    { question: 'DHL时效一般多久？', answer: 'DHL国际快递到美国一般需要3-5个工作日，欧洲4-6个工作日，具体时效可能受海关清关影响。', category: '时效查询', keywords: 'DHL,时效,美国,欧洲' },
    { question: '哪些物品不能寄？', answer: '禁止邮寄的物品包括：危险品、易燃易爆品、毒品、武器、活体动物、珍贵文物等。详见各渠道的禁运物品清单。', category: '禁运物品', keywords: '禁运,禁止,危险品' },
    { question: '如何追踪包裹？', answer: '可以通过运单号在对应快递公司官网查询物流轨迹，或联系客服获取最新状态。', category: '物流追踪', keywords: '追踪,查询,运单号' },
    { question: '关税由谁承担？', answer: '一般情况下关税由收件人承担，也可协商由发件人预付。具体以双方约定为准。', category: '关税', keywords: '关税,税费,海关' },
  ];

  for (const faq of sampleFaqs) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO faq (question, answer, category, keywords) VALUES (?, ?, ?, ?)',
        [faq.question, faq.answer, faq.category, faq.keywords],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
  console.log('创建FAQ完成');

  console.log('\n✅ 示例数据初始化完成！');
  process.exit(0);
}

initSampleData().catch(err => {
  console.error('初始化失败:', err);
  process.exit(1);
});
