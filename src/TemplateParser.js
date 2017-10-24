const fs = require('fs');
const templateBasePath = __dirname + '/../resources/mails/';

class TemplateParser {
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
                compiledTemplate = TemplateParser.replaceVariables(compiledTemplate, variables);
                compiledTemplate = TemplateParser.parseIfStatement(compiledTemplate);
                accept(compiledTemplate);
            });
        });
    }

    static replaceVariables(source, variables) {
        for(let v in variables) {
            if(!variables.hasOwnProperty(v)) { continue; }

            let regex = new RegExp('\\$' + v.toUpperCase() + '\\$', 'g');
            source = source.replace(regex, variables[v]);
        }
        return source;
    }

    static parseIfStatement(source) {
        return source.replace(/@if\((.*)\)([\s\S.]*?)@endif/gm, function(match, p1, p2){
            if(p1) {
                return p2.toString().trim();
            } else {
                return '';
            }
        });
    }
}

module.exports = new TemplateParser;