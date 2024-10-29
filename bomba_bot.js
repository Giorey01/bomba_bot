import { TelegramClient } from "telegram";
import { StoreSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import readline from "readline";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";

const apiId = apiId;
const apiHash = "apiHash";
const storeSession = new StoreSession("Telegram_session");
const groupIds = ["1001084848351", "1001248318599", "1001152328869"];
const destinationChats = ["NUMERO"];
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const WhatsAppclient = new Client({
  authStrategy: new LocalAuth({
    dataPath: ".",
  }),
});

WhatsAppclient.once("ready", () => {
  console.log("Client is ready!");
});

WhatsAppclient.on("qr", (qr) => {
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

WhatsAppclient.on("authenticated", (session) => {
  console.log("WhatsApp client authenticated");
});

const Telegramclient = new TelegramClient(storeSession, apiId, apiHash, {
  connectionRetries: 5,
});

async function telegramConnection() {
  console.log("Loading interactive example...");
  await Telegramclient.start({
    phoneNumber: async () =>
      new Promise((resolve) =>
        rl.question("Please enter your number: ", resolve)
      ),
    password: async () =>
      new Promise((resolve) =>
        rl.question("Please enter your password: ", resolve)
      ),
    phoneCode: async () =>
      new Promise((resolve) =>
        rl.question("Please enter the code you received: ", resolve)
      ),
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
}

const startListening = async () => {
  await Telegramclient.connect();
  console.log("Client connesso e in ascolto di nuovi messaggi...");

  Telegramclient.addEventHandler(async (event) => {
    const message = event.message;
    const messageFrom = message.peerId.chatId.toString();
    if (
      groupIds.includes(messageFrom) &&
      message.message.toUpperCase().includes("BOMBA")
    ) {
      const messageText = message.message || "";
      destinationChats.forEach((destinationChat) => {
        WhatsAppclient.sendMessage(destinationChat, messageText);
      });
    }
  }, new NewMessage({}));
};

(async () => {
  await WhatsAppclient.initialize();
  await telegramConnection();
  await startListening();
})();
