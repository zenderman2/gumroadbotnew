const { Schema, model } = require('mongoose');

const profileSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    linked: {
        type: Boolean,
    },
    emailId: {
        type: String,
    },
    guildId: {
        type: String,
        required: true
    }
})

module.exports = model('profileG', profileSchema);