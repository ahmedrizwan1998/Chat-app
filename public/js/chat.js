const socket = io();

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#sendLocation");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

//templates
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationTemplate = document.querySelector("#location-template").innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

let username = params.username;
let room = params.room 
 

const autoScroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild;

    //Height of new message
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    const $newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //visible height
    const visibleHeight = $messages.offsetHeight;

    //height of messages container
    const containerHeight = $messages.scrollHeight;

    //How far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - $newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

// event for messages
socket.on("message", (message) => {
    // console.log(message);
    const messageHtml = Mustache.render($messageTemplate, {     //mustache is used by the script added in chat.html
        message: message.text,
        createdAt: message.createdAt,
        username: message.username                            //moment is used fromt he script added in chat.html
    });
    $messages.insertAdjacentHTML("beforeend", messageHtml);
    autoScroll();
});

// event for location sharing messages
socket.on("locationMessage", (message) => {
    const locationHtml = Mustache.render($locationTemplate, {
        url: message.link,
        createdAt: message.createdAt,
        username: message.username
    });
    $messages.insertAdjacentHTML("beforeend", locationHtml);
    autoScroll(); 
});

//event for getting users in a room
socket.on("roomData", ({room, users}) => {
    const roomHtml = Mustache.render($sidebarTemplate, {
        room,
        users
    });
    $sidebar.insertAdjacentHTML("beforeend", roomHtml)
});

// send text message upon form submission 
$messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    //disable form
    $messageFormButton.setAttribute("disabled", "disabled");

    // 1 way of getting value by giving id to input tag
    //const message = document.querySelector("#message").value; 
    
    // 2nd way by giving name property to input tag or any element to access --> more reliable and not to break 
    const message = e.target.elements.message.value;
    
    socket.emit("sendMessage", message, (error) => {      //whoever emits send callback func and can recieve callback in its parameter
        
        // enable form
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }

        console.log("message delivered");
    }); 
});

// send location on clicking
$sendLocationButton.addEventListener("click", (e) => {
    e.preventDefault();
    
    $sendLocationButton.setAttribute("disabled", "disabled");

    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser.");
    }

    navigator.geolocation.getCurrentPosition((pos) => {
        socket.emit("sendLocation", {
            latitude: pos.coords.latitude, 
            longitude: pos.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute("disabled");
            console.log("location shared!");    
        });
    });
});

// event for joining
socket.emit("join", {username, room}, (error) => {
    
    if (error) {
        alert(error);
        location.href = '/';
    }
});

// client gets data "count" with the event name sent by server side "updatedCount"
// socket.on("updatedCount", (count)=> {   
//     console.log("The count has been updated" , count);
// });

// // getting button by #increment and performing event by "click"
// document.querySelector("#increment").addEventListener("click", () => {
//     console.log("Clicked");
//     socket.emit("increment");       //client side emit 
// });