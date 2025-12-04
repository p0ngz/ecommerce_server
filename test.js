const { Order } = require("./models/Order.js");

const testFunc = async () => {
  try {
    const orders = await Order.find({ userID: "692759d2b57c82e4b7b3927b" })
      .populate({ path: "detail.product", select: "productName price" })
      .exec();

    console.log("orders: ", JSON.stringify(orders, null, 2));
    return orders;
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
console.log(Number.isFinite(-1));
console.log(Number.isFinite(0));
console.log(![], ![1, 2, 3], !{}, !undefined, !"", !null);
console.log(!![], !![1, 2, 3], !!{}, !!undefined, !!"", !!null);
const product = {
  size: "s",
};
console.log(["S", "M", "L", "XL"].includes(product.size.toUpperCase()));
console.log("-------------------------------------------------------------");

const showBoolean = true;
const showBooleanStr = "true";
console.log(!!showBoolean);
console.log(!!showBooleanStr);
console.log(!!false);
console.log(!!"false");
console.log(!!"");
console.log(!!"abc");
console.log(!!{});
console.log(!!{ a: 1 });
console.log(!![]);
console.log(!![1, 2, 3]);
console.log(!!null);

const data = testFunc();
console.log("data: ", data);

module.exports = { testFunc };
