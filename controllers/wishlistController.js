const { Wishlist } = require("../models/WishList.js");
const mongoose = require("mongoose");

// wishlist -> cartList -> order
const getAllWishList = async (req, res, next) => {
  try {
    const {
      from = new Date("2025-11-26"),
      to = new Date(),
      page = 1,
      limit = 5,
      sort = "-createdAt",
    } = req.query;
    let query = {};
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const pageRaw = typeof page === "string" ? page.trim() : page;
    const limitRaw = typeof limit === "string" ? limit.trim() : limit;
    const pageParsed = Number(pageRaw);
    const limitParsed = Number(limitRaw);
    const pageNum =
      Number.isFinite(pageParsed) && pageParsed > 0 ? pageParsed : 1;
    const limitNum =
      Number.isFinite(limitParsed) && limitParsed > 0 ? limitParsed : 5;

    const skip = (pageNum - 1) * limitNum;
    const sortSpec =
      typeof sort === "string" && sort.trim() !== ""
        ? sort.trim()
        : "-createdAt";

    const [wishlists, total] = await Promise.all([
      Wishlist.find(query)
        .populate("detail.productId")
        .populate("userID")
        .skip(skip)
        .sort(sortSpec)
        .limit(limitNum)
        .exec(),
      Wishlist.countDocuments(query).exec(),
    ]);
    if (!wishlists || wishlists.length === 0) {
      const err = new Error("No wishlists found");
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({
      count: wishlists.length,
      total,
      page: pageNum,
      limit: limitNum,
      wishlists,
    });
  } catch (err) {
    next(err);
  }
};

// by wishlist id
const createWishList = async (req, res, next) => {
  try {
    const { userID, detail } = req.body;
    if (!userID || !detail) {
      const err = new Error("userID and detail are required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      const err = new Error("Invalid User ID format");
      err.statusCode = 400;
      return next(err);
    }
    if (!detail || typeof detail !== "object") {
      const err = new Error("detail is required and must be an object");
      err.statusCode = 400;
      return next(err);
    }

    // validate detail object (single product)
    if (!detail.productId) {
      const err = new Error("productId is required in detail");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(detail.productId)) {
      const err = new Error("Invalid productId format in detail");
      err.statusCode = 400;
      return next(err);
    }
    const duplicateWishlist = await Wishlist.findOne({
      userID,
      "detail.productId": detail.productId,
    }).exec();

    if (duplicateWishlist) {
      const err = new Error(
        "Wishlist for this product already exists for the user"
      );
      err.statusCode = 409;
      return next(err);
    }

    const detailFormat = {
      productId: detail.productId,
    };

    const createdWishlist = new Wishlist({
      userID: userID,
      detail: detailFormat,
    });

    const savedWishlist = await createdWishlist.save();
    if (!savedWishlist) {
      const err = new Error("Failed to create wishlist");
      err.statusCode = 500;
      return next(err);
    }

    res.status(201).json({
      message: "Wishlist created successfully",
      wishlist: savedWishlist,
    });
  } catch (err) {
    next(err);
  }
};

// const updateWishListByWishlistId = async (req, res, next) => {
//   try {
//     // use wishlist id to update
//     const { id } = req.params;
//     const { userID, totalItem, detail, totalPrice } = req.body;
//     const updatedWishlist = {};
//     if (!id || id === ":id") {
//       const err = new Error("Wishlist ID is required");
//       err.statusCode = 400;
//       return next(err);
//     }
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       const err = new Error("Invalid Wishlist ID format");
//       err.statusCode = 400;
//       return next(err);
//     }
//     if (!userID || !detail) {
//       const err = new Error("userID and detail are required");
//       err.statusCode = 400;
//       return next(err);
//     }
//     if (!mongoose.Types.ObjectId.isValid(userID)) {
//       const err = new Error("Invalid User ID format");
//       err.statusCode = 400;
//       return next(err);
//     }
//     if (!detail || typeof detail !== "object") {
//       const err = new Error("detail is required and must be an object");
//       err.statusCode = 400;
//       return next(err);
//     }

//     // validate detail object (single product)
//     if (!detail.productId) {
//       const err = new Error("productId is required in detail");
//       err.statusCode = 400;
//       return next(err);
//     }
//     if (!mongoose.Types.ObjectId.isValid(detail.productId)) {
//       const err = new Error("Invalid productId format in detail");
//       err.statusCode = 400;
//       return next(err);
//     }

//     const quantityNum = Number(detail.quantity);
//     if (!quantityNum || quantityNum <= 0) {
//       const err = new Error("quantity must be a positive number in detail");
//       err.statusCode = 400;
//       return next(err);
//     }

//     if (!detail.size) {
//       const err = new Error("size is required in detail");
//       err.statusCode = 400;
//       return next(err);
//     }
//     if (!["S", "M", "L", "XL"].includes(detail.size.toUpperCase())) {
//       const err = new Error(
//         "size must be one of S/s, M/m, L/l, XL/xl in detail"
//       );
//       err.statusCode = 400;
//       return next(err);
//     }
//     if (!detail.color) {
//       const err = new Error("color is required in detail");
//       err.statusCode = 400;
//       return next(err);
//     }

//     const priceNum = Number(detail.price);
//     if (!priceNum || priceNum < 0) {
//       const err = new Error("priceProduct must be a positive number in detail");
//       err.statusCode = 400;
//       return next(err);
//     }
//     const totalNum = detail.total
//       ? Number(detail.total)
//       : quantityNum * priceNum;
//     if (totalNum < 0) {
//       const err = new Error("total must be a positive number in detail");
//       err.statusCode = 400;
//       return next(err);
//     }

//     const detailFormat = {
//       productId: detail.productId,
//       quantity: quantityNum,
//       size: detail.size,
//       color: detail.color,
//       price: priceNum,
//       total: totalNum,
//     };

//     if (totalItem) {
//       const totalParsed = parseInt(totalItem);
//       if (Number.isNaN(totalParsed)) {
//         const err = new Error("totalItem must be a number");
//         err.statusCode = 400;
//         return next(err);
//       }
//       updatedWishlist.totalItem = totalParsed > 0 ? totalParsed : 1;
//     } else {
//       updatedWishlist.totalItem = 1;
//     }

//     const totalPriceNum = Number(totalPrice);
//     if (!totalPriceNum || totalPriceNum < 0) {
//       const err = new Error("totalPrice must be a positive number");
//       err.statusCode = 400;
//       return next(err);
//     }
//     updatedWishlist.userID = userID;
//     updatedWishlist.detail = detailFormat;
//     updatedWishlist.totalPrice = totalPriceNum;

//     const savedWishlist = await Wishlist.findByIdAndUpdate(
//       id,
//       {
//         $set: updatedWishlist,
//       },
//       { new: true }
//     ).exec();

//     if (!savedWishlist) {
//       const err = new Error("Failed to update wishlist");
//       err.statusCode = 500;
//       return next(err);
//     }

//     res.status(200).json({
//       message: "Wishlist updated successfully",
//       wishlist: savedWishlist,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// by userId
const getWishListByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId || userId === ":userId") {
      const err = new Error("User ID is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const err = new Error("Invalid User ID format");
      err.statusCode = 400;
      return next(err);
    }

    const wishlist = await Wishlist.aggregate([
      {
        $match: { userID: new mongoose.Types.ObjectId(userId) },
      },
      // join product together
      {
        $lookup: {
          from: "products",
          localField: "detail.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      // convert array to object
      {
        $unwind: "$product",
      },
      // group wishlist user
      {
        $group: {
          _id: "$userID",
          wishlists: {
            $push: {
              wishlistId: "$_id",
              product: "$product",
              createdAt: "$createdAt",
            },
          },
        },
      },
    ]);
    console.log(wishlist)


    res.status(200).json({
      message: "Wishlist fetched successfully",
      wishlist,
    });
  } catch (err) {
    next(err);
  }
};
const deleteWishlistByUserIdAndProductId = async (req, res, next) => {
  try {
    const { userId, productId } = req.params;

    if (!userId || userId === ":userId") {
      const err = new Error("userId is required");
      err.statusCode = 400;
      return next(err);
    }

    const foundWishlistAndDelete = await Wishlist.findOneAndDelete({
      $and: [{ userID: userId }, { "detail.productId": productId }],
    }).exec();

    console.log("foundWishlistAndDelete: ", foundWishlistAndDelete);
    if (!foundWishlistAndDelete || foundWishlistAndDelete.length === 0) {
      const err = new Error(
        "No wishlist found to delete for this user id and product id: " +
          userId +
          ", " +
          productId
      );
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({
      message: "Wishlist item(s) deleted successfully",
      wishlist: foundWishlistAndDelete,
    });
  } catch (err) {
    next(err);
  }
};
const deleteWishlistByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId || userId === ":userId") {
      const err = new Error("userId is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const err = new Error("Invalid Wishlist ID format");
      err.statusCode = 400;
      return next(err);
    }
    const deletedWishlist = await Wishlist.deleteMany({
      userID: userId,
    }).exec();

    if (!deletedWishlist || deletedWishlist.deletedCount === 0) {
      const err = new Error(
        "No wishlist found to delete for this user id: " + userId
      );
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({
      message: "Wishlist(s) deleted successfully",
      wishlist: deletedWishlist,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  getAllWishList,
  getWishListByUserId,
  createWishList,
  // updateWishListByWishlistId,
  deleteWishlistByUserIdAndProductId,
  deleteWishlistByUserId,
};
