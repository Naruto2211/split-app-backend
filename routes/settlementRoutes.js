const express = require('express');
const { getBalances, getSettlements, getPeople } = require('../controllers/settlementController');
const router = express.Router();

router.get('/balances', getBalances);
router.get('/settlements', getSettlements);
router.get('/people', getPeople);

module.exports = router;