const { createEP, getEP, getAllEPs, updateEP, deleteEP } = require("../Controller/epController");

const epRouter = require("express").Router();

// Create a new EP
epRouter.post("/", createEP);

// Get a specific EP by EID
epRouter.get("/:epId", getEP);

// Get all EPs
epRouter.get("/", getAllEPs);

// Update a specific EP by EID
epRouter.patch("/:_id", updateEP);

// Delete a specific EP by EID
epRouter.delete("/:_id", deleteEP);

module.exports = epRouter;
