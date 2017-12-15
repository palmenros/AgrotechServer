class App {
    run() {
        const mailer = require('./Mailer');
        const app = require('http').createServer();
        const io = require('socket.io')(app);

        app.listen(3000);

        let clients = [];

        const SerialPort = require('serialport');
        const Delimiter = SerialPort.parsers.Delimiter;

        let port = new SerialPort('/dev/ttyUSB0', {
            baudRate: 9600
        });

        //It starts void, it will be filled from Socket.io calls
        let mailSettings = {};

        const parser = port.pipe(new Delimiter({ delimiter: Buffer.from('DEFA', 'hex') }));

        port.on('error', err => {
            console.log(`Err: ${err.message}`);
        });

        port.on('open', function(){
            console.log("Serial port opened");
            parser.on('data', function(data) {
                if(data.length !== 5) {
                    return;
                }
                let sensor = data[0];
                let number = data.readFloatLE(1);
                // console.log(`Sensor #${sensor} shows ${number}`);
                let threshold = 5;
                
                if(sensor == 2 || sensor == 3 || sensor == 4) {
                    //Sensors with percentages:
                    //Light, water and waste
                    io.sockets.emit('variables', {
                        sensorData : {
                            id: sensor,
                            data: Math.ceil((number * 100) / threshold) * threshold
                        }
                    });

                    if(sensor == 4 && number >= 0.8) {
                        //Waste filled, send mail

                        mailer.sendTemplateMail({
                            template: 'waste',
                            data: {
                                'name': mailSettings.fullName,
                                'email': mailSettings.userEmail,
                                'city': mailSettings.city,
                                'province': mailSettings.province,
                                'postalCode': mailSettings.postalCode,
                                'mapQuery' : mailSettings.address,
                                'customText': mailSettings.customText
                            },
                            to: mailSettings.enterpriseEmail,
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
                } else if(sensor == 0 || sensor == 1) {
                    //Sensors with data:
                    //Feeder and Temperature
                   let temp = Math.round(number);
                   io.sockets.emit('variables', {
                        sensorData : {
                            id: "1",
                            data: temp
                        }
                    });
                } else if(sensor == 5 && number != 0) {
                    //The farm is on fire
                    mailer.sendTemplateMail({
                        template: 'alert',
                        data: {
                            alertContent: 'Su granja está en fuego'
                        },
                        to: mailSettings.userEmail,
                        from: 'no-reply@agrotech.com',
                        subject: 'Fuego'
                    })
                        .then(response => {
                            console.log('Mail sent');
                        })
                        .catch(err => {
                            console.log('An error happened:', err);
                        });

                } else if (sensor == 6 && number != 0) {
                    //Intruder detected
                    mailer.sendTemplateMail({
                        template: 'alert',
                        data: {
                            alertContent: 'Se ha detectado movimiento en el exterior de su granja'
                        },
                        to: mailSettings.userEmail,
                        from: 'no-reply@agrotech.com',
                        subject: 'Movimiento'
                    })
                        .then(response => {
                            console.log('Mail sent');
                        })
                        .catch(err => {
                            console.log('An error happened:', err);
                        });
                }
            });
        });

        io.on('connection', socket => {
            socket.on('control', function(data){

                if(data.actuatorId == 8 && data.data) {
                    //Send waste message
                    mailer.sendTemplateMail({
                        template: 'waste',
                        data: {
                            'name': mailSettings.fullName,
                            'email': mailSettings.userEmail,
                            'city': mailSettings.city,
                            'province': mailSettings.province,
                            'postalCode': mailSettings.postalCode,
                            'mapQuery' : mailSettings.address,
                            'customText': mailSettings.customText
                        },
                        to: mailSettings.enterpriseEmail,
                        from: 'no-reply@agrotech.com',
                        subject: 'Purines'
                    })
                        .then(response => {
                            console.log('Mail sent: ', response);
                        })
                        .catch(err => {
                            console.log('An error happened:', err);
                        });

                }

                let automatic = data.automatic ? 1 : 0;
                let id = data.actuatorId;
                let number = data.data;

                port.write(id.toString() + automatic.toString(), 'hex');

                let float = number;
                let b = Buffer.allocUnsafe(4);
                b.writeFloatLE(float, 0);
                port.write(b);
            });

            socket.on('settings', function(data){
                //Copy all form
                //TODO: Store this on a database
                for(let field in data) {
                    if(data.hasOwnProperty(field)) {
                        mailSettings[field] = data[field];
                    }
                }
            });
        });

    }
}

module.exports = new App;