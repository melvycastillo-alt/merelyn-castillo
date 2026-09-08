`/**
 * BOT MERELYN CASTILLO - Postres y Mas
 * Fase 2: Webhook para WhatsApp Cloud API
 * Autor: Merelyn Castillo - Desarrollado paso a paso
 * 
 * Este es el cerebro del BOT. Vive en Render.com 24/7
 * Traducion Clipper: Es como su .PRG principal que esta en un DO WHILE .T.
 */

const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// =================================================================
// CONFIGURACION - CAMBIE AQUI SUS 3 CLAVES
// =================================================================
const VERIFY_TOKEN = "merelyn_token_2026"; // Inventada por usted, debe coincidir con la de Facebook
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "EAAZAsp8n11b8BSY63j79cfb4SNwcGLJV5GR48PBvD4BiOuE4M2OStNStRnXFsirjXDI70TXm4XHwrryi3KXStI9ZB4aZBEMI1wO1GEgODYi9ZB5d2VRC7yZBTXgIZAZCMD3GTW8TstZCCZCBY8QcCUOI5R9J8tmCeVJcEOn2qV7hrwneq6MuqZBPddUF0cxRuAF5eV7wZDZD";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "1286648534534761"; // El ID de su linea 555

const PORT = process.env.PORT || 3000;

// =================================================================
// PASO 1: VERIFICACION DEL WEBHOOK - Meta verifica que usted es el dueno
// Esto se ejecuta UNA SOLA VEZ cuando pega la URL en developers.facebook.com
// =================================================================
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log("Recibiendo verificacion de Meta...");

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK VERIFICADO CORRECTAMENTE!');
      res.status(200).send(challenge);
    } else {
      console.log('Token de verificacion no coincide');
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// =================================================================
// PASO 2: RECEPCION DE MENSAJES - Aqui es donde el cliente escribe
// =================================================================
app.post('/webhook', async (req, res) => {
  const body = req.body;

  // Verificamos que es un mensaje de WhatsApp
  if (body.object === 'whatsapp_business_account') {
    
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message) {
      const from = message.from; // Numero del cliente: 18297894944
      const text = message.text?.body?.toLowerCase() || "";
      
      console.log(`Mensaje recibido de ${from}: ${text}`);

      let respuesta = "";

      // LOGICA DEL MENU - Aqui es donde usted definio el proceso en papel
      if (text.includes("hola") || text.includes("menu") || text === "") {
        respuesta = `¡Hola! 🍰 Gracias por Preferir a *MERELYN CASTILLO Postres y Más* 😊

Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?

*1️⃣* Ver Catálogo de Postres
*2️⃣* Pedido Personalizado (Tamaño / Sabor / Mensaje)
*3️⃣* Consultar Estado de mi Pedido
*4️⃣* Hablar con una Asesora

Responde con el número de la opción (1, 2, 3 o 4).`;
      } 
      else if (text === "1") {
        respuesta = `🍰 *CATÁLOGO MERELYN CASTILLO*

1. Tres Leches Clásico - RD$ 1,200
2. Torta de Chocolate - RD$ 1,500
3. Cheesecake de Fresa - RD$ 1,800
4. Brownies x12 - RD$ 800

Para ordenar, escribe *2* y dime qué deseas.`;
      }
      else if (text === "2") {
        respuesta = `¡Perfecto! Vamos con tu pedido personalizado 📝

Por favor dime en un solo mensaje:
- Qué postre quieres
- Para cuántas personas
- Qué mensaje lleva (si es para cumpleaños)

Ejemplo: *Tres leches para 10 personas, que diga Feliz Cumpleaños Mami*`;
      }
      else if (text === "3") {
        respuesta = `Para consultar el estado de tu pedido, por favor envíame tu número de pedido o tu nombre completo y te digo en qué va. 🚚`;
      }
      else if (text === "4") {
        respuesta = `¡Claro! En un momento una asesora de MERELYN te atenderá personalmente. Mientras tanto, si quieres dejar tu pedido escrito, lo adelantas. 👩‍🍳`;
      }
      else {
        // Mensaje por defecto - Aqui guardaremos en Google Sheet mas adelante
        respuesta = `¡Anotado! 📝 Recibí: "${message.text.body}"

Un momento por favor, estoy registrando tu pedido para el equipo de MERELYN.

Si quieres ver el menú de nuevo, escribe *Hola*`;
        
        // TODO FASE 3: Aqui conectaremos con Google Sheets
        // guardarEnSheet(from, message.text.body);
      }

      // ENVIAR RESPUESTA AL CLIENTE
      await enviarMensajeWhatsApp(from, respuesta);
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// =================================================================
// FUNCION PARA ENVIAR MENSAJE - Esta es la que usa su ACCESS_TOKEN
// =================================================================
async function enviarMensajeWhatsApp(to, text) {
  try {
    const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;
    
    const data = {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: text }
    };

    const headers = {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    };

    const response = await axios.post(url, data, { headers });
    console.log(`Mensaje enviado a ${to}:`, response.data);
  } catch (error) {
    console.error("Error enviando mensaje:", error.response?.data || error.message);
  }
}

app.get('/', (req, res) => {
  res.send('BOT MERELYN CASTILLO - Activo y escuchando! 🍰');
});

app.listen(PORT, () => {
  console.log(`Servidor del BOT MERELYN corriendo en puerto ${PORT}`);
});
