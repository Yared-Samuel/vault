// scripts/generateStockSnapshots.js
import Stock from '@/models/Stock';
import StockSnapshot from '@/models/StockSnapshot';
import dbConnect from '@/lib/dbConnect';




async function generateDailySnapshots() {
  try {
    await dbConnect();

    const today = new Date();
    const snapshotDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const stocks = await Stock.find();

    for (const stock of stocks) {
      const { productId, warehouseId, quantity } = stock;

      await StockSnapshot.updateOne(
        {
          productId,
          warehouseId,
          snapshotDate,
        },
        {
          $set: { quantity },
        },
        { upsert: true }
      );
    }

    console.log(`✅ Stock snapshots generated for ${snapshotDate.toDateString()}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to generate stock snapshots:', err);
    process.exit(1);
  }
}

generateDailySnapshots();
