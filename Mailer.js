const fs = require('fs');
const nodemailer = require('nodemailer');
const config = require('./config');

const templateBasePath = __dirname + '/resources/mails/';

//Parse if
//@if\((.*)\)((.|\n)*)@endif

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
            this.parseHtmlAndText(template, data)
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

    parseHtmlAndText(template, variables) {
        return new Promise((accept, reject) => {
            let result = {};
            return this.parseTemplate(template, variables, 'html')
                .then(html => {
                    result.html = html;
                    return this.parseTemplate(template, variables, 'txt');
                })
                .then(text => {
                    result.text = text;
                    accept(result);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    parseTemplate(template, variables, extension = 'html') {
        return new Promise((accept, reject) => {
            let path = templateBasePath + template + '.' + extension;
            fs.readFile(path, (err, data) => {
                if(err) {
                    reject(err);
                    throw err;
                }

                let compiledTemplate = data.toString();

                for(let v in variables) {
                    if(!variables.hasOwnProperty(v)) { continue; }

                    let regex = new RegExp('\\$' + v.toUpperCase() + '\\$', 'g');
                    compiledTemplate = compiledTemplate.replace(regex, variables[v]);
                }
                accept(compiledTemplate);
            });
        });
    }
}

module.exports = new Mailer;