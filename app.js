const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require('path');
const fs = require('fs');
const bodyParser = require("body-parser");
const methodOverride = require('method-override');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // Add method-override middleware

// Log current directory to ensure it's correct
console.log("Current directory:", __dirname);

// Use path.resolve to dynamically resolve the path to listing.js
const listingPath = path.resolve(__dirname, './models/listing.js');

// Check if listing.js is accessible
fs.access(listingPath, fs.constants.R_OK, (err) => {
    if (err) {
        console.error('File not accessible:', err);
    } else {
        console.log('File is accessible');
    }
});

// Require listing.js
const Listing = require(listingPath);

// Creating databases
const MONGO_URL = "mongodb://127.0.0.1:27017/traveluphorics";

main().then(() => {
    console.log("Connected to database");
}).catch((err) => {
    console.log("Error connecting to database:", err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Creating API
app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

app.get("/listings", async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index", { allListings });
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).send("Error fetching listings");
    }
});

app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

app.post("/listings", async (req, res) => {
    try {
        const { listing } = req.body;
        const newListing = new Listing(listing);
        await newListing.save();
        res.redirect("/listings");
    } catch (error) {
        console.error("Error creating new listing:", error);
        res.status(500).send("Error creating new listing");
    }
});

app.get("/listings/:id/edit", async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        res.render("listings/edit", { listing });
    } catch (error) {
        console.error("Error fetching listing:", error);
        res.status(500).send("Error fetching listing");
    }
});

app.post("/listings/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedListing = req.body.listing;
        await Listing.findByIdAndUpdate(id, updatedListing);
        res.redirect("/listings");
    } catch (error) {
        console.error("Error updating listing:", error);
        res.status(500).send("Error updating listing");
    }
});

app.get("/listings/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        res.render("listings/show", { listing });
    } catch (error) {
        console.error("Error fetching listing:", error);
        res.status(500).send("Error fetching listing");
    }
});

app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}...`);
});
