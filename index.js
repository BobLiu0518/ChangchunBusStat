import fs from 'fs';
import moment from 'moment';
import CCBUS from './ccbus.js';

let ccbus = new CCBUS();
let lineList = ccbus.getLineList();
let vehicleList;
let fileName = 'vehicles.json';
vehicleList = fs.readFileSync(fileName, 'UTF-8') ?? '{}';
vehicleList = JSON.parse(vehicleList)['vehicleList'];

function update() {
    let time = moment().format('YYYY/MM/DD HH:mm:ss');
    try {
        lineList.forEach((line) => {
            for (let direction in line.type == 3 ? [1] : [1, 2]) {
                let vehicles = ccbus.getLineRealTime(
                    line.lineNo,
                    direction,
                    1
                ).allBusList;
                vehicles.forEach((vehicle) => {
                    if (vehicleList.hasOwnProperty(vehicle.busNoChar)) {
                        if (
                            vehicleList[vehicle.busNoChar].lastOnLine !=
                            line.lineName
                        ) {
                            vehicleList[vehicle.busNoChar].lastOnLine =
                                line.lineName;
                            vehicleList[vehicle.busNoChar].onLine.push({
                                line: line.lineName,
                                time,
                            });
                        }
                    } else {
                        console.log(
                            'Info',
                            time,
                            'New vehicle captured: ' +
                                vehicle.busNoChar +
                                ' on ' +
                                line.lineName
                        );
                        vehicleList[vehicle.busNoChar] = {
                            busId: vehicle.busNo,
                            busLicense: vehicle.busNoChar,
                            onLine: [
                                {
                                    line: line.lineName,
                                    time,
                                },
                            ],
                            lastOnLine: line.lineName,
                        };
                    }
                });
            }
        });
        fs.writeFile(
            fileName,
            JSON.stringify({ time, vehicleList }),
            (result) => {
                if (result !== null) {
                    console.error('Error', time, result);
                }
            }
        );
    } catch (e) {
        console.error('Error', time, e);
    }
}

update();
setInterval(update, 15 * 60 * 1000);
