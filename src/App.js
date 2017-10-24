class App {
    run() {
        const mailer = require('./Mailer');
        mailer.sendTemplateMail({
            template: 'alert',
            data: {
                alertContent: 'Su granja está en fuego'
            },
            to: '',
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