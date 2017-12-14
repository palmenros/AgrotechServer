class App {
    run() {
        

        const app = require('http').createServer();
        const io = require('socket.io')(app);

        app.listen(3000);

        let clients = [];

        const SerialPort = require('serialport');
        const Delimiter = SerialPort.parsers.Delimiter;

        let port = new SerialPort('/dev/ttyUSB0', {
            baudRate: 9600
        });


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
                
                if(sensor == 3 || sensor == 4) {
                    if(sensor == 4) {
                        console.log(Math.ceil((number * 100) / threshold) * threshold);
                    }
                    io.sockets.emit('variables', {
                        sensorData : {
                            id: sensor,
                            data: Math.ceil((number * 100) / threshold) * threshold
                        }
                    });
                } else if(sensor == 1) {
                   let temp = Math.round(number);
                   io.sockets.emit('variables', {
                        sensorData : {
                            id: "1",
                            data: temp
                        }
                    });
                }


            });
        });

        io.on('connection', socket => {
            socket.on('control', function(data){
                // port.write('31', 'hex');
                // let float = data;
                // let b = Buffer.allocUnsafe(4);
                // b.writeFloatLE(float, 0);
                // port.write(b);
                // console.log(float);  
                
                let threshold = 5; 
                
                io.sockets.emit('variables', {
                    sensorData : {
                    id: 4,
                    data: Math.ceil((data) / threshold) * threshold
                 }
                });
            });
        });
    }
}

module.exports = new App;