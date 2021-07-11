const jwt = require("jsonwebtoken");
var secret = Buffer.from(String(process.env.Token), "base64");

const CreateToken = (user) => {
  const token = jwt.sign({ _id: user._id }, secret, {
    expiresIn: "20h",
    algorithm: "HS256",
  });
  return token;
};

const VarifyToken = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("cannot access");

  try {
    const result = jwt.verify(token, secret, {
      algorithms: "HS256",
    });
    req.in_token = result;
    next();
  } catch (err) {
    res.status(401).send(err);
  }
};
module.exports = {
  CreateToken,
  VarifyToken,
};
