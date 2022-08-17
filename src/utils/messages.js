const generateMessage = ( username, text) => {
    return {
        username,
        text,
        createdAt: new Date().toLocaleTimeString()
    }
};

const generateLocationMessage = (username, link) => {
    return {
        username,
        link,
        createdAt: new Date().toLocaleTimeString()
    }
};

module.exports = {
    generateMessage,
    generateLocationMessage
};