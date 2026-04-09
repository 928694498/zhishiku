const axios = require('axios');

class WeComBotClient {
  constructor(apiBaseUrl = 'http://localhost:3000/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  async request(endpoint, method = 'GET', data = null) {
    try {
      const config = {
        method,
        url: `${this.apiBaseUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      if (data) {
        config.data = data;
      }
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('API请求失败:', error.message);
      throw error;
    }
  }

  async searchFaq(query) {
    const result = await this.request(`/faq?q=${encodeURIComponent(query)}`);
    if (result.success && result.data.length > 0) {
      return result.data;
    }
    return null;
  }

  async calculatePrice(priceSheetId, actualWeight, length, width, height) {
    const result = await this.request('/pricing/calculate', 'POST', {
      price_sheet_id: priceSheetId,
      actual_weight: actualWeight,
      length,
      width,
      height,
    });
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error || '计算失败');
  }

  async listChannels() {
    const result = await this.request('/channels');
    return result.success ? result.data : [];
  }

  async listPriceSheets() {
    const result = await this.request('/price-sheets');
    return result.success ? result.data : [];
  }

  async getOperationGuides(channelId) {
    const result = await this.request(`/channels/${channelId}/operation-guides`);
    return result.success ? result.data : [];
  }

  async getCustomerChannels(customerId) {
    const result = await this.request(`/customers/${customerId}/channels`);
    return result.success ? result.data : [];
  }

  formatPriceResult(calculation) {
    return `
📦 **物流报价计算结果**

**货物信息：**
- 实际重量：${calculation.weight.actual} kg
- 体积重：${calculation.weight.volume} kg
- 计费重量：${calculation.weight.chargeable} kg
- 尺寸：${calculation.dimensions.length}×${calculation.dimensions.width}×${calculation.dimensions.height} cm
- 体积重系数：${calculation.priceSheet.volumeWeightFactor}

**费用明细：**
- 基础运费：¥${calculation.cost.base}
- 燃油附加费：¥${calculation.cost.fuelSurcharge}
- 其他附加费：¥${calculation.cost.additional}
- **总计：¥${calculation.cost.total}**

${calculation.feeDetails.length > 0 ? '\n**附加费明细：**\n' + calculation.feeDetails.map(f => `- ${f.name}: ¥${f.amount.toFixed(2)}`).join('\n') : ''}
    `.trim();
  }

  formatOperationGuides(guides, channelName) {
    if (guides.length === 0) {
      return '暂无操作指引';
    }
    return `
📋 **${channelName} 操作指引**

${guides.map((g, i) => `${i + 1}. **${g.title}**\n   ${g.content}${g.contact_person ? `\n   对接人：${g.contact_person} ${g.contact_info || ''}` : ''}`).join('\n\n')}
    `.trim();
  }

  formatFaqResult(faqs) {
    if (!faqs || faqs.length === 0) {
      return '未找到相关知识，请尝试其他关键词';
    }
    return faqs.map((faq, i) => `
❓ **Q${i + 1}: ${faq.question}**

💡 **A:** ${faq.answer}
    `.trim()).join('\n\n---\n\n');
  }

  async handleMessage(message) {
    const lowerMessage = message.toLowerCase().trim();

    if (lowerMessage.includes('渠道') || lowerMessage.includes('channel')) {
      const channels = await this.listChannels();
      if (channels.length === 0) {
        return '暂无可用渠道';
      }
      return `🚚 **可用物流渠道：**\n\n${channels.map(c => `- ${c.name} (${c.code || 'N/A'})\n  ${c.description || ''}`).join('\n\n')}`;
    }

    if (lowerMessage.includes('报价单') || lowerMessage.includes('price')) {
      const sheets = await this.listPriceSheets();
      if (sheets.length === 0) {
        return '暂无报价单';
      }
      return `📊 **可用报价单：**\n\n${sheets.map(s => `- ID: ${s.id} | ${s.name}\n  渠道: ${s.channel_name || 'N/A'}\n  体积重系数: ${s.volume_weight_factor || 5000}`).join('\n\n')}`;
    }

    if (lowerMessage.startsWith('算价') || lowerMessage.startsWith('calculate')) {
      const parts = message.split(/\s+/);
      if (parts.length < 6) {
        return '请提供完整参数：算价 <报价单ID> <实际重量(kg)> <长(cm)> <宽(cm)> <高(cm)>\n例如：算价 1 2.5 30 20 15';
      }
      try {
        const [, sheetId, weight, length, width, height] = parts;
        const result = await this.calculatePrice(
          parseInt(sheetId),
          parseFloat(weight),
          parseFloat(length),
          parseFloat(width),
          parseFloat(height)
        );
        return this.formatPriceResult(result);
      } catch (e) {
        return `计算失败：${e.message}`;
      }
    }

    if (lowerMessage.startsWith('指引') || lowerMessage.startsWith('guide')) {
      const parts = message.split(/\s+/);
      if (parts.length < 2) {
        return '请提供渠道ID：指引 <渠道ID>';
      }
      const channelId = parseInt(parts[1]);
      const guides = await this.getOperationGuides(channelId);
      return this.formatOperationGuides(guides, `渠道${channelId}`);
    }

    if (lowerMessage.startsWith('客户渠道') || lowerMessage.startsWith('customer')) {
      const parts = message.split(/\s+/);
      if (parts.length < 2) {
        return '请提供客户ID：客户渠道 <客户ID>';
      }
      const customerId = parseInt(parts[1]);
      const channels = await this.getCustomerChannels(customerId);
      if (channels.length === 0) {
        return '该客户暂无适配渠道';
      }
      return `👥 **客户适配渠道：**\n\n${channels.map(c => `- ${c.channel_name} (优先级: ${c.priority})\n  ${c.notes || ''}`).join('\n\n')}`;
    }

    const faqs = await this.searchFaq(message);
    return this.formatFaqResult(faqs);
  }
}

module.exports = WeComBotClient;
