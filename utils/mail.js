const nodemailer = require("nodemailer");

const path = require("path");
// Create transporter for sending emails using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com", // Brevo SMTP host
  port: 587, // Use 465 for SSL
  secure: false, // Set to true if using SSL (port 465)
  auth: {
    user: "88522e001@smtp-brevo.com", // Your Brevo SMTP username
    pass: "3H4Tk5br9v1pm6sF", // Your Brevo SMTP password or API key
  },
});

const sendInternshipApplicationEmail = async (formData, file) => {
  const { fullName, phone, email, level, department, coverLetter } = formData;

  const htmlContent = `
    <div style="font-family: Arial; padding: 20px;">
      <h2 style="color:#3C82C1;">📩 New Internship Application</h2>
      <p><strong>👤 Full Name:</strong> ${fullName}</p>
      <p><strong>📧 Email:</strong> ${email}</p>
      <p><strong>📱 Phone:</strong> ${phone}</p>
      <p><strong>🎓 Level:</strong> ${level}</p>
      <p><strong>🏢 Department:</strong> ${department}</p>
      <p><strong>📄 Cover Letter:</strong><br/>${coverLetter || "N/A"}</p>
    </div>
  `;

  const mailOptions = {
    from: "MS_xE5FH0@trial-z86org8pvmklew13.mlsender.net",
    to: "assal.mohammed.web@gmail.com",
    subject: "📥 New Internship Application Received",
    html: htmlContent,
    attachments: file
      ? [
          {
            filename: file.originalname,
            path: path.join(__dirname, "../", file.path),
          },
        ]
      : [],
  };

  await transporter.sendMail(mailOptions);
};

// Function to send an email
const sendEmailToUser = (id, code, firstName, userEmail) => {
  // HTML content with dynamic data
  const htmlContent = ` <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f6f6f6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); text-align: center; }
            h1 { font-size: 24px; margin-bottom: 20px; color: #02072C; }
            p { font-size: 18px; color: #02072C; line-height: 30px; }
            .btn { display: inline-block; background-color: #3C82C1; color: #ffffff !important; text-decoration: none; padding: 15px 17px; border-radius: 10px; font-size: 16px; width: 60%; font-weight: 600; }
            .btn:hover { background-color: #3c83c1e7; }
            .footer p { margin-top: 15px; font-size: 14px; color: #717070; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Email Verification</h1>
            <p>Hi ${firstName}, you're almost ready to get started. Please click below to verify your account!</p>
            <a href="https://www.quarkbooker.com/verify-email/${id}/${code}" class="btn">Verify your Account</a>
            <div class="footer">
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

  const mailOptions = {
    from: "quarkbooker@gmail.com",
    to: userEmail, // Recipient email
    subject: "Email Verification", // Subject
    text: `Hello ${firstName},\n\nYour verification code is: ${code}\n\nBest regards, Your Company Name`, // Text content
    html: htmlContent, // HTML content
  };

  // Send email using transporter
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent successfully:", info.response);
    }
  });
};

const sendEmailToPassword = (id, code, firstName, email) => {
  // HTML content with dynamic data
  const htmlContent = ` <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Forgot Password</title>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f6f6f6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); text-align: center; }
              h1 { font-size: 24px; margin-bottom: 20px; color: #02072C; }
              p { font-size: 18px; color: #02072C; line-height: 30px; }
              .btn { display: inline-block; background-color: #3C82C1; color: #ffffff !important; text-decoration: none; padding: 15px 17px; border-radius: 10px; font-size: 16px; width: 60%; font-weight: 600; }
              .btn:hover { background-color: #3c83c1e7; }
              .footer p { margin-top: 15px; font-size: 14px; color: #717070; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>reset password </h1>
              <p>Hi ${firstName}, you're almost ready to get started. Please click below to verify your account!</p>
              <a href="https://www.quarkbooker.com/forgot-password/${id}/${code}" class="btn">reset password</a>
              <div class="footer">
                <p>If you didn't request this, please ignore this email.</p>
              </div>
            </div>
          </body>
        </html>
      `;

  const mailOptions = {
    from: "quarkbooker@gmail.com",
    to: email,
    subject: "forgot password", // Subject
    text: `Hello ${firstName}`, // Text content
    html: htmlContent, // HTML content
  };

  // Send email using transporter
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent successfully:", info);
    }
  });
};
const sendEmailToEmail = (id, code, firstName, email) => {
  const htmlContent = ` 
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Change Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f6f6f6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); text-align: center; }
          h1 { font-size: 24px; margin-bottom: 20px; color: #02072C; }
          p { font-size: 18px; color: #02072C; line-height: 30px; }
          .btn { display: inline-block; background-color: #3C82C1; color: #ffffff !important; text-decoration: none; padding: 15px 17px; border-radius: 10px; font-size: 16px; width: 60%; font-weight: 600; }
          .btn:hover { background-color: #3c83c1e7; }
          .footer p { margin-top: 15px; font-size: 14px; color: #717070; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Email Change Request</h1>
          <p>Hi ${firstName}, you're almost ready to change your email address. Please click below to verify and confirm the change!</p>
          <a href="https://dashboard.quarkbooker.com/verify-email-change/${id}/${code}" class="btn">Verify Email Change</a>
          <div class="footer">
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  const mailOptions = {
    from: "quarkbooker@gmail.com",
    to: email,
    subject: "Email Change ",
    text: `Hello ${firstName}`,
    html: htmlContent,
  };

  // Send email using transporter
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent successfully:", info);
    }
  });
};

// Export the sendMail function
module.exports = {
  sendEmailToEmail,
  sendEmailToUser,
  sendEmailToPassword,
  sendInternshipApplicationEmail,
};
