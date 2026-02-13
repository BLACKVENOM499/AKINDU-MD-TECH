const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

// --- SONG COMMAND ---
cmd({
    pattern: "song",
    react: "🎵",
    desc: "Download YouTube MP3",
    category: "download",
    use: ".song <query>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("❓ *ᴡʜᴀᴛ sᴏɴɢ ᴅᴏ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ?*");

        const search = await yts(q);
        if (!search.videos.length) return reply("❌ *ɴᴏ ʀᴇsᴜʟᴛs ꜰᴏᴜɴᴅ.*");

        const data = search.videos[0];
        const api = `https://ominisave.vercel.app/api/ytmp3_v3?url=${encodeURIComponent(data.url)}`;
        const { data: apiRes } = await axios.get(api);

        if (!apiRes?.status || !apiRes.result?.downloadUrl) {
            return reply("❌ *ᴜɴᴀʙʟᴇ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ. ᴛʀʏ ᴀɴᴏᴛʜᴇʀ sᴏɴɢ.*");
        }

        const results = apiRes.result;
        const caption = `
┏━━━━━━━ 🎧 ━━━━━━━┓
  *ʏᴛ sᴏɴɢ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*
┗━━━━━━━━━━━━━━━━━┛

📑 *ᴛɪᴛʟᴇ:* ${data.title}
⏱️ *ᴅᴜʀᴀᴛɪᴏɴ:* ${data.timestamp}
📊 *ᴠɪᴇᴡs:* ${data.views}

🔢 *ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ɴᴜᴍʙᴇʀ:*

  1️⃣  *ᴀᴜᴅɪᴏ ꜰɪʟᴇ*
  2️⃣  *ᴅᴏᴄᴜᴍᴇɴᴛ ꜰɪʟᴇ*
  3️⃣  *ᴠᴏɪᴄᴇ ɴᴏᴛᴇ (ᴘᴛᴛ)*

> *ᴀᴋɪɴᴅᴜ-ᴍᴅ*`;

        const sentMsg = await conn.sendMessage(from, { image: { url: data.thumbnail }, caption }, { quoted: m });

        // Handler logic with cleanup
        const handler = async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg?.message) return;
            const text = (receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text || "").trim();
            if (receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId !== sentMsg.key.id) return;

            await conn.sendMessage(from, { react: { text: '📥', key: receivedMsg.key } });

            if (text === "1") {
                await conn.sendMessage(from, { audio: { url: results.downloadUrl }, mimetype: "audio/mpeg", ptt: false }, { quoted: receivedMsg });
            } else if (text === "2") {
                await conn.sendMessage(from, { document: { url: results.downloadUrl }, mimetype: "audio/mpeg", fileName: `${data.title}.mp3` }, { quoted: receivedMsg });
            } else if (text === "3") {
                await conn.sendMessage(from, { audio: { url: results.downloadUrl }, mimetype: "audio/mpeg", ptt: true }, { quoted: receivedMsg });
            }
            conn.ev.off("messages.upsert", handler); // Stop listening
        };

        conn.ev.on("messages.upsert", handler);
        setTimeout(() => conn.ev.off("messages.upsert", handler), 300000);

    } catch (e) { reply("❌ *ᴇʀʀᴏʀ ᴘʀᴏᴄᴇssɪɴɢ sᴏɴɢ.*"); }
});

// --- VIDEO COMMAND ---
cmd({
    pattern: "video",
    react: "🎬",
    desc: "Download YouTube MP4",
    category: "download",
    use: ".video <query>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("❓ *ᴡʜᴀᴛ ᴠɪᴅᴇᴏ ᴅᴏ ʏᴏᴜ ᴡᴀɴᴛ?*");

        const search = await yts(q);
        if (!search.videos.length) return reply("❌ *ɴᴏ ʀᴇsᴜʟᴛs ꜰᴏᴜɴᴅ.*");

        const data = search.videos[0];
        const caption = `
┏━━━━━━━ 📥 ━━━━━━━┓
  *ʏᴛ ᴠɪᴅᴇᴏ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*
┗━━━━━━━━━━━━━━━━━┛

📑 *ᴛɪᴛʟᴇ:* ${data.title}
⏱️ *ᴅᴜʀᴀᴛɪᴏɴ:* ${data.timestamp}

🔢 *ʀᴇᴘʟʏ ʙᴇʟᴏᴡ ɴᴜᴍʙᴇʀ*

🎥 *ᴠɪᴅᴇᴏ ꜰᴏʀᴍᴀᴛs:*
  🔹 1.1 - 360ᴘ (ʟᴏᴡ)
  🔹 1.2 - 720ᴘ (ʜᴅ)

📁 *ᴅᴏᴄᴜᴍᴇɴᴛ ꜰᴏʀᴍᴀᴛs:*
  🔹 2.1 - 360ᴘ (ꜰɪʟᴇ)
  🔹 2.2 - 720ᴘ (ꜰɪʟᴇ)

> *ᴀᴋɪɴᴅᴜ-ᴍᴅ*`;

        const sentMsg = await conn.sendMessage(from, { image: { url: data.thumbnail }, caption }, { quoted: m });

        const handler = async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg?.message) return;
            const text = (receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text || "").trim();
            if (receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId !== sentMsg.key.id) return;

            let quality = text.endsWith(".2") ? "720p" : "360p";
            let isDoc = text.startsWith("2");

            await conn.sendMessage(from, { react: { text: '⏳', key: receivedMsg.key } });

            const api = `https://ominisave.vercel.app/api/ytmp4_v2?url=${encodeURIComponent(data.url)}&quality=${quality}`;
            const { data: apiRes } = await axios.get(api);

            if (apiRes?.status && apiRes.result?.downloadUrl) {
                const media = isDoc ? { document: { url: apiRes.result.downloadUrl }, fileName: `${data.title}.mp4`, mimetype: "video/mp4" } 
                                    : { video: { url: apiRes.result.downloadUrl }, caption: `✅ ${quality} ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ` };
                
                await conn.sendMessage(from, media, { quoted: receivedMsg });
                conn.ev.off("messages.upsert", handler);
            } else {
                reply("❌ *ǫᴜᴀʟɪᴛʏ ɴᴏᴛ ᴀᴠᴀɪʟᴀʙʟᴇ.*");
            }
        };

        conn.ev.on("messages.upsert", handler);
        setTimeout(() => conn.ev.off("messages.upsert", handler), 300000);

    } catch (e) { reply("❌ *ᴇʀʀᴏʀ ᴘʀᴏᴄᴇssɪɴɢ ᴠɪᴅᴇᴏ.*"); }
});