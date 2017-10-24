class App {
    run() {
        // const mailer = require('./Mailer');
        // mailer.sendTemplateMail({
        //     template: 'waste',
        //     data: {
        //         'name' : 'Probemos los refactors',
        //         'email' : 'kdaw@dawd.awaw',
        //         'mapQuery' : 'IES Los Olmos'
        //     },
        //     to: 'palmenros@gmail.com',
        //     from: 'no-reply@agrotech.com',
        //     subject: 'Purines'
        // })
        //     .then(response => {
        //         console.log('Mail sent');
        //     })
        //     .catch(err => {
        //         console.log('An error happened:', err);
        //     });

                const parser = require('./TemplateParser');
                parser.parseTemplate('waste', {
                    name: 'Pedro',
                    customText: 'Me gustan las patatas'
                }, 'txt')
                    .then(data => {
                        console.log(data);
                    });

    }
}

module.exports = new App;