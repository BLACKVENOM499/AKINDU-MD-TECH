const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "apk",
  react: '⏳',
  desc: "Download APK files using NexOracle API.",
  category: "download",
  use: ".apk <app name>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    const appName = args.join(" ");
    if (!appName) {
      return reply('Please provide an app name. Example: `.apk whatsapp`');
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://api.nexoracle.com/downloader/apk`;
    const params = {
      apikey: 'free_key@maher_apis', 
      q: appName,
    };

    const response = await axios.get(apiUrl, { params });

    if (!response.data || response.data.status !== 200 || !response.data.result) {
      return reply('❌ Unable to find the APK. Please try again later.');
    }

    const { name, lastup, package, size, icon, dllink } = response.data.result;

    // 1. Send Status Message (Forwarding info removed)
    await conn.sendMessage(from, {
      image: { url: icon },
      caption: `📦 *Downloading ${name}... Please wait.*`
    }, { quoted: mek });

    // Download the APK
    const apkResponse = await axios.get(dllink, { responseType: 'arraybuffer' });
    if (!apkResponse.data) {
      return reply('❌ Failed to download the APK.');
    }

    const apkBuffer = Buffer.from(apkResponse.data, 'binary');

    const message = `
\`📥 ᴀᴘᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ 📥\`


🔖 *Name*: ${name}

📅 *Last Update*: ${lastup}

📦 *Pᴀᴄᴋᴀɢᴇ*: ${package}

📏 *Size*: ${size}


> ᴀᴋɪɴᴅᴜ-ᴍᴅ`;

    // 2. Send the APK Document (Forwarding and context info removed)
    await conn.sendMessage(from, {
      document: apkBuffer,
      mimetype: 'application/vnd.android.package-archive',
      fileName: `${name}.apk`,
      caption: message
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error:', error);
    reply('❌ Error fetching APK.');
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});