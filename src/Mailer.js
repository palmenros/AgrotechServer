const nodemailer = require('nodemailer');
const config = require('../config/config');
const parser = require('./TemplateParser');

class Mailer {
    constructor() {
        this.transport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: config.user,
                clientId: config.clientId,
                clientSecret: config.clientSecret,
                refreshToken: config.refreshToken                
            }
        });
    }

    sendTemplateMail({ template, data, from, to, subject }) {
        return new Promise((accept, reject) => {
            let message = { from, to, subject };
            parser.parseHtmlAndText(template, data)
                .then( data => {
                    message.html = data.html;
                    message.text = data.text;
                    this.transport.sendMail(message, (err, response) => {
                        if(err) {
                            reject(err);
                        } else {
                            accept(response);
                        }
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    sendMail(message) {
        this.transport.sendMail(message);
    }
}

module.exports = new Mailer;