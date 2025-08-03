const { query } = require("express");
const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async  (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}; 

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showListings = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews", 
        populate: {
            path: "author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req,res,next) => {
     
    let response = await geocodingClient
       .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
       })
       .send();
    //    res.redirect("/listings");

   

         let url = req.file.path;
        let filename = req.file.filename;
    

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image= { url, filename};
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New listing Created!");
    res.redirect(`/listings/${listing._id}`); 
    };

module.exports.editsListing = async (req, res) => {
     let {id} = req.params;
     const listing = await Listing.findById(id);
     if(!listing){
        req.flash("error","listing you requested for does not exist!");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image?.url || "";
    if (originalImageUrl.includes("cloudinary")) {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    }
    
    
    res.render("listings/edit.ejs",{listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    try {
        // Find the listing by ID and update it with the new data
        let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

        // If no listing is found, return an error response
        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }

        // Only handle the image upload if a file is uploaded
        if (req.file) {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = { url, filename };
            await listing.save(); // Save the listing after updating the image
        }

        req.flash("success", "Listing updated!");
        res.redirect(`/listings/${id}`);
    } catch (error) {
        console.error(error);  // Log the error for debugging
        req.flash("error", "There was an error updating the listing!");
        res.redirect(`/listings/${id}`);
    }
};
 
module.exports.deleteListing = async (req, res) => {
    let {id} =req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};

