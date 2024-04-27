<?php

header('Content-Type: application/csv');
$data = json_decode(file_get_contents('vehicles.json'), true);
header('Content-Disposition: attachment; filename=长春公交 '.$data['time'].'.csv');
$csv = '车牌号,线路,自编号';
foreach($data['vehicleList'] as $vehicle){
    if(preg_match('/^(高新一实验|东安实验|八十七中|103中学|附中新城)[0-9]号线$/', $vehicle['lastOnLine'])){
        continue;
    }else if(preg_match('/^[A-Z]+[0-9]*$/', $vehicle['lastOnLine'])){
        $vehicle['lastOnLine'] .= '路';
    }

    if(!is_numeric($vehicle['busId'])){
        $vehicle['busId'] = '';
    }

    $csv .= "\n".implode(',', [$vehicle['busLicense'], $vehicle['lastOnLine'], $vehicle['busId']]);
}
echo iconv('UTF-8', 'GBK', $csv);