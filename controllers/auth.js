const User = require("../models/user");
const { hashPassword, comparePassword } = require("../utils/auth");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const { nanoid } = require("nanoid");



const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const SES = new AWS.SES(awsConfig);

exports.sendRegisterEmail = async (req, res) => {
      // send verifcation email 
  const { email } = req.body;

  try {
    const params = {
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: [email],
      },
      ReplyToAddresses: [process.env.EMAIL_FROM],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
            <html>
                <h1>Verify email</h1>
                <p>Please use the following link to verify your email</p>
            </html>
            `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Email verification link",
        },
      },
    };

    const emailSent = SES.sendEmail(params).promise();
  
    emailSent.then((data) => {
      console.log(data);
      res.json({ ok: true });
    })
  } catch (err) {
    console.log(err);
  }
}

exports.register = async (req, res) => {
  try {
    // console.log(req.body);
    const { name, email, password } = req.body;
    // validation
    if (!name) return res.status(400).send("Name is required");
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send("Password is required and should be min 6 characters long");
    }
    let userExist = await User.findOne({ email }).exec();
    if (userExist) return res.status(400).send("Email is taken");

    // hash password
    const hashedPassword = await hashPassword(password);

    // register
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    // console.log("saved user", user);
    return res.json({ ok: true });

    // send verifcation email 
    // const params = {
    //   Source: process.env.EMAIL_FROM,
    //   Destination: {
    //     ToAddresses: [email],
    //   },
    //   ReplyToAddresses: [process.env.EMAIL_FROM],
    //   Message: {
    //     Body: {
    //       Html: {
    //         Charset: "UTF-8",
    //         Data: `
    //         <html>
    //             <h1>Verify email</h1>
    //             <p>Please use the following link to verify your email</p>
    //         </html>
    //         `,
    //       },
    //     },
    //     Subject: {
    //       Charset: "UTF-8",
    //       Data: "Email verification link",
    //     },
    //   },
    // };
  
    // const emailSent = SES.sendEmail(params).promise();
  
    // emailSent.then((data) => {
    //   console.log(data);
    //   res.json({ ok: true });
    // })

    // send verification email 
    // const params = {
    //   Source: process.env.EMAIL_FROM,
    //   Destination: {
    //     ToAddresses: [email]
    //   },
    //   Message: {
    //     Body: {
    //       Html: {
    //         Charset: "UTF-8",
    //         Data: `
    //           <html>
    //             <h1>Reset password</h1>
    //             <p>Use this code to reset your password</p>
    //             <h2 style="color: red;">${shortCode}</h2>
    //             <1>GijsArtAcademy.com>/i>
    //           </html>
    //         `,
    //       },
    //     },
    //     Subject: {
    //       Charset: "UTF-8",
    //       Data: "Reset Password",
    //     },
    //   },
    // };
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

exports.login = async (req, res) => {
  try {
    // console.log(req.body);
    const { email, password } = req.body;
    // check if our db has user with that email
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).send("No user found");
    // check password
    const match = await comparePassword(password, user.password);
    if (!match) return res.status(400).send("Wrong password");
    // create signed jwt
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // return user and token to client, exclude hashed password
    user.password = undefined;
    // send token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // only works on https
    });
    // send user as json response
    res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ message: "Signout success" });
  } catch (err) {
    console.log(err);
  }
};

exports.currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").exec();
    console.log("CURRENT_USER", user);
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

exports.sendTestEmail = async (req, res) => {
  // console.log("send email using SES");
  // res.json({ ok: true });
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: ["g.machielsen@gmail.com"],
    },
    ReplyToAddresses: [process.env.EMAIL_FROM],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
          <html>
              <h1>Reset password link</h1>
              <p>Please use the following link to reset your password</p>
          </html>
          `,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Password reset link",
      },
    },
  };

  const emailSent = SES.sendEmail(params).promise();

  emailSent.then((data) => {
    console.log(data);
    res.json({ ok: true });
  })
  .catch((err) => {
    console.log(err);
  }); 
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // console.log(email);
    const shortCode = nanoid(6).toUpperCase();
    const user = await User.findOneAndUpdate(
      { email },
      { passwordResetCode: shortCode }
    );
    if (!user) return res.status(400).send("User not found");

    // prepare for email
    const params = {
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
              <html>
                <h1>Reset password</h1>
                <p>Use this code to reset your password</p>
                <h2 style="color: red;">${shortCode}</h2>
                <1>GijsArtAcademy.com>/i>
              </html>
            `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Reset Password",
        },
      },
    };

    const emailSent = SES.sendEmail(params).promise();
    emailSent.then((data) => {
      console.log(data);
      res.json({ ok: true });
    })
    .catch((err) => {
      console.log(err);
    });
  } catch (err) {
    console.log(err);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword} = req.body;
    // console.table({ email, code, newPassword });
    const hashedPassword = await hashPassword(newPassword);

    const user = User.findOneAndUpdate(
      {
        email,
        passwordResetCode: code,
      },
      {
        password: hashedPassword,
        passwordResetCode: "",
      }
    ).exec();
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error! Try again.");
  }
};