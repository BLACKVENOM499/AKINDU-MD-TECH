const {cmd , commands} = require('../command');
const axios = require("axios");

cmd({
    pattern: "download",
    alias: ["downurl"],
    use: ".download <link>",
    react: "⏳",
    desc: "Download file from direct link",
    category: "search",
    filename: __filename
},
async (conn, mek, m, {
    from,
    q,
    reply
}) => {
    try {
        // Check link
        if (!q) {
            return reply("Please give me a valid link");
        }

        const link = q.trim();

        const urlPattern = /^(https?:\/\/[^\s]+)/i;
        if (!urlPattern.test(link)) {
            return reply("This ulr is invalid !");
        }

        // Optional: Check link availability
        await axios.head(link).catch(() => {
            throw "❌ Can't open link";
        });

        const caption = `*ᴀᴋɪɴᴅᴜ-ᴍᴅ*`;

        // Send file as document
        await conn.sendMessage(from, {
            document: { url: link },
            mimetype: "video/mp4",
            fileName: `ᴀᴋɪɴᴅᴜ-ᴍᴅ`,
            caption: caption
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ Download failed!\n\n" + err);
    }
});
