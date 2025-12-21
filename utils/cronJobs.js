const cron = require("node-cron");
const { Coupon } = require("../models/Coupon.js");
const { UserCoupon } = require("../models/UserCoupon.js");

const startCronJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Checking expired coupons and userCoupons...");
      const updatedCoupons = await Coupon.updateExpiredCoupons();
      const updatedUserCoupons = await UserCoupon.updateExpiredCoupons();

      if (updatedCoupons.updatedIds.length > 0) {
        const checkListCoupons = await Coupon.find({
          _id: { $in: updatedCoupons.updatedIds },
        });
        console.log("checkListCoupons: ", checkListCoupons);
      }
      if (updatedUserCoupons.updatedIds.length > 0) {
        const checkListUserCoupons = await UserCoupon.find({
          _id: { $in: updatedUserCoupons.updatedIds },
        });
        console.log("checkListUserCoupons: ", checkListUserCoupons);
      }
      console.log(`✅ Expired coupons updated: ${updatedCoupons.count}:`);
      console.log(
        `✅ Expired userCoupons updated: ${updatedUserCoupons.count}`
      );
    } catch (err) {
      console.error("❌ Error updating expired coupons:", err);
    }
  });
};

module.exports = { startCronJobs };
