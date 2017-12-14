class App {
    run() {
        const mailer = require('./Mailer');
        mailer.sendTemplateMail({
            template: 'waste',
            data: {
                alertContent: 'Su granja está en fuego'
            },
            to: 'palmenros@gmail.com',
            from: 'no-reply@agrotech.com',
            subject: 'Purines'
        })
            .then(response => {
                console.log('Mail sent');
            })
            .catch(err => {
                console.log('An error happened:', err);
            });
    }
}

module.exports = new App;