const mongoose = require("mongoose");
const { validation } = require("../helpers/validaition");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const currentDate = Date.now;
const ProductSchema = new Schema({
  productname: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "",
  },
  quantity: {
    type: String,
    default: "0",
  },
  image: {
    type: String,
    default: "",
  },
  bonuspercentage: {
    type: String,
    default: "0",
  },
});

const CompanySchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    default: "",
  },
  logo: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "",
  },
  products: {
    type: [ProductSchema],
    default: [],
  },
  users: [
    {
      id: { type: ObjectId, ref: "user", required: true },
      bouns: { type: String, default: "0" },
      _id: false,
    },
  ],
  location: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  news: [
    {
      new: { type: String, required: true },
      range: { type: String, default: "" },
      date: { type: Date, default: currentDate },
      _id: false,
    },
  ], // ***** not yet
});

//       *** static methods ***

// login function
CompanySchema.statics.login = async function (email, password) {
  //check for valid email and password
  const { error } = validation({ email, password });

  if (error) {
    throw new Error(error.details[0].message);
  }

  try {
    //check if the user email exist or not
    const user = await this.findOne({
      email,
    }).select("-__v");
    //console.log(user);
    if (!user) {
      throw new Error("Wrong Email or Password.");
    }
    //check for a correct password
    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) {
      throw new Error("Wrong Email or Password.");
    }
    return user;
  } catch (err) {
    throw Error(err);
  }
};

// register function
CompanySchema.statics.register = async function (req) {
  const {
    email,
    password,
    username,
    logo,
    type,
    products,
    location,
    description,
    news,
    users,
  } = req;
  //check for valid email and password
  const { error } = validation({ email, password });
  if (error) {
    throw new Error(error.details[0].message);
  }

  try {
    //check if the user email exist or not
    const testuser = await this.findOne({
      email,
    }).select("-__v");
    if (testuser) {
      throw new Error("This email used before");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const company = new this({
      email,
      password: hashedPassword,
      username,
      logo,
      type,
      products,
      location,
      description,
      news,
      users,
    });
    return company;
  } catch (err) {
    throw Error(err);
  }
};

const Company = mongoose.model("company", CompanySchema);

module.exports = Company;
