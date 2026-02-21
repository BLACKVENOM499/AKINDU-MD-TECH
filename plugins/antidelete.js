const { cmd } = require('../command');
const { getAnti, setAnti } = require('../data/antidel');

cmd({
    pattern: "antidelete",
    desc: "Toggle ᴀᴋɪɴᴅᴜ-ᴍᴅ anti-delete feature",
    category: "misc",
    filename: __filename
},
async (conn, mek, m, { from, reply, text, isCreator }) => {
    // Check if sender is owner
    if (!isCreator) return reply('🚫 This command is for the **ᴀᴋɪɴᴅᴜ-ᴍᴅ** owner only.');
    
    try {
        const currentStatus = await getAnti();
        
        if (!text || text.toLowerCase() === 'status') {
            // Send status message (Forwarding/Newsletter tags removed)
            return conn.sendMessage(from, {
                text: `*ᴀᴋɪɴᴅᴜ-ᴍᴅ AntiDelete Status:* ${currentStatus ? '✅ ON' : '❌ OFF'}\n\n*Usage:*\n• .antidelete on\n• .antidelete off`
            }, { quoted: mek });
        }
        
        const action = text.toLowerCase().trim();
        
        if (action === 'on') {
            await setAnti(true);
            return conn.sendMessage(from, {
                text: '✅ **ᴀᴋɪɴᴅᴜ-ᴍᴅ** Anti-delete has been enabled successfully.'
            }, { quoted: mek });
        } 
        else if (action === 'off') {
            await setAnti(false);
            return conn.sendMessage(from, {
                text: '❌ **ᴀᴋɪɴᴅᴜ-ᴍᴅ** Anti-delete has been disabled.'
            }, { quoted: mek });
        } 
        else {
            return conn.sendMessage(from, {
                text: 'Invalid command. Usage:\n• .antidelete on\n• .antidelete off\n• .antidelete status'
            }, { quoted: mek });
        }
    } catch (e) {
        console.error("Error in antidelete command:", e);
        return conn.sendMessage(from, {
            text: "❌ An error occurred in the **ᴀᴋɪɴᴅᴜ-ᴍᴅ** system."
        }, { quoted: mek });
    }
});