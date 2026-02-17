#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "Redmi";
const char* password = "17216401";

const char* serverName = "http://198.13.1.8:5000/api/readings";

#define PH_PIN 34
#define TURBIDITY_PIN 35

#define ADC_RESOLUTION 4095.0
#define VREF 3.3

float PH_OFFSET = 0.0;      
float PH_SLOPE = -5.70;     

float TURB_A = -1120.4;
float TURB_B = 5742.3;
float TURB_C = -4352.9;


int readAverage(int pin) {
  long sum = 0;
  for (int i = 0; i < 20; i++) {
    sum += analogRead(pin);
    delay(10);
  }
  return sum / 20;
}

float convertToVoltage(int adcValue) {
  return (adcValue / ADC_RESOLUTION) * VREF;
}

float convertToPH(float voltage) {
  float phValue = 7 + ((2.5 - voltage) / 0.18);
  phValue = phValue + PH_OFFSET;
  return phValue;
}

float convertToNTU(float voltage) {
  float ntu = TURB_A * voltage * voltage + TURB_B * voltage + TURB_C;
  if (ntu < 0) ntu = 0;
  return ntu;
}

void setup() {
  Serial.begin(115200);

  analogReadResolution(12);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {

  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;

    int phADC = readAverage(PH_PIN);
    int turbADC = readAverage(TURBIDITY_PIN);

    float phVoltage = convertToVoltage(phADC);
    float turbVoltage = convertToVoltage(turbADC);

    float phValue = convertToPH(phVoltage);
    float turbidity = convertToNTU(turbVoltage);

    Serial.println("------ Sensor Data ------");
    Serial.print("pH ADC: "); Serial.println(phADC);
    Serial.print("pH Voltage: "); Serial.println(phVoltage);
    Serial.print("pH Value: "); Serial.println(phValue);

    Serial.print("Turbidity ADC: "); Serial.println(turbADC);
    Serial.print("Turbidity Voltage: "); Serial.println(turbVoltage);
    Serial.print("Turbidity (NTU): "); Serial.println(turbidity);
    Serial.println("-------------------------");

    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    String jsonData = "{";
    jsonData += "\"pH\":" + String(phValue, 2) + ",";
    jsonData += "\"turbidity\":" + String(turbidity, 2);
    jsonData += "}";

    int httpResponseCode = http.POST(jsonData);

    Serial.print("HTTP Response Code: ");
    Serial.println(httpResponseCode);

    http.end();

  } else {
    Serial.println("WiFi Disconnected. Reconnecting...");
    WiFi.begin(ssid, password);
  }

  delay(5000);
}
