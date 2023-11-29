const EP = require("../Models/EP");
const User = require("../Models/User");

let createEP = (req, res) => {
    let { epId, name, contact, email } = req.body;

    let ep = new EP({
        epId,
        name,
        contact,
        email,
    });

    ep.save()
    .then((ep) => {
        res.status(200).send({ message: "EP created", ep })
    })
    .catch(err => {
        res.status(500).send({ message: "Error", err })
    });
};

let getEP = (req, res) => {
    let epId = req.params.epId;

    EP.findOne({ epId})
    .then((ep) => {
        if (!ep) {
            return res.status(404).send({ message: "EP not found" });
        }
        res.status(200).send({ ep });
    })
    .catch(err => {
        res.status(500).send({ message: "Error", err });
    });
};

let getAllEPs = (req, res) => {
    EP.find({}).then((eps) => {
        res.status(200).send({ eps });
    })
    .catch(err => {
        res.status(500).send({ message: "Error", err });
    });
    

    // EP.find({})
    // .sort('-createdAt')  // This will sort in descending order of creation date
    // .then((eps) => {
    //     res.status(200).send({ eps });
    // })
    // .catch(err => {
    //     res.status(500).send({ message: "Error", err });
    // });

};

let deleteEP = (req, res) => {
    let _id= req.params._id;
    EP.findOneAndDelete({ _id })
    .then((deletedEP) => {
        if (!deletedEP) {
            return res.status(404).send({ message: "EP not found" });
        }        
        // Once EP is deleted, remove its reference from the User's assignedEps array
        User.updateMany(
            { assignedEps: _id },
            { $pull: { assignedEps: _id } }
        )
        .then(() => {
            res.status(200).send({ message: "EP deleted and references removed", deletedEP });
        })
        .catch(err => {
            res.status(500).send({ message: "Error while removing EP references from user", err });
        });
    })
    
    .catch(err => {
        res.status(500).send({ message: "Error", err });
    });
};

let updateEP = (req, res) => {
    let _id = req.params._id;
    let updates = req.body;
    console.log(updates)
    EP.findOneAndUpdate({ _id }, updates, { new: true })
    .then((updatedEP) => {
        if (!updatedEP) {
            return res.status(404).send({ message: "EP not found" });
        }
        res.status(200).send({ message: "EP updated", updatedEP });
    })
    .catch(err => {
        res.status(500).send({ message: "Error", err });
    });
};

module.exports = {
    createEP,
    getEP,
    getAllEPs,
    deleteEP,
    updateEP
};
