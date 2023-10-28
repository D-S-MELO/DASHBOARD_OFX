<?php

require __DIR__ . "/../vendor/autoload.php";

use OfxParser\Parser;
use OfxParser\Ofx\Statement;

class LeituraController
{
    private $arquivo;

    public function __construct($arquivo)
    {
        $this->arquivo = $arquivo;
    }

    public function processarArquivo()
    {
        try {

            $parser = new \OfxParser\Parser();
            $ofx = $parser->loadFromFile($this->arquivo, "UTF-8", "ISO-8859-1");


            $transacoes = $ofx->bankAccount->statement->transactions;
            $transacoesFormatadas = [];
            $totDebitos = 0;
            $totCreditos = 0;


            foreach ($transacoes as $transacao) {
              
                $tipo = $transacao->type;
                $rotulo = $tipo === "DEBIT" ? "Débito" : "Crédito";

                $data = $transacao->date->format("d/m/Y");

                $valorTransacao = $transacao->amount;
                $valor = number_format($valorTransacao, 2, ".", "");

                $codificacoes = [
                    "UTF-8",
                    "ISO-8859-1",
                    "ISO-8859-15",
                    "ISO8859–2",
                    "Windows-1252",
                ];

                $descricao = strtoupper(utf8_decode($transacao->memo));
                foreach ($codificacoes as $codificacao) {
                    $descricaoTeste = iconv($codificacao, "UTF-8", $descricao);
                    if ($descricaoTeste !== false) {
                        $descricao = $descricaoTeste;
                        break;
                    }
                }

                array_push($transacoesFormatadas, [
                    $rotulo,
                    $data,
                    str_replace('-', '', $valor),
                    $descricao,
                ]);
            }

            $resposta = [
                "success" => true,
                "transacoes" => $transacoesFormatadas,
            ];


            $respostaJson = json_encode([
                "success" => true,
                "transacoes" => $transacoesFormatadas,
            ]);

            echo $respostaJson;
        } catch (Exception $e) {
            throw new $e();
        }
    }
}

$leituraController = new LeituraController($_FILES["arquivo"]["tmp_name"]);
$leituraController->processarArquivo();

?>
