const express = require('express');
const router = express.Router();

const ChannelDao = require('../daos/channelDao');
const PriceSheetDao = require('../daos/priceSheetDao');
const CustomerDao = require('../daos/customerDao');
const OperationGuideDao = require('../daos/operationGuideDao');
const FaqDao = require('../daos/faqDao');
const PricingService = require('../services/pricingService');

router.get('/channels', async (req, res) => {
  try {
    const channels = await ChannelDao.findAll();
    res.json({ success: true, data: channels });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/channels', async (req, res) => {
  try {
    const channel = await ChannelDao.create(req.body);
    res.json({ success: true, data: channel });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/channels/:id', async (req, res) => {
  try {
    const result = await ChannelDao.delete(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/price-sheets', async (req, res) => {
  try {
    const sheets = await PriceSheetDao.findAll();
    res.json({ success: true, data: sheets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/price-sheets', async (req, res) => {
  try {
    const sheet = await PriceSheetDao.create(req.body);
    res.json({ success: true, data: sheet });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/price-sheets/:id', async (req, res) => {
  try {
    const sheet = await PriceSheetDao.update(req.params.id, req.body);
    res.json({ success: true, data: sheet });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/price-sheets/:id', async (req, res) => {
  try {
    const result = await PriceSheetDao.delete(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/price-sheets/:id/tiers', async (req, res) => {
  try {
    const tier = await PriceSheetDao.addPriceTier({ price_sheet_id: req.params.id, ...req.body });
    res.json({ success: true, data: tier });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/price-sheets/:id/tiers', async (req, res) => {
  try {
    const tiers = await PriceSheetDao.getPriceTiers(req.params.id);
    res.json({ success: true, data: tiers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/price-sheets/:id/fees', async (req, res) => {
  try {
    const fee = await PriceSheetDao.addAdditionalFee({ price_sheet_id: req.params.id, ...req.body });
    res.json({ success: true, data: fee });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/pricing/calculate', async (req, res) => {
  try {
    const { price_sheet_id, actual_weight, length, width, height } = req.body;
    const result = await PricingService.calculatePrice(price_sheet_id, actual_weight, length, width, height);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const customers = await CustomerDao.findAll();
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/customers', async (req, res) => {
  try {
    const customer = await CustomerDao.create(req.body);
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/customers/:id', async (req, res) => {
  try {
    const result = await CustomerDao.delete(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/customers/:id/channels', async (req, res) => {
  try {
    const channels = await CustomerDao.getCustomerChannels(req.params.id);
    res.json({ success: true, data: channels });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/customers/:id/channels', async (req, res) => {
  try {
    const mapping = await CustomerDao.addChannelMapping({ customer_id: req.params.id, ...req.body });
    res.json({ success: true, data: mapping });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/operation-guides', async (req, res) => {
  try {
    const guides = await OperationGuideDao.findAll();
    res.json({ success: true, data: guides });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/channels/:id/operation-guides', async (req, res) => {
  try {
    const guides = await OperationGuideDao.findByChannelId(req.params.id);
    res.json({ success: true, data: guides });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/operation-guides', async (req, res) => {
  try {
    const guide = await OperationGuideDao.create(req.body);
    res.json({ success: true, data: guide });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/operation-guides/:id', async (req, res) => {
  try {
    const result = await OperationGuideDao.delete(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/faq', async (req, res) => {
  try {
    if (req.query.q) {
      const faqs = await FaqDao.search(req.query.q);
      res.json({ success: true, data: faqs });
    } else {
      const faqs = await FaqDao.findAll();
      res.json({ success: true, data: faqs });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/faq', async (req, res) => {
  try {
    const faq = await FaqDao.create(req.body);
    res.json({ success: true, data: faq });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/faq/:id', async (req, res) => {
  try {
    const faq = await FaqDao.update(req.params.id, req.body);
    res.json({ success: true, data: faq });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/faq/:id/archive', async (req, res) => {
  try {
    const result = await FaqDao.archive(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/faq/:id', async (req, res) => {
  try {
    const result = await FaqDao.delete(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;