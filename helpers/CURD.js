const User = require("../models/User");
const Company = require("../models/Company");

const getOne = async (model, req, res) => {
  try {
    const theone = await model.findById({
      _id: req.params.id,
    });
    res.status(200).json(theone);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const getAll = async (model, req, res) => {
  try {
    const all = await model.find();
    res.status(200).json(all);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const updateBounse = async (newbounse, userid, companyid) => {
  try {
    var company = await Company.findOne({ _id: companyid });
    var user = await User.findOne({ _id: userid });
    newusreslist = company.users; // for compay
    newcompieslist = user.companies; // for user

    company.users.forEach((element, index) => {
      if (element.id.toString() == userid.toString()) {
        company.users[index].bouns =
          parseInt(newbounse) + parseInt(company.users[index].bouns);
      }
    });
    user.companies.forEach((element, index) => {
      if (element.id.toString() == companyid.toString()) {
        user.companies[index].bouns =
          parseInt(newbounse) + parseInt(user.companies[index].bouns);
      }
    });

    const Newcompany = await Company.findByIdAndUpdate(
      { _id: companyid },
      company,
      { new: true }
    );

    const Newuser = await User.findByIdAndUpdate({ _id: userid }, user, {
      new: true,
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const getBonus = async (userid, companyid) => {
  try {
    const user = await User.findById({ _id: userid });
    selectedComp = user.companies.find(
      (o) => o.id.toString() == companyid.toString()
    );
    return selectedComp.bouns;
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const editOne = async (model, req, res) => {
  try {
    /*
        ************* NOTE ************
        we need to add Token here
    */
    const NewOne = await model.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    res.status(200).json(NewOne);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const deleteOne = async (model, req, res) => {
  try {
    /*
        ************* NOTE ************
        we need to add Token here
    */
    const DeletedOne = await model.findByIdAndRemove({
      _id: req.params.id,
    });
    res.status(200).json(DeletedOne);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  editOne,
  deleteOne,
  getOne,
  getAll,
  updateBounse,
  getBonus,
};
