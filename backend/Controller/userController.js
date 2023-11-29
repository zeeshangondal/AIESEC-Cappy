const EP = require("../Models/EP");
const User = require("../Models/User");
const jwt = require('jsonwebtoken');
const sendEmail = require("./emailController");
const currentDate = new Date();



let getUser = (req, res) => {
    let userId = req.params.id;

    User.findById(userId)
        .then((user) => {
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }
            res.status(200).send({ user });
        })
        .catch(err => {
            res.status(500).send({ message: "Error", err });
        });
};

let getAllUsers = (req, res) => {
    User.find({})
        .then((users) => {
            res.status(200).send({ users });
        })
        .catch(err => {
            res.status(500).send({ message: "Error", err });
        });
};


let signup = (req, res) => {
    let { username, email, password, LC, role, TL, appPassword , emailSubject, emailBody } = req.body;

    let user = new User({
        username,
        password,
        LC,
        role,
        email,
        TL,
        appPassword,
        emailSubject,
        emailBody
    });
    user.save().then((user) => {
        res.status(200).send({ message: "User created", user })
    }).catch(err => {
        res.status(500).send({ message: "Error", err })
    })
}
let login = (req, res) => {
    let { email, password } = req.body;
    User.findOne({ email, password }).then((user) => {
        if (!user) {
            console.log('user not found')
            res.status(201).send({ message: "User not Found" })
        }
        else {
            const dateTimeString = currentDate.toLocaleString();
            let loggedUser = {
                _id: user._id,
                username: user.username,
                LC: user.LC,
                role: user.role,
                email: user.email,
                loggedInTime: dateTimeString
            }
            let token = jwt.sign({ ...loggedUser }, process.env.SECRET_KEY, { expiresIn: '24h' })


            res.status(200).send({ message: "User Found", token: token, user: loggedUser })
        }
    })
}

let deleteUser = (req, res) => {
    let _id = req.params.id; // Assuming you're passing the user's ID in the route URL like /users/:id

    User.findByIdAndDelete(_id)
        .then((deletedUser) => {
            if (!deletedUser) {
                return res.status(404).send({ message: "User not found" });
            }
            res.status(200).send({ message: "User deleted", deletedUser });
        })
        .catch(err => {
            res.status(500).send({ message: "Error", err });
        });
}


let updateUser = (req, res) => {
    let _id = req.params.id;
    let updates = req.body;

    User.findOneAndUpdate({ _id }, updates, { new: true })
        .then((updatedUser) => {
            if (!updatedUser) {
                return res.status(404).send({ message: "User not found" });
            }
            res.status(200).send({ message: "User updated", updatedUser });
        })
        .catch(err => {
            res.status(500).send({ message: "Error", err });
        });
};

let assignEpsToUser = async (req, res) => {
    let _id = req.params.id;
    try {
        // Fetch the user
        let user = await User.findById(_id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        // Fetch the required number of unassigned EPs
        let epsToAssign = await EP.find({
            assigned_TL: '-',
            assigned_Member: '-'
        }).limit(user.assignEps);

        // Update those EPs to be assigned to the user (You can do this part based on your needs, 
        // whether you want to update `assigned_TL` or `assigned_Member` or both)
        for (let ep of epsToAssign) {
            ep.assigned_TL = user.TL; // Assuming you're assigning based on username
            ep.assigned_Member = user.username;
            await ep.save();
        }
        if (epsToAssign.length > 0) {
            // Add the EPs to the user's `eps` array and save the user
            user.assignedEps = (user.eps || []).concat(epsToAssign.map(ep => ep._id));
            await user.save();
        }

        res.status(200).send({ message: "User and EPs updated", user });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Error", err });
    }
};


let dispatchEmails = async (req, res) => {
    try {
        // Fetch all users and populate them with their assigned EPs
        let usersWithEPs = await User.find({ assignedEps: { $exists: true, $not: { $size: 0 } } }).populate('assignedEps').exec();

        // Extract the data to create a new user array with their non-contacted EPs
        let usersWithNotContactedEPs = usersWithEPs.map(user => {
            let notContactedEPs = user.assignedEps.filter(ep => !ep.firstContacted);
            return {
                ...user._doc,
                notContactedEPs: notContactedEPs
            };
        });

        // Filter out users who have no EPs that are not first contacted.
        usersWithNotContactedEPs = usersWithNotContactedEPs.filter(user => user.notContactedEPs.length > 0);

        // Send all emails and wait for all to finish
        let totalEpsCount = 0;
        let emailsSentCount = 0;

        // Collect all email promises
        let emailPromises = [];

        usersWithNotContactedEPs.forEach(user => {
            user.notContactedEPs.forEach(ep => {
                totalEpsCount++;
                const ob = {
                    email: user.email,
                    password: user.appPassword,
                    subject: user.emailSubject,
                    recipient: ep.email,
                    body: user.emailBody
                };

                const emailPromise = sendEmail(ob)
                    .then(success => {
                        if (success) {
                            emailsSentCount++;
                            let updates = { firstContacted: true, status: "Email Contacted" }
                            EP.findOneAndUpdate({ _id: ep._id }, updates, { new: true })
                                .then((updatedEP) => {
                                    if (updatedEP) {
                                        console.log(`${user.username} TO ${ep.name}`);
                                    }
                                })
                                .catch(err => {
                                });
                        }
                        return success;
                    });

                emailPromises.push(emailPromise);
            });
        });

        // Wait for all email promises to complete
        await Promise.all(emailPromises);

        // Return the data in the response
        res.status(200).send({
            message: "Users with their not-contacted EPs fetched",
            users: usersWithNotContactedEPs,
            totalEpsCount,
            emailsSentCount,
            emailsNotSentCount: totalEpsCount - emailsSentCount
        });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Error", err: err.message });
    }
};





let updateAssignEpsCount = (req, res) => {
    let { assignEps } = req.body;
    let _id = req.params.id;
    if (!_id || !assignEps) {
        return res.status(400).send({ message: "Required fields are missing" });
    }

    var myquery = { _id: _id };
    var newvalues = {
        $set: {
            assignEps: assignEps
        }
    };

    User.findOneAndUpdate(myquery, newvalues, { new: true }).then((data) => {
        if (data) {
            res.status(201).send({ message: "Assign EPs updated" });
        } else {
            res.status(200).send({ message: "Number of EPs couldn't be updated" });
        }
    }).catch(err => {
        res.status(500).send({ message: "Error", err });
    });
}



module.exports = {
    login,
    updateUser,
    signup,
    deleteUser,
    getUser,
    getAllUsers,
    updateAssignEpsCount,
    assignEpsToUser,
    dispatchEmails
}