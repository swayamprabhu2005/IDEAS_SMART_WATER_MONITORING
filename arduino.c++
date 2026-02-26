#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "Redmi Note 13 5G";
const char* password = "12344321";

const char* serverName = "http://10.233.183.176:5000/api/data";

#define PH_PIN 34
#define TURBIDITY_PIN 35

#define ADC_RESOLUTION 4095.0
#define VREF 3.3

// Calibrated pH reference voltage
float PH_REF_VOLTAGE = 2.1;

// Turbidity constants
float TURB_A = -1120.4;
float TURB_B = 5742.3;
float TURB_C = -4352.9;


// Stable averaging (from previous code)
int averageRead(int pin, int samples = 30) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delay(10);
  }
  return sum / samples;
}

void setup() {

  Serial.begin(115200);

  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}


void loop() {

  int phRaw  = averageRead(PH_PIN);
  int turbRaw = averageRead(TURBIDITY_PIN);

  float phVoltage  = phRaw * (VREF / ADC_RESOLUTION);
  float turbVoltage = turbRaw * (VREF / ADC_RESOLUTION);

  // Calibrated pH formula
  float pH = 7 + ((1.9 - phVoltage) * 9.5);

  // Turbidity formula
 // float turbidityNTU = TURB_A * turbVoltage * turbVoltage +
  //                     TURB_B * turbVoltage +
  //                     TURB_C;

  float turbidityNTU = (3.3 - turbVoltage) * 300;

  if (turbidityNTU < 0)
    turbidityNTU = 0;


  Serial.println("------ Water Quality ------");

  Serial.print("pH Raw: ");
  Serial.println(phRaw);

  Serial.print("pH Voltage: ");
  Serial.println(phVoltage, 3);

  Serial.print("pH Value: ");
  Serial.println(pH, 2);

  Serial.print("Turbidity Raw: ");
  Serial.println(turbRaw);

  Serial.print("Turbidity Voltage: ");
  Serial.println(turbVoltage, 3);

  Serial.print("Turbidity (NTU): ");
  Serial.println(turbidityNTU, 1);

  Serial.println("--------------------------");


  // Send to Server
  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;

    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    String jsonData = "{";
    jsonData += "\"pH\":" + String(pH, 2) + ",";
    jsonData += "\"turbidity\":" + String(turbidityNTU, 2);
    jsonData += "}";

    int httpResponseCode = http.POST(jsonData);

    Serial.print("HTTP Response Code: ");
    Serial.println(httpResponseCode);

    http.end();

  }
  else {

    Serial.println("WiFi Disconnected → Reconnecting");

    WiFi.begin(ssid, password);
  }

  delay(2000);
}