const app = require('http').createServer();
const io = require('socket.io')(app);

app.listen(3000);

const mailer = require('./Mailer');

mailer.sendTemplateMail({
    template: 'waste',
    data: {
        'name' : 'Pedro',
        'email' : 'test@example.com'
    },
    to: '',
    from: 'no-reply@agrotech.com',
    subject: 'Purines'
})
    .then(response => {
        console.log(response);
    })
    .catch(err => {
        console.log(err);
    });