const express = require('express');
const router = express.Router();

// Default settings
const defaultSettings = {
  salesMode: 'hybrid',
  paymentMethods: {
    creditCard: { enabled: false },
    bankTransfer: {
      enabled: true,
      instructions: 'Banka havalesi bilgileri:\n\nBanka: İş Bankası\nIBAN: TR00 0000 0000 0000 0000 0000 00\nAlıcı: Ovia Home Tekstil A.Ş.\n\nLütfen havale açıklamasına sipariş numaranızı yazınız.'
    },
    letterOfCredit: {
      enabled: true,
      instructions: 'LC (Letter of Credit) ile ödeme için:\n\n1. LC\'yi şu bankaya açınız: İş Bankası, Kadıköy Şubesi\n2. Beneficiary: Ovia Home Tekstil A.Ş.\n3. LC bir kopyasını info@oviahome.com adresine gönderin\n\nDetaylı bilgi için lütfen bizimle iletişime geçin.'
    },
    paypal: {
      enabled: false,
      environment: 'sandbox',
      clientId: '',
      clientSecret: '',
      webhookId: ''
    }
  }
};

let currentSettings = { ...defaultSettings };

// GET /api/settings
router.get('/', (req, res) => {
  res.json(currentSettings);
});

// PUT /api/settings
router.put('/', (req, res) => {
  try {
    const { salesMode, paymentMethods } = req.body;

    if (salesMode) {
      if (!['retail', 'wholesale', 'hybrid'].includes(salesMode)) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'salesMode must be retail, wholesale, or hybrid'
        });
      }
      currentSettings.salesMode = salesMode;
    }

    if (paymentMethods) {
      currentSettings.paymentMethods = {
        ...currentSettings.paymentMethods,
        ...paymentMethods
      };
    }

    res.json(currentSettings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/settings/reset
router.post('/reset', (req, res) => {
  currentSettings = { ...defaultSettings };
  res.json(currentSettings);
});

module.exports = router;
