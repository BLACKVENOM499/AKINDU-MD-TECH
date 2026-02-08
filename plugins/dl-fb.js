const axios = require("axios");
const { cmd } = require('../command');

cmd({
  pattern: "facebook",
  alias: ["fb"], 
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "❌ Please provide a valid Facebook video URL." }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // ✅ Fetching data from Aswin API
    const apiUrl = `https://api.vreden.my.id/api/v1/download/facebook?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data?.status || !data?.result || !data?.result?.download) {
      return reply("⚠️ Failed to retrieve Facebook media. Please check the link and try again.");
    }

    const { title, thumbnail } = data.result;
    const { sd, hd } = data.result.download;  
    
    const caption = `
\`📥 ꜰᴀᴄᴇʙᴏᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ 📥\`


📑 *Title:* ${title || "No title"}

🔗 *Link:* ${q}

🔢 *Reply Below Number*

1️⃣ *SD Quality*🪫
2️⃣ *HD Quality*🔋
3️⃣ *Audio (MP3)*🎶


> ᴀᴋɪɴᴅᴜ-ᴍᴅ`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    // 🧠 Interactive Reply System
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
              video: { url: sd },
              caption: "📥 *Downloaded in SD Quality*"
            }, { quoted: receivedMsg });
            break;

          case "2":
            await conn.sendMessage(senderID, {
              video: { url: hd },
              caption: "📥 *Downloaded in HD Quality*"
            }, { quoted: receivedMsg });
            break;

          case "3": 
            await conn.sendMessage(senderID, { 
              audio: { url: sd || hd}, 
              mimetype: "audio/mp4", 
              ptt: false 
          }, { quoted: receivedMsg }); 
          break;
            
           default:
            reply("❌ Invalid option! Please reply with 1, 2, or 3.");
        }
      }
    });

  } catch (error) {
    console.error("Facebook Plugin Error:", error);
    reply("❌ An error occurred while processing your request. Please try again later.");
  }
});
