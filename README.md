Smart Water Monitoring System is an IoT-enabled water quality monitoring platform that:

● Collects real-time pH and Turbidity data

● Sends sensor readings using ESP32 over WiFi

● Stores data in MongoDB

● Displays analytics using a dynamic web dashboard

● Applies K-Means clustering to classify water quality

● Provides safety evaluation based on WHO standards

● This project bridges hardware + IoT + backend + frontend + data science into one integrated system.

![CONNECTIONS](https://github.com/user-attachments/assets/7775fc7f-e3b0-4fa4-88d3-05eb9224085f)

I) Hardware Layer
   1) ESP32 Microcontroller
    
   2) pH Sensor
   
   3) Turbidity Sensor

Data Flow:
Sensors → ESP32 → WiFi → HTTP POST → Backend Server → MongoDB → Dashboard

II) Frontend Dashboard

Built using: 
i. HTML

ii. CSS
            
iii. JavaScript
             
iV. Chart.js
             
III)Backend (Node.js + Express)

Features:

i) REST API (/api/readings)

ii) Stores sensor data in MongoDB

iii) Uses Axios for API calls

iV) Applies clustering logic
