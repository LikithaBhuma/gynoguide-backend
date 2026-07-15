import db from "../config/db.js";

import bcrypt from "bcrypt";


import dotenv from "dotenv";
import transporter from "../config/mail.js";
import jwt from "jsonwebtoken";


dotenv.config();

export const register = async (req, res) => {

try{

const{

name,

email,

password

}=req.body;

const[user]=await db.query(

"SELECT * FROM users WHERE email=?",

[email]

);

if(user.length>0){

return res.status(400).json({

message:"User already exists"

});

}

const hashedPassword=await bcrypt.hash(password,10);

await db.query(

"INSERT INTO users(name,email,password) VALUES(?,?,?)",

[name,email,hashedPassword]

);

res.status(201).json({

message:"Registration Successful"

});

}

catch(err){

console.log(err);

res.status(500).json({

message:"Server Error"

});

}

};

export const login=async(req,res)=>{

try{

const{

email,

password

}=req.body;

const[user]=await db.query(

"SELECT * FROM users WHERE email=?",

[email]

);

if(user.length===0){

return res.status(404).json({

message:"User not found"

});

}

const validPassword=await bcrypt.compare(

password,

user[0].password

);

if(!validPassword){

return res.status(401).json({

message:"Invalid Password"

});

}

const token=jwt.sign(

{

id:user[0].id,

email:user[0].email

},

process.env.JWT_SECRET,

{

expiresIn:"7d"

}

);

res.json({

message:"Login Successful",

token,

user:{

id:user[0].id,

name:user[0].name,

email:user[0].email

}

});

}

catch(err){

console.log(err);

res.status(500).json({

message:"Server Error"

});

}

};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE email=?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const token = jwt.sign(
      { id: users[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const link = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await transporter.sendMail({
  from: `"GynoGuide AI" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Reset Your GynoGuide AI Password",
  html: `
    <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;border:1px solid #ddd;border-radius:10px;overflow:hidden;">

      <div style="background:#e91e63;padding:20px;text-align:center;color:white;">
        <h1>GynoGuide AI</h1>
      </div>

      <div style="padding:30px;">

        <h2>Hello,</h2>

        <p>
          We received a request to reset your password for your
          <strong>GynoGuide AI</strong> account.
        </p>

        <p>
          Click the button below to create a new password.
        </p>

        <div style="text-align:center;margin:35px 0;">

          <a
            href="${link}"
            style="
              background:#e91e63;
              color:#ffffff;
              text-decoration:none;
              padding:14px 30px;
              border-radius:8px;
              display:inline-block;
              font-size:16px;
              font-weight:bold;
            "
          >
            Reset Password
          </a>

        </div>

        <p>
          This link will expire in
          <strong>15 minutes</strong>.
        </p>

        <p>
          If you didn't request a password reset,
          you can safely ignore this email.
        </p>

        <hr>

        <p style="font-size:14px;color:#666;">
          Regards,<br>
          <strong>GynoGuide AI Team</strong>
        </p>

      </div>

    </div>
  `,
});

    res.json({
      message: "Password reset link sent to your email.",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const { password } = req.body;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "UPDATE users SET password=? WHERE id=?",
      [hashed, decoded.id]
    );

    res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(400).json({
      message: "Invalid or expired token",
    });
  }
};

