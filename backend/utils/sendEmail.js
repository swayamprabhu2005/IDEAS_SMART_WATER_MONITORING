const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your_email@gmail.com",
        pass: "your_app_password"
    }
});

const sendEmail = async (to, subject, text) => {
    await transporter.sendMail({
        from: "your_email@gmail.com",
        to,
        subject,
        text
    });
};

module.exports = sendEmail;