const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const OrderSchema = new Schema({
  companyid: {
    type: ObjectId,
    required: true,
  },
  companyname: {
    type: String,
    default: "",
  },
  userid: {
    type: ObjectId,
    required: true,
  },
  username: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  products: [
    {
      productid: {
        type: ObjectId,
        required: true,
      },
      productname: {
        type: String,
        default: "",
      },
      numberofitems: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        default: "",
      },
      price: {
        type: String,
        default: "",
      },
      bonuspercentage: {
        type: String,
        default: "",
      },
      additionalinfo: {
        type: String,
        default: "",
      },
      _id: false,
    },
  ],
  dateoforder: {
    type: Date,
    default: Date.now,
  },
  accepted: {
    type: Boolean,
    default: false,
  },
  state: {
    type: String,
    default: "not accepted",
  },
  totalprice: {
    type: String,
    default: "",
  },
  bonusused: {
    type: Boolean,
    default: false,
  },
});

const Order = mongoose.model("order", OrderSchema);

module.exports = Order;
