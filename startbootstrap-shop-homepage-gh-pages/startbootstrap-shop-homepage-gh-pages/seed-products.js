const mongoose = require('mongoose');
const Product = require('./models/product');
const products = require('./products.json');

mongoose.connect('mongodb://127.0.0.1:27017/shoecentral')
    .then(async () => {
        await Product.deleteMany({});          // start fresh so it can be re-run
        await Product.insertMany(products);
        console.log('Inserted', products.length, 'products into MongoDB');
    })
    .catch(err => console.log('Seed error:', err.message))
    .finally(() => mongoose.disconnect());