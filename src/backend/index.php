<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$basePath = realpath(__DIR__);
$rotasJson = file_get_contents($basePath . '/config/routes.json');
$rotas = json_decode($rotasJson, true);

if (isset($_REQUEST['rota'])) {
    $rota = $_REQUEST['rota'];
    
    if (isset($rotas['rotas'][$rota])) {
        $rotaInfo = $rotas['rotas'][$rota];
        $metodo = $_SERVER['REQUEST_METHOD'];
        if ($metodo !== $rotaInfo['metodo']) {
            http_response_code(405); 
            echo json_encode(['erro' => 'Método não permitido para esta rota']);
        } else {
            
            $caminhoArquivo = $basePath . '/' . $rotaInfo['arquivo'];
            
            include $caminhoArquivo;
        }
    } else {
        echo json_encode(['erro' => 'Rota não encontrada']);
    }
} else {
    echo json_encode(['erro' => 'Nenhuma rota fornecida']);
}
?>
