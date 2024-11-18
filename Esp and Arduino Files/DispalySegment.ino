#include <SevSeg.h>

SevSeg sevseg; // Create an instance of the object
int displayValue = 0; // Start with 0

void setup() {
  byte numDigits = 4; // Number of digits in your display
  byte digitPins[] = {2, 3, 4, 5}; // The pins for the digits
  byte segmentPins[] = {6, 7, 8, 9, 10, 11, 12, 13}; // The pins for the segments

  // Configure the display
  sevseg.begin(COMMON_CATHODE, numDigits, digitPins, segmentPins);
  sevseg.setBrightness(90);

  Serial.begin(9600); // Open the serial connection at 9600 baud
}

void loop() {
  if (Serial.available() > 0) {
    String received = Serial.readStringUntil('\n');
    received.trim(); // Remove any whitespace or newline characters

    if (received == "incrementWhite") {
      displayValue++;
      if (displayValue > 9999) { // Roll over if it exceeds the display limit
        displayValue = 0;
      }
    }
    if (received == "incrementGold") {
      displayValue += 5;
      if (displayValue > 9999) { // Roll over if it exceeds the display limit
        displayValue = 0;
      }
    }

    if (received == "decrement" && displayValue !=0 ) {
      displayValue -= 10;
      if (displayValue < 0) { // Roll over if it exceeds the display limit
        displayValue = 0;
      }
    }
        if (received == "end") {
      displayValue = 0;      
    }
  }

  sevseg.setNumber(displayValue, 0); // Update the display
  sevseg.refreshDisplay(); // Must be called repeatedly
}
