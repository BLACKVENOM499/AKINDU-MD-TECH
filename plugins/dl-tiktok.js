const axios = require("axios");
const { cmd } = require('../command');

cmd({
  pattern: "tiktok",
  alias: ["tt"],
  desc: "Download TikTok videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return reply("❌ *ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ᴛɪᴋᴛᴏᴋ ᴜʀʟ*");
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // ✅ API Request
    const response = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/tiktok?url=${q}`);
    const data = response.data;

    if (!data || !data.status || !data.data) {
      return reply("⚠️ *ꜰᴀɪʟᴇᴅ ᴛᴏ ʀᴇᴛʀɪᴇᴠᴇ ᴍᴇᴅɪᴀ. ᴛʀʏ ᴀɢᴀɪɴ.*");
    }
    
    const dat = data.data;
    
    // ✨ Stylish Caption Layout
    const caption = `
┏━━━━━━━ 📥 ━━━━━━━┓
  *ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*
┗━━━━━━━━━━━━━━━━━┛

📑 *ᴛɪᴛʟᴇ:* ${dat.title || "No title"}
⏱️ *ᴅᴜʀᴀᴛɪᴏɴ:* ${dat.duration || "N/A"}

📊 *sᴛᴀᴛs:*
  ❤️ ${dat.view || "0"} | 💬 ${dat.comment || "0"} | 🔁 ${dat.share || "0"}

🔢 *ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ɴᴜᴍʙᴇʀ:*

  1️⃣  *ᴠɪᴅᴇᴏ (ʜᴅ ǫᴜᴀʟɪᴛʏ)*
  2️⃣  *ᴀᴜᴅɪᴏ (ᴍᴘ3 ꜰɪʟᴇ)*

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴀᴋɪɴᴅᴜ-ᴍᴅ*`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: dat.thumbnail },
      caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    // 🧠 Interaction Handler
    const handler = async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg?.message) return;

      const receivedText = (receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text || "").trim();
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot) {
        await conn.sendMessage(from, { react: { text: '📥', key: receivedMsg.key } });

        if (receivedText === "1") {
          await conn.sendMessage(from, {
            video: { url: dat.video },
            caption: `✅ *ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ:* ${dat.title || "TikTok Video"}\n\n> *ᴀᴋɪɴᴅᴜ-ᴍᴅ*`
          }, { quoted: receivedMsg });
          conn.ev.off("messages.upsert", handler); // Stop listening after success
        } 
        else if (receivedText === "2") {
          await conn.sendMessage(from, {
            audio: { url: dat.audio },
            mimetype: "audio/mpeg",
            ptt: false
          }, { quoted: receivedMsg });
          conn.ev.off("messages.upsert", handler); // Stop listening after success
        }
      }
    };

    conn.ev.on("messages.upsert", handler);

    // Auto-cleanup listener after 5 minutes
    setTimeout(() => {
      conn.ev.off("messages.upsert", handler);
    }, 300000);

  } catch (error) {
    console.error("TikTok Plugin Error:", error);
    reply("❌ *ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ.*");
  }
});