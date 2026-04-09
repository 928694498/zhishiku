const db = require('../database/db');

class PricingService {
  static calculateVolumeWeight(length, width, height, factor = 5000) {
    const volume = length * width * height;
    return volume / factor;
  }

  static calculateChargeableWeight(actualWeight, volumeWeight) {
    return Math.max(actualWeight, volumeWeight);
  }

  static async calculatePrice(priceSheetId, actualWeight, length, width, height) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM price_sheets WHERE id = ?', [priceSheetId], (err, priceSheet) => {
        if (err) return reject(err);
        if (!priceSheet) return reject(new Error('报价单不存在'));

        const volumeWeightFactor = priceSheet.volume_weight_factor || 5000;
        const volumeWeight = this.calculateVolumeWeight(length, width, height, volumeWeightFactor);
        const chargeableWeight = this.calculateChargeableWeight(actualWeight, volumeWeight);

        db.all('SELECT * FROM price_tiers WHERE price_sheet_id = ? ORDER BY min_weight', [priceSheetId], (err, tiers) => {
          if (err) return reject(err);

          let applicableTier = null;
          for (const tier of tiers) {
            if (chargeableWeight >= tier.min_weight) {
              if (!tier.max_weight || chargeableWeight <= tier.max_weight) {
                applicableTier = tier;
                break;
              }
            }
          }

          if (!applicableTier) {
            return reject(new Error('没有找到适用的价格区间'));
          }

          let baseCost = applicableTier.base_price;
          if (applicableTier.price_per_kg) {
            baseCost += chargeableWeight * applicableTier.price_per_kg;
          }

          let fuelSurcharge = 0;
          if (applicableTier.fuel_surcharge) {
            fuelSurcharge = baseCost * applicableTier.fuel_surcharge / 100;
          }

          db.all('SELECT * FROM additional_fees WHERE price_sheet_id = ? OR channel_id = ?', 
            [priceSheetId, priceSheet.channel_id], 
            async (err, fees) => {
              if (err) return reject(err);

              let additionalCost = 0;
              const feeDetails = [];

              for (const fee of fees) {
                let feeAmount = 0;
                if (fee.fee_type === 'fixed') {
                  feeAmount = fee.amount || 0;
                } else if (fee.fee_type === 'percentage') {
                  feeAmount = baseCost * (fee.percentage || 0) / 100;
                }
                additionalCost += feeAmount;
                feeDetails.push({
                  name: fee.name,
                  amount: feeAmount,
                  type: fee.fee_type
                });
              }

              const totalCost = baseCost + fuelSurcharge + additionalCost;

              resolve({
                priceSheet: {
                  id: priceSheet.id,
                  name: priceSheet.name,
                  channelId: priceSheet.channel_id,
                  volumeWeightFactor: volumeWeightFactor
                },
                weight: {
                  actual: actualWeight,
                  volume: parseFloat(volumeWeight.toFixed(3)),
                  chargeable: parseFloat(chargeableWeight.toFixed(3))
                },
                dimensions: {
                  length,
                  width,
                  height
                },
                cost: {
                  base: parseFloat(baseCost.toFixed(2)),
                  fuelSurcharge: parseFloat(fuelSurcharge.toFixed(2)),
                  additional: parseFloat(additionalCost.toFixed(2)),
                  total: parseFloat(totalCost.toFixed(2))
                },
                feeDetails
              });
            }
          );
        });
      });
    });
  }
}

module.exports = PricingService;