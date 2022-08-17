const express = require("express");
const path = require("path");
const {createServer} = require("http");     //destructure "createServer from http"
const {Server} = require("socket.io");      //destructure "Server" from socket.io
const Filter = require("bad-words");
const {generateMessage, generateLocationMessage} = require("./utils/messages");
const {addUser, removeUser, getUser, getUsersInRoom} = require("./utils/users");

const app = express();

//method let us create new web server in which we pass our app
const server = createServer(app);       

//give io the server to work on so we give our server to io method
const io = new Server(server);          

const port = 3000;

//path set to access public folder
const publicDirectoryPath = path.join(__dirname, "../public");     

app.use(express.static(publicDirectoryPath));

//socket.emit, io.emit, socket.broadcast.emit 
//For rooms io.to().emit, socket.broadcast.to().emit

io.on("connection", (socket) => {

    // user join
    socket.on("join", (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options});
        
        if (error) {
            return callback(error);
        }


        socket.join(user.room);
        
        //server sends data to the client side i.e: "Welcome!";
        socket.emit("message", generateMessage('Admin', "Welcome!"));     

        //broadcast send message to everyone connected expect the person that sends this
        socket.broadcast.to(user.room).emit("message", generateMessage('Admin', `${user.username} has joined!`)); 

        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
    });

    // messages from client side
    socket.on("sendMessage", (message, callback) => {
        
       const user = getUser(socket.id); 
       const filter = new Filter();
       
       //check for profanity
       if (filter.isProfane(message)) {     
        return callback("profanity is not allowed"); 
       } 

        //io.emit sends to all connection available to this server
       io.to(user.room).emit("message", generateMessage(user.username, message));   

        //whoever recieves the message recieve the acknowledment on the callback func and can send back message to the emitter
       callback();             
    });

    // share location
    socket.on("sendLocation", (data, callback) => {

        const user = getUser(socket.id);
        // io.emit("message", `https://google.com/maps?q=${data.latitude},${data.longitude}`);
        // io.emit("message", `Latitude: ${data.latitude}, Longitude: ${data.longitude}`);
        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://google.com/maps?q=${data.latitude},${data.longitude}`));
        callback();
    });

    // upon disconnecting message sent
    socket.on("disconnect", () => {

        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit("message", generateMessage(`${user.username} has left!`));
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
        
    });
});


server.listen(port, () => {
    console.log(`listening on port ${port} ....`);
});


// let count = 0;

// // connection from the server to the client
// io.on("connection", (socket) => {
//     socket.emit("updatedCount", count);         //server sends data to the client side i.e: count;

//     socket.on("increment", () => {              //server gets response from client side event name "increment" 
//         count++;                                //it increments count
//         //socket.emit("updatedCount", count);   //sends back the count to a particular connection
//         io.emit("updatedCount", count);         //io.emit sends to all connection available to this server
//     });
// });




