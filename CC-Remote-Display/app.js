﻿var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var connectedRooms = {};

app.get("/", function(req, res) {
    console.log("Client requested '/'");

    res.sendFile(__dirname + "/html/index.html");
})

app.get("/pull", function(req, res) {
    res.send("Temp");
})

app.get("/push", function(req, res) {
    if (!req.query.id) {
        res.status(400).send("No ID");
        return;
    }
    
    if (!req.query.op) {
        res.status(400).send("No operation");
        return;
    }

    //Check for valid parameters
    switch(req.query.op) {
        case "write":
            if (!req.query.param || typeof(req.query.param) != "string") {
                res.status(400).send("Invalid parameter to 'write'");
                return;    
            }

            break;
        case "blit":
            if (!req.query.param || typeof(req.query.param) != "object" || !req.query.param[0] || !req.query.param[1] || !req.query.param[2] || req.query.param[0].length != req.query.param[1].length || req.query.param[0].length != req.query.param[2].length) {
                res.status(400).send("Invalid parameter to 'blit'");
                return;    
            }

            break;
        case "clear":
            break;
        case "clearLine":
            break;
        case "setCursorPos":
            if (!req.query.param || typeof(req.query.param) != "object" || !req.query.param[0] || !req.query.param[1]) {
                res.status(400).send("Invalid parameter to 'setCursorPos'");
                return;    
            }

            break;
        case "setCursorBlink":
            if (!req.query.param || typeof(req.query.param) != "object" || !req.query.param[0] || !req.query.param[1] || !(req.query.param[0] == "true" || req.query.param[0] == "false") || !(req.query.param[1] == "true" || req.query.param[1] == "false")) {
                res.status(400).send("Invalid parameter to 'setCursorBlink'");
                return;    
            }

            break;
        case "scroll":
            if (!req.query.param || typeof(req.query.param) != "string") {
                res.status(400).send("Invalid parameter to 'scroll'");
                return;    
            }

            break;
        case "setTextColor":
            if (!req.query.param || typeof(req.query.param) != "string") {
                res.status(400).send("Invalid parameter to 'setTextColor'");
                return;    
            }

            break;
        case "setBackgroundColor":
            if (!req.query.param || typeof(req.query.param) != "string") {
                res.status(400).send("Invalid parameter to 'setBackgroundColor'");
                return;    
            }    

            break;
        case "setTextScale":
            if (!req.query.param || typeof(req.query.param) != "string") {
                res.status(400).send("Invalid parameter to 'setTextScale'");
                return;    
            }

            break;
        default:
            res.status(400).send("Invalid operation");
            return;    
    }

    io.to(req.query.id).emit(req.query.op, req.query.param);
})

app.use("/js", express.static(__dirname + "/html/js"));

app.use(function(req, res) {
    //Redirect other urls to home
    res.redirect("/");    
});

io.on("connection", function(socket) {
    console.log("Socket.io client '" + socket.id + "' connected");

    socket.on("disconnect", function() {
        console.log("Socket.io client '" + socket.id + "' disconnected");

        if (connectedRooms[socket.id]) delete connectedRooms[socket.id];
    });

    socket.on("set id", function(id) {
        console.log("Socket.io client '" + socket.id + "' has registered to channel ID '" + id + "'");

        if (connectedRooms[socket.id]) socket.leave(connectedRooms[socket.id]); //De-register from previous channel id

        connectedRooms[socket.id] = id;
        socket.join(id);
    });
});

http.setTimeout(0);
http.listen(5678, function() {console.log("Listening on port 5678")});