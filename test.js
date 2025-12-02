const { Order } = require("./models/Order.js");

const testFunc = async () => {
  try {
    const orders = await Order.find({ userID: "692759d2b57c82e4b7b3927b" })
      .populate({ path: "detail.product", select: "productName price" })
      .exec();

    console.log("orders: ", JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error(err);
  }
};
const str = "";
console.log(typeof str);
console.log(!str);
const numberStr = "3.14";
console.log(Number(numberStr));
console.log(parseFloat(numberStr));

console.log(!undefined);
console.log(!"");
console.log(String(undefined));
module.exports = { testFunc };
