const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "merelyn_token_2026";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("BOT Merelyn Castillo Postres y Mas - Activo ✅");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message) {
      const from = message.from;
      const text = message.text?.body?.toLowerCase() || "";
      console.log(`Mensaje de ${from}: ${text}`);

      let reply = "";

      if (text.includes("hola") || text.includes("menu") || text.includes("buenas")) {
        reply = "Hola! Soy el bot de Merelyn Castillo Postres y Mas 🍰\n\nEscribe:\n1 - Menu\n2 - Precios\n3 - Pedidos\n4 - Horarios";
      } else if (text.includes("1") || text.includes("menu")) {
        reply = "🍰 MENU:\n- Tres leches\n- Brownies\n- Cheesecake\n- Flan\n- Bizcochos\n\nQue deseas ordenar?";
      } else if (text.includes("2") || text.includes("precio")) {
        reply = "💰 Precios desde $350 RD. Escribenos que postre quieres y te cotizamos!";
      } else if (text.includes("3") || text.includes("pedido")) {
        reply = "📦 Para pedidos escribenos tu nombre, direccion y que postre quieres. Te respondemos en breve!";
      } else if (text.includes("4") || text.includes("horario")) {
        reply = "🕒 Horario: Lun-Sab 9am-7pm, Dom 10am-4pm. Villa Gonzalez.";
      } else {
        reply = "Gracias por escribir a Merelyn Castillo Postres y Mas! Un momento te atiende una persona 🍰";
      }

      await axios.post(
        `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: reply }
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.sendStatus(200);
  }
});

app.listen(PORT, () => {
  console.log(`Bot corriendo en puerto ${PORT}`);
});
