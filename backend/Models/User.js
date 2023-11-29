const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },

    LC: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    TL: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    appPassword: {
        type: String,
        required: true
    },
    assignEps: {
        type: Number,
        default: 0
    },
    assignedEps: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EP'
    }],
    emailSubject: {
        type: String,
        default: ''
    },
    emailBody: {
        type: String,
        default: ''
    }
},
    { timestamps: true }
);






const User = mongoose.model('User', UserSchema);

module.exports = User;