const axios = require("axios");
const { cmd } = require('../command');

cmd({
  pattern: "twitter",
  desc: "Download Twitter videos and audio",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "❌ Please provide a valid Twitter URL." }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // ✅ Using the Sadiya API
    const response = await axios.get(`https://ty-opal-eta.vercel.app/download/twitter?url=${q}`);
    const data = response.data;

    if (!data || !data.status || !data.result) {
      return reply("⚠️ Failed to retrieve Twitter media. Please check the link and try again.");
    }

    const { desc, thumb, video_sd, video_hd, audio } = data.result;

    const caption = `
\`📥 𝐓𝐖𝐈𝐓𝐓𝐄𝐑 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 📥\`

📑 *Description:* ${desc || "No description"}
🔗 *Link:* ${q}

🔢 *Reply Below Number*

1️⃣ *SD Quality*🪫
2️⃣ *HD Quality*🔋
3️⃣ *Audio (MP3)*🎶
4️⃣ *Audio*🎶

> *ᴀᴋɪɴᴅᴜ-ᴍᴅ*`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumb },
      caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    // 🧠 Reply-based selector
    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg?.message) return;

      const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
      const senderID = receivedMsg.key.remoteJid;
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot) {
        await conn.sendMessage(senderID, { react: { text: '⏳', key: receivedMsg.key } });

        switch (receivedText.trim()) {
          case "1":
            await conn.sendMessage(senderID, {
              video: { url: video_sd },
              caption: "📥 *Downloaded in SD Quality*"
            }, { quoted: receivedMsg });
            break;

          case "2":
            await conn.sendMessage(senderID, {
              video: { url: video_hd },
              caption: "📥 *Downloaded in HD Quality*"
            }, { quoted: receivedMsg });
            break;

          case "3":
            await conn.sendMessage(senderID, {
              audio: { url: video_sd || video_hd },
              mimetype: "audio/mp4",
              ptt: false
            }, { quoted: receivedMsg });
            break;

          case "4":
            await conn.sendMessage(senderID, {
              audio: { url: audio },
              mimetype: "audio/mp4",
              ptt: false
            }, { quoted: receivedMsg });
            break;

          default:
            reply("❌ Invalid option! Please reply with 1, 2, 3, or 4.");
        }
      }
    });

  } catch (error) {
    console.error("Twitter Plugin Error:", error);
    reply("❌ An error occurred while processing your request. Please try again later.");
  }
});