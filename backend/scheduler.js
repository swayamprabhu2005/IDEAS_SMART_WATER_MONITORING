const cron = require("node-cron");
const Reading = require("./models/Reading");
const supabase = require("./config/supabase");
const sendEmail = require("./utils/sendEmail");

cron.schedule("*/30 * * * *", async () => {
    console.log("Running 30-minute email job...");

    try {
        // 1️⃣ Get latest reading
        const latest = await Reading.findOne().sort({ timestamp: -1 });

        if (!latest) return;

        // 2️⃣ Get users from Supabase
        const { data: users, error } = await supabase.auth.admin.listUsers();

        if (error) {
            console.error(error);
            return;
        }

        // 3️⃣ Send email to each user
        for (let user of users.users) {
            await sendEmail(
                user.email,
                "Water Quality Update",
                `Latest Water Reading:
pH: ${latest.pH}
Turbidity: ${latest.turbidity}`
            );
        }

        console.log("Emails sent successfully!");

    } catch (err) {
        console.error(err);
    }

});