export async function requestNotificationPermission() {
  if ("Notification" in window) {
    if (Notification.permission !== "granted") {
      await Notification.requestPermission();
    }
  }
}

export function showWaterAlert(pH, turbidity) {
  if (Notification.permission !== "granted") return;

  new Notification("⚠️ Water Quality Alert", {
    body: `pH: ${pH.toFixed(2)} | Turbidity: ${turbidity.toFixed(2)} NTU`,
  });
}