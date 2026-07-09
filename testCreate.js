const mongoose = require('mongoose');
const transaksiModel = require('./models/transaksi');

mongoose.connect('mongodb://127.0.0.1:27017/tokogitar1', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  try {
    console.log("Connected to MongoDB");
    const data = {
        idBarang: "6a09516478e9ecad51e3660d",
        idUser: "6a09516478e9ecad51e3660d",
        jumlah: 1,
        harga: 1000000,
        total: 1000000
    };
    
    const result = await transaksiModel.create(data);
    console.log("Success:", result);
  } catch (error) {
    console.error("Mongoose Error:", error.message);
    if (error.errors) {
        for (let key in error.errors) {
            console.error("  ->", key, ":", error.errors[key].message);
        }
    }
  } finally {
    process.exit(0);
  }
}).catch(err => {
  console.error("Connection Error:", err);
  process.exit(1);
});
