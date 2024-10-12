<?php

function completeRouteName($routeName) {
    return $routeName.(preg_match('/^[A-Z]+[0-9]*$/', $routeName) ? '路' : '');
}

header('Content-Type: application/csv');
$data = json_decode(file_get_contents('vehicles.json'), true);
header('Content-Disposition: attachment; filename=长春公交 '.$data['time'].'.csv');
$csv = '车牌号,当前线路,自编号,最后上线时间,线路';
$days = $_GET['days'] ?? 7;
for($i = 0; $i < $days; $i++) {
    $csv .= ','.date('Y/m/d', time() - $i * 86400);
}
foreach($data['vehicleList'] as $vehicle) {
    // if(preg_match('/^(高新一实验|东安实验|八十七中|103中学|附中新城)[0-9]号线$/', $vehicle['lastOnLine'])){
    // 	continue;
    // }

    if(!preg_match('/^[0-9]+$/', $vehicle['busId'])) {
        $vehicle['busId'] = '';
    }

    $allLines = [];
    foreach($vehicle['onLine'] as $line) {
        $allLines[] = completeRouteName($line['line']);
    }

    $csv .= "\n".implode(',', [
        $vehicle['busLicense'],
        completeRouteName($vehicle['lastOnLine']),
        $vehicle['busId'],
        $vehicle['onLine'][count($vehicle['onLine']) - 1]['lastFound'],
        implode('/', array_unique($allLines))
    ]);

    for($i = 0; $i < $days; $i++) {
        $date = date('Y/m/d', time() - $i * 86400);
        $csv .= ','.implode('/', $vehicle['onlineDate'][$date] ?? []);
    }
}
echo iconv('UTF-8', 'GBK', $csv);
