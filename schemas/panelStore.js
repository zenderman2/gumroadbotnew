const { Schema, model } = require('mongoose');

const panelS = new Schema({
    userId: {
      type: String,
      required: true,
    },
    messageId: {
        type: String,
    },
    buttons: {
        type: [String],
    }
})

module.exports = model('panelS', panelS);