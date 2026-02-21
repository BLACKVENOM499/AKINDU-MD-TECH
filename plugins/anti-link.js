const { cmd } = require('../command');
const config = require("../config");

cmd({
    'on': "body"
}, async (conn, m, store, {
    from,
    body,
    sender,
    isGroup,
    isAdmins,
    isBotAdmins,
    reply
}) => {
    try {
        // Initialize warnings if not exists
        if (!global.warnings) {
            global.warnings = {};
        }

        // Only act in groups where bot is admin and sender isn't admin
        if (!isGroup || isAdmins || !isBotAdmins) {
            return;
        }

        // List of link patterns to detect
        const linkPatterns = [
            /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
            /https?:\/\/(?:api\.whatsapp\.com|wa\.me)\/\S+/gi,
            /wa\.me\/\S+/gi,
            /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,
            /https?:\/\/(?:www\.)?\.com\/\S+/gi,
            /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,
            /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,
            /https?:\/\/(?:whatsapp\.com|channel\.me)\/\S+/gi,
            /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,
            /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,
            /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,
            /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi,
            /https?:\/\/(?:www\.)?dailymotion\.com\/\S+/gi,
            /https?:\/\/(?:www\.)?medium\.com\/\S+/gi
        ];

        // Check if message contains any forbidden links
        const containsLink = linkPatterns.some(pattern => pattern.test(body));

        // Only proceed if anti-link is enabled and link is detected
        if (containsLink && config.ANTI_LINK === 'true') {
            console.log(`[ᴀᴋɪɴᴅᴜ-ᴍᴅ] Link detected from ${sender}`);

            // Try to delete the message
            try {
                await conn.sendMessage(from, {
                    delete: m.key
                });
            } catch (error) {
                console.error("Failed to delete message:", error);
            }

            // Update warning count for user
            global.warnings[sender] = (global.warnings[sender] || 0) + 1;
            const warningCount = global.warnings[sender];

            // Handle warnings
            if (warningCount < 4) {
                // Send warning message (Metadata stripped)
                await conn.sendMessage(from, {
                    text: `‎*⚠️ ᴀᴋɪɴᴅᴜ-ᴍᴅ: LINKS NOT ALLOWED ⚠️*\n` +
                        `*╭────⬡ WARNING ⬡────*\n` +
                        `*├▢ USER :* @${sender.split('@')[0]}\n` +
                        `*├▢ COUNT : ${warningCount} / 3*\n` +
                        `*├▢ REASON : LINK SENDING*\n` +
                        `*╰────────────────*`,
                    mentions: [sender]
                });
            } else {
                // Remove user if they exceed warning limit
                await conn.sendMessage(from, {
                    text: `*🚫 @${sender.split('@')[0]} HAS BEEN REMOVED BY ᴀᴋɪɴᴅᴜ-ᴍᴅ - WARN LIMIT EXCEEDED!*`,
                    mentions: [sender]
                });
                await conn.groupParticipantsUpdate(from, [sender], "remove");
                delete global.warnings[sender];
            }
        }
    } catch (error) {
        console.error("Anti-link error:", error);
    }
});