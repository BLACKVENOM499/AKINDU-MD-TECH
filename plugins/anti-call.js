const settingsManager = require('../lib/settingsmanager'); // Path to your settings manager
const { cmd } = require('../command'); // Adjust path as needed to your command registration

cmd({
    pattern: "anticall",
    desc: "Manages the anti-call feature. Use: .anticall [on/off]",
    category: "owner",
    react: "📞",
    filename: __filename,
    fromMe: true // Only accessible by the bot's own number
},
async (conn, mek, m, { isOwner, reply, from, sender, args, prefix }) => {
    try {
        if (!isOwner) {
            return reply("🚫 This command is for the **ᴀᴋɪɴᴅᴜ-ᴍᴅ** owner only.");
        }

        let currentStatus = settingsManager.getSetting('ANTICALL');
        const arg = args[0] ? args[0].toLowerCase() : ''; 

        let replyText;
        let finalReactionEmoji = '📞'; 

        if (arg === 'on') {
            if (currentStatus) {
                replyText = `📞 Anti-call feature is already *enabled* for **ᴀᴋɪɴᴅᴜ-ᴍᴅ**.`;
                finalReactionEmoji = 'ℹ️'; 
            } else {
                settingsManager.setSetting('ANTICALL', true);
                replyText = `📞 Anti-call feature has been *enabled* successfully!`;
                finalReactionEmoji = '✅'; 
            }
        } else if (arg === 'off') {
            if (!currentStatus) {
                replyText = `📞 Anti-call feature is already *disabled*.`;
                finalReactionEmoji = 'ℹ️'; 
            } else {
                settingsManager.setSetting('ANTICALL', false);
                replyText = `📞 Anti-call feature has been *disabled*!`;
                finalReactionEmoji = '❌'; 
            }
        } else if (arg === '') {
            const statusEmoji = currentStatus ? '✅ ON' : '❌ OFF';
            replyText = `
*📞 ᴀᴋɪɴᴅᴜ-ᴍᴅ Anti-Call Manager*

Current Status: *${statusEmoji}*

To turn On:
  \`\`\`${prefix}anticall on\`\`\`
To turn Off:
  \`\`\`${prefix}anticall off\`\`\`
            `.trim();
            finalReactionEmoji = '❓'; 
        } else {
            replyText = `❌ Invalid argument. Please use \`${prefix}anticall on\`, \`${prefix}anticall off\`, or just \`${prefix}anticall\` for help.`;
            finalReactionEmoji = '❓'; 
        }

        // Send reaction to the command message
        await conn.sendMessage(from, {
            react: { text: finalReactionEmoji, key: mek.key }
        });

        // Send the formatted reply message (Forwarding and Newsletter info removed)
        await conn.sendMessage(from, {
            text: replyText,
            contextInfo: {
                mentionedJid: [sender]
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in anticall command:", e);
        reply(`An error occurred in the **ᴀᴋɪɴᴅᴜ-ᴍᴅ** system: ${e.message}`);
    }
});