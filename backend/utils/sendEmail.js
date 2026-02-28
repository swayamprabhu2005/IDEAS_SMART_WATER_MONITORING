const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "watermonitoringsmart@gmail.com",
        pass: "vgarrdejttxonogo"
    }
});

const sendEmail = async (to, subject, text) => {
    await transporter.sendMail({
        from: "watermonitoringsmart@gmail.com",
        to,
        subject,
        text
    });
};

module.exports = sendEmail;