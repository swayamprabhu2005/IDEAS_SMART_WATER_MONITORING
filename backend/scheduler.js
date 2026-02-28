const cron = require("node-cron");
const Reading = require("./models/Reading");
const ActiveUser = require("./models/ActiveUser");
const kmeans = require("./utils/kmeans");
const sendEmail = require("./utils/sendEmail");

cron.schedule("*/30 * * * *", async () => {
  console.log("Running 30-minute clustered email job...");

  try {    // 1️⃣ Get last 100 readings
    const readings = await Reading.find()
      .sort({ timestamp: -1 })
      .limit(100);

    if (!readings.length) return;

    // 2️⃣ Run KMeans
    const clustered = kmeans(readings);

    // 3️⃣ Count cluster sizes
    const clusterCounts = {};
    clustered.forEach(r => {
      clusterCounts[r.cluster] =
        (clusterCounts[r.cluster] || 0) + 1;
    });

    // 4️⃣ Find dominant cluster
    const dominantCluster = Object.keys(clusterCounts)
      .sort((a, b) => clusterCounts[b] - clusterCounts[a])[0];

    const dominantReadings = clustered.filter(
      r => r.cluster == dominantCluster
    );

    // 5️⃣ Compute representative value
    const avgPH =
      dominantReadings.reduce((sum, r) => sum + r.pH, 0) /
      dominantReadings.length;

    const avgTurbidity =
      dominantReadings.reduce((sum, r) => sum + r.turbidity, 0) /
      dominantReadings.length;

    // 6️⃣ Get active users (last 30 mins)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const activeUsers = await ActiveUser.find({
      lastActive: { $gte: thirtyMinutesAgo }
    });

    if (!activeUsers.length) return;

    // 7️⃣ Send email
    for (let user of activeUsers) {
      await sendEmail(
        user.email,
        "Water Quality Update (Clustered)",
        `Water Quality Report

Representative pH: ${avgPH.toFixed(2)}
Representative Turbidity: ${avgTurbidity.toFixed(2)} NTU`
      );
    }

    console.log("Clustered emails sent successfully!");

  } catch (err) {
    console.error(err);
  }
});