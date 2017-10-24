const mailer = require('./Mailer');

mailer.sendTemplateMail({
    template: 'waste',
    data: {
        'name' : 'OAuth2 funciona!!',
        'email' : 'test@example.com',
        'mapQuery' : 'IES Los Olmos'
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