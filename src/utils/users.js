const users = []

//add user
const addUser = ({id, username, room}) => {     //id is auto generated by socket 

    // Clean Data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate Data
    if (!username || !room) {
        return {
            error: 'Username and room is required'
        };
    };

    // Existing user in a Room
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    });

    if (existingUser) {
        return {
            error: 'username already in use!'
        };
    };

    // Store user
    const user = {id, username, room};
    users.push(user);
    return {user};
};

//remove user
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {         
        /*splice thakes 1st arg as the index number & 2nd arg as how many objects in array we want to remove*/        
        return users.splice(index, 1)[0];       //splice returns an array so we removed 1 object and to sepcify we give 1st index [0]
    }
};

//get user
const getUser = (id) => {
    return users.find((user) => user.id === id);
};

//get users in room
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room);
};


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};
// addUser({
//     id: 143,
//     username: "AhmEd",
//     room: "karaChi"
// });
