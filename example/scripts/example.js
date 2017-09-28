/*
 *
 *   Ocelot Example
 *   Declan Tyson
 *   v0.0.1
 *   28/09/2017
 *
 */

// Initialize Ocelot
var ocelot = new Ocelot.Pjax();

// Set page-specific events
ocelot.setEvent("index.html", function() { document.getElementById('ocelot-content').style.backgroundColor = "#ffffff" });
ocelot.setEvent("pjaxed.html", function() { document.getElementById('ocelot-content').style.backgroundColor = "#cdcdcd" });

ocelot.prePopCallback = function() { console.log("This is the pre pop callback!"); };

// Bind all
ocelot.all();

// That's it!



/* Other random stuff */

document.getElementById("copyright").innerText += new Date().getFullYear();
