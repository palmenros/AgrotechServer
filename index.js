// const app = require('./src/App');
// app.run();

const SerialPort = require('serialport');
const Delimiter = SerialPort.parsers.Delimiter;

let port = new SerialPort('COM3', {
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
        console.log(`Sensor #${sensor} shows ${number}`);
    });
});

setTimeout(function(){
    port.write('31', 'hex');
    let float = 43.4;
    let b = Buffer.allocUnsafe(4);
    b.writeFloatLE(float, 0);
    port.write(b);
}, 2000);