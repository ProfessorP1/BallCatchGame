#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

const char* ssid = "BallCatchGame";
const char* password = "BallCatchGame123!?";

// WebSocket-Client-Instanz erstellen
WebSocketsClient webSocket;
unsigned long lastConnectionAttempt = 0;
bool shouldSendCommand = true; // Flag, das steuert, ob ein Befehl gesendet wird

void onWebSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket Disconnected");
      break;
    case WStype_CONNECTED:
      Serial.println("WebSocket Connected");
      break;
    case WStype_TEXT:
      Serial.printf("WebSocket message: %s\n", payload);

      // JSON-Dokument erstellen
      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, payload, length);

      if (error) {
        Serial.print(F("deserializeJson() failed: "));
        Serial.println(error.f_str());
        return;
      }

      // Überprüfen, ob die Nachricht das richtige Format hat
      if (doc.containsKey("type") && doc["type"] == "action" && doc.containsKey("content")) {
        String content = doc["content"].as<String>();

        // Reagiere nur auf die relevanten "action" Nachrichten
        if (content == "incrementWhite") {
          Serial.write("incrementWhite\n");
        }
        else if (content == "incrementGold") {
          Serial.write("incrementGold\n");
        }
        else if (content == "decrement") {
          Serial.write("decrement\n");
        }
        else if (content == "end") {
          Serial.write("end\n");
        }
      }
      break;
  }
}

void setup() {
  Serial.begin(9600);
  // Verbindung mit WLAN herstellen
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");

  // WebSocket-Verbindung initialisieren
  webSocket.begin("ballcatch.glitch.me", 80, "/"); // Ersetze durch deine WebSocket-Server-URL
  webSocket.onEvent(onWebSocketEvent);
  webSocket.setReconnectInterval(5000); // Versuche alle 5 Sekunden neu zu verbinden, falls die Verbindung verloren geht
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    unsigned long currentMillis = millis();
    if (currentMillis - lastConnectionAttempt >= 5000) { // Alle 5 Sekunden erneut versuchen
      lastConnectionAttempt = currentMillis;
      Serial.println("Attempting to reconnect to WiFi...");
      WiFi.begin(ssid, password);
    }
    static unsigned long lastPing = 0;
    if (millis() - lastPing > 10000) { // Alle 10 Sekunden
      webSocket.sendPing();
      lastPing = millis();
      webSocket.loop();
    }
  } else {
    webSocket.loop(); // WebSocket-Verbindung aufrechterhalten
  }
}