import fs from 'fs';
import moment from 'moment';
import CCBUS from './ccbus.js';

let ccbus = new CCBUS();
let lineList;
let vehicleList;
let fileName = 'vehicles.json';
vehicleList = fs.readFileSync(fileName, 'UTF-8') ?? '{}';
vehicleList = JSON.parse(vehicleList)['vehicleList'];

function updateLineList() {
    lineList = ccbus.getLineList();
}

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
                                lastFound: time,
                            });
                        } else {
                            vehicleList[vehicle.busNoChar].onLine[
                                vehicleList[vehicle.busNoChar].onLine.length - 1
                            ].lastFound = time;
                        }

                        if (
                            vehicle.busNo !=
                            vehicleList[vehicle.busNoChar].busId
                        ) {
                            console.log(
                                'Info',
                                time,
                                `${vehicle.busNoChar} changed id ${
                                    vehicleList[vehicle.busNoChar].busId
                                }=>${vehicle.busNo}`
                            );
                            vehicleList[vehicle.busNoChar].busId =
                                vehicle.busNoChar;
                        }
                        
                        if (
                            !vehicleList[
                                vehicle.busNoChar
                            ].onlineDate.hasOwnProperty(
                                moment().format('YYYY/MM/DD')
                            )
                        ) {
                            vehicleList[vehicle.busNoChar].onlineDate[
                                moment().format('YYYY/MM/DD')
                            ] = [line.lineName];
                        } else {
                            if (
                                !vehicleList[vehicle.busNoChar].onlineDate[
                                    moment().format('YYYY/MM/DD')
                                ].includes(line.lineName)
                            ) {
                                vehicleList[vehicle.busNoChar].onlineDate[
                                    moment().format('YYYY/MM/DD')
                                ].push(line.lineName);
                            }
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
                                    lastFound: time,
                                },
                            ],
                            lastOnLine: line.lineName,
                            onlineDate: {
                                [moment().format('YYYY/MM/DD')]: line.lineName,
                            },
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
        updateLineList();
        console.error('Error', time, e);
    }
}

updateLineList();
update();
setInterval(update, 15 * 60 * 1000);
setInterval(updateLineList, 6 * 60 * 60 * 1000);
