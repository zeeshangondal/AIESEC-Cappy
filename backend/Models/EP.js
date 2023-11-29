const mongoose = require("mongoose");

const EPSchema = mongoose.Schema({
    epId: {
        type: String,
        required: true,
        unique: true // Assuming each EID should be unique
    },
    name: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    assigned_TL: {
        type: String,
        default: '-'
    },
    assigned_Member: {
        type: String,
        default: '-'
    },
    status: {
        type: String,
        default: 'Not Contacted'
    },
    firstContacted: {
        type: Boolean,
        default: false
    },

    consideration: { // Nested object 'consideration'
        opId: {
            type: String,
            default: ''
        },
        lc_entity: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            default: 'Applied'
        }
    },
    preparation: { // Nested object 'prepartation'
        realizationDates:{
            type: String,
            default: ''
        },
        PGS:{
            type: Boolean,
            default: false
        },
        Insurance:{
            type: Boolean,
            default: false
        },
        OPS:{
            type: Boolean,
            default: false
        },
        PGS:{
            type: Boolean,
            default: false
        },
        Tickets:{
            type: Boolean,
            default: false
        },
        Visa:{
            type: Boolean,
            default: false
        },
        Departed:{
            type: Boolean,
            default: false
        }
    },
    
    experience: { // Nested object 'consideration'
        opmName: {
            type: String,
            default: ''
        },
        opmContact: {
            type: String,
            default: ''
        },
        project: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            default: 'On Experience'
        },
        debriefStatus: {
            type: String,
            default: ''
        },
        
    },
},
    { timestamps: true }
);

const EP = mongoose.model('EP', EPSchema);

module.exports = EP;
