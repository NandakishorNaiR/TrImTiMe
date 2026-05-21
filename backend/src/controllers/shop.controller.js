const Shop = require('../models/Shop.model');

// List all active shops with optional filtering
exports.list = async(req, res) => {
    try {
        const { type, search, sort = 'price' } = req.query;

        // Build filter
        const filter = { active: true };

        if (type && type !== 'UNISEX') {
            filter.type = type;
        }

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        console.log(`[SHOP.LIST] Query params: type=${type}, search=${search}, sort=${sort}`);
        console.log(`[SHOP.LIST] Filter: ${JSON.stringify(filter)}`);

        // Build sort
        let sortObj = {};
        if (sort === 'price-asc') {
            sortObj = { 'services.price': 1 };
        } else if (sort === 'price-desc') {
            sortObj = { 'services.price': -1 };
        } else if (sort === 'name-asc') {
            sortObj = { name: 1 };
        } else if (sort === 'name-desc') {
            sortObj = { name: -1 };
        } else if (sort === 'rating') {
            sortObj = { rating: -1 };
        }

        const shops = await Shop.find(filter).sort(sortObj).lean();
        console.log(`[SHOP.LIST] Found ${shops.length} shops`);
        res.json(shops);
    } catch (err) {
        console.error('Error fetching shops:', err);
        res.status(500).json({ message: 'Failed to fetch shops', error: err.message });
    }
};