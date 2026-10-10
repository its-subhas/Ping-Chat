import validator from "validator";

// Signup validator

export const validateSignup = (req, res, next) => {
  let { fullName, email, password, bio } = req.body;

  if (!fullName || !email || !password || !bio) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required!" });
  }

  fullName = fullName.trim();

  if (!validator.isLength(fullName, { min: 1 })) {
    return res.status(400).json({
      success: false,
      message: "Full Name must be at least 1 character!",
    });
  }

  if (!validator.isAlpha(fullName.replace(/\s/g, ""))) {
    return res
      .status(400)
      .json({ success: false, message: "Full Name can contain only letters!" });
  }

  fullName = fullName
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  email = email.trim();

  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: "Invalid email!" });
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 7,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Password must contain at least 7 characters, one uppercase letter, one lowercase letter, one number and one special character!",
    });
  }

  bio = bio.trim().replace(/\s+/g, " ");

  if (!validator.isLength(bio, { min: 1 })) {
    return res
      .status(400)
      .json({ success: false, message: "Bio must be at least 1 character!" });
  }

  req.body.fullName = fullName;
  req.body.email = email;
  req.body.bio = bio;
  next();
};

// Login validator

export const validateLogin = (req, res, next) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required!" });
  }

  email = email.trim();

  if (!validator.isEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email address!" });
  }

  req.body.email = email;
  next();
};

// Update Profile validator

export const validateUpdateProfile = (req, res, next) => {
  let { fullName, bio } = req.body;

  const allowedTypes = ["image/jpeg", "image/png"];

  if (req.file && !allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "Only JPG, JPEG and PNG images are allowed!",
    });
  }

  if (!fullName || !bio) {
    return res
      .status(400)
      .json({ success: false, message: "Full Name and Bio are required!" });
  }

  fullName = fullName.trim();

  if (!validator.isLength(fullName, { min: 1 })) {
    return res.status(400).json({
      success: false,
      message: "Full Name must be at least 1 character!",
    });
  }

  if (!validator.isAlpha(fullName.replace(/\s/g, ""))) {
    return res
      .status(400)
      .json({ success: false, message: "Full Name can contain only letters!" });
  }

  fullName = fullName
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  bio = bio.trim().replace(/\s+/g, " ");

  if (!validator.isLength(bio, { min: 1 })) {
    return res
      .status(400)
      .json({ success: false, message: "Bio must be at least 1 character!" });
  }

  req.body.fullName = fullName;
  req.body.bio = bio;
  next();
};
