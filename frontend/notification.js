export function showWaterAlert(pH, turbidity) {
  if (Notification.permission !== "granted") return;

  new Notification("⚠️ Water Alert", {
    body: `pH: ${pH} | Turbidity: ${turbidity}`,
  });
}
