let characteristic;
let lastStatus = "";

function log(message) {
  const logBox = document.getElementById("log");
  logBox.innerHTML += message + "<br>";
  logBox.scrollTop = logBox.scrollHeight;
}

async function connect() {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ name: "POSTURA_V3" }],
    optionalServices: ["12345678-1234-1234-1234-1234567890ab"]
  });

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService("12345678-1234-1234-1234-1234567890ab");
  characteristic = await service.getCharacteristic("abcd1234-5678-1234-5678-abcdef123456");

  characteristic.startNotifications();
  characteristic.addEventListener("characteristicvaluechanged", handleData);

  log("🔗 Connected to POSTURA device");
}

function handleData(event) {
  let value = new TextDecoder().decode(event.target.value);
  let data = value.split(",");

  let angle = data[0];
  let deviation = data[1];
  let status = data[2];
  let score = data[3];
  let count = data[4];

  document.getElementById("angle").innerText = angle;
  document.getElementById("deviation").innerText = deviation;
  document.getElementById("status").innerText = status;
  document.getElementById("score").innerText = score;
  document.getElementById("count").innerText = count;

  let decision = "Monitoring";
  let reason = "Posture within threshold";
  let vibration = "OFF";

  if (status === "BAD") {
    decision = "Correcting Posture";
    reason = "Deviation exceeded threshold";
    vibration = "ON";
  }

  document.getElementById("decision").innerText = decision;
  document.getElementById("reason").innerText = reason;
  document.getElementById("vibration").innerText = vibration;

  if (status !== lastStatus) {
    if (status === "BAD") {
      log("⚠️ Slouch detected → Action triggered");
    } else {
      log("✅ Posture corrected");
    }
    lastStatus = status;
  }
}
