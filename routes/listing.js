const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn , isOwner, validatelisting} = require("../midddleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
//index route
.get(wrapAsync(listingController.index)) 
//create route
.post(isLoggedIn,validatelisting,
   
    upload.single("listing[image]"), 
    wrapAsync(listingController.createListing)); 

    
//new route
router.get("/new",isLoggedIn,listingController.renderNewForm );

router.route("/:id")
//show route
.get(wrapAsync(listingController.showListings))
// updated route
.put(
    isLoggedIn, 
    isOwner,
    upload.single("listing[image]"),
    validatelisting,
    wrapAsync(listingController.updateListing)) 
//delete route   
.delete(
    isLoggedIn,
    isOwner, 
    wrapAsync(listingController.deleteListing));
 

//edit route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
     wrapAsync(listingController.editsListing) 
);

module.exports = router;
