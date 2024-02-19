const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4} = require("uuid")
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require("../models/user.model");
const { addUser, getUser } = require("../database/user.db");


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ezugwuharrison@gmail.com',
      pass: 'Chukwudi@92'
    }
});

/**
 * @name generateVerificationToken
 * @desc generate the verification token using crypto node lib
 * 
 * @return a random data token
 */
const generateVerificationToken = () => {
    return crypto.randomBytes(20).toString('hex');
};


/**
 * @desc register a new user in the db 
 * @route POST /api/auth/register
 * req - request object
 * res - response object
 * @return void
 */
const registerUser = async (req, res) => {
  const { email, password, phone, status } = req.body;
 try {
  if (!email || !password || !phone) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const userAvailable = await getUser(email);
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered!");
  }


  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();
  const token = generateVerificationToken();
  const userObj = {
    userId,
    email,
    token,
    password: hashedPassword,
    phone,
    verified: 0
  };

  // Send verification email
  const mailOptions = {
    from: 'ezugwuharrison@yahoo.com',
    to: email,
    subject: 'Email Verification',
    text: `Please click the following link to verify your email: http://127.0.0.1:3000/verify/${token}`
  };

  if(status == 'email') {
    console.log("Verification email sent")
    const mail = await transporter.sendMail(mailOptions);
    console.log("Verification email sent", mail.response)
  } else if (status == 'phone') {
    const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
    const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
    const client = twilio(accountSid, authToken);
    const sms = await client.messages.create({
      body: `Your verification code is: ${token}`,
      from: process.env.PHONE_NUMBER,
      to: phone
    })

  }

  // Save user data to database
  const user = await addUser(userObj)

  res.send("Verification link sent to your email")
  console.log(`User created ${user}`);
  if (user) {
    res.status(201).json(user);

  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
 } catch (error) {
  console.log(error);
  res.send(error);
 }
};


const verifyToken = async (req, res) => {
    const token = req.params.token;
    const user = getUser(token);

    if (!user) {
      return res.status(400).send('Invalid verification token');
    }
  
    // Mark user as verified
    user.verified = true;
    res.send('Email verified successfully');
};


const verifyOTP = async (req, res) => {
  const { phone, code } = req.body;

  const user = getUser(code);

  if (!user) {
    return res.status(400).send('Phone number not registered');
  }

  if (user.verificationCode !== parseInt(code)) {
    return res.status(401).send('Invalid verification code');
  }

  res.send('Phone number verified successfully');
};


/**
 * @desc login user 
 * @route POST /api/auth/login
 * req - request object
 * res - response object
 * @return void
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password && !phone ) {
      res.status(400);
      throw new Error("All fields are mandatory!");
    }
    const user = await User.findOne({ email });
    //compare password with hashedpassword
    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = jwt.sign(
        {user},
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      res.status(201).json({success: true, "data": { accessToken, user }});
    } else {
      res.status(401);
      throw new Error("email or password is not valid");
    }
  } catch (error) {
    console.log(error);
    res.json({success: false, 'message': error.message});
  }
};

module.exports = { registerUser, loginUser }