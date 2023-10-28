$(document).ready(function () {
  leituraArquivo();
});

function leituraArquivo(file) {
  $('#imputFile').on('change', function (event) {
    const filePath = $(this).val();
    if (!filePath.endsWith('.ofx')) {
      mostraMensagem(
        'Atenção',
        'Por favor, selecione um arquivo com extensão .ofx.',
        'warning'
      );
      $(this).val('');
    } else {
      const fileInput = event.target;
      const file = fileInput.files[0];

      const formData = new FormData();
      formData.append('rota', '/leitura');
      formData.append('arquivo', file);

      $.ajax({
        url: '/leitura',
        type: 'POST',
        data: formData,
        dataType: 'json',
        processData: false,
        contentType: false,
        success: function (data) {
          montaTabelaComPaginacao(data.transacoes);
          createdChartPie(data.transacoes);
          createdChartBar(data.transacoes);
        },
        error: function (xhr, status, error) {
          mostraMensagem('Atenção!', error.responseText, 'error');
        },
      });
    }
  });
}

function montaTabelaComPaginacao(data) {
  var currentPage = 1;
  var itemsPerPage = 8;
  $('#pagina-anterior').on('click', function () {
    if (currentPage > 1) {
      currentPage--;
      exibirDados(data, currentPage, itemsPerPage);
    }
  });

  $('#pagina-proxima').on('click', function () {
    const maxPage = Math.ceil(data.length / itemsPerPage);
    if (currentPage < maxPage) {
      currentPage++;
      exibirDados(data, currentPage, itemsPerPage);
    }
  });

  exibirDados(data, currentPage, itemsPerPage);
}

function exibirDados(data, currentPage, itemsPerPage) {
  const tabela = $('#tabelaTranscoes tbody');
  tabela.empty();

  if (data) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    for (var i = startIndex; i < endIndex && i < data.length; i++) {
      const row = $('<tr>');
      row.append($('<td>').text(data[i][1]));
      row.append($('<td>').text(data[i][0]));
      row.append($('<td>').text(data[i][3]));
      row.append($('<td>').text(data[i][2]));
      tabela.append(row);
    }
  }
}

function paginaAnterior(paginaAtual) {
  return Math.max(0, --paginaAtual);
}

function paginaProxima(paginaAtual, registrosPorPagina, data) {
  if (paginaAtual < registrosPorPagina) {
    paginaAtual++;
  }
  return paginaAtual;
}

function desabilitarPaginacao(desabilitar) {
  $('#pagina-anterior, #pagina-proxima').prop('disabled', desabilitar);
}

function mostraMensagem(Titulo, mensagem, icone) {
  Swal.fire({
    title: `${Titulo}`,
    text: `${mensagem}`,
    icon: `${icone}`,
    confirmButtonColor: '#6c757d',
    confirmButtonText: 'Ok',
    width: '22em',
  });
}

function createdChartBar(dadosTransacoes) {
  const dadosCategorizados = categorizarTransacoes(dadosTransacoes);

  const agrupado = {};

  dadosCategorizados.forEach((transacao) => {
    const categoria = transacao[4];

    if (!agrupado[categoria]) {
      agrupado[categoria] = 0;
    }

    const valor = parseFloat(transacao[2]);
    agrupado[categoria] += valor;
  });

  const labels = Object.keys(agrupado);
  const dados = Object.values(agrupado).map((valor) =>
    parseFloat(valor.toFixed(2))
  );

  const dataGrafico = {
    labels: labels,
    datasets: [
      {
        label: 'Total',
        data: dados,
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
        ],
        hoverOffset: 4,
      },
    ],
  };

  var opcoes = {
    plugins: {
      title: {
        display: true,
        text: 'Total X Categorias',
      },
    },
  };

  const chartContainer = document.querySelector('.chart2');
  const newCanvas = document.createElement('canvas');
  newCanvas.id = 'meuGrafico1';
  chartContainer.innerHTML = '';
  chartContainer.appendChild(newCanvas);

  new Chart(newCanvas, {
    type: 'doughnut',
    data: dataGrafico,
    options: opcoes,
  });
}

function createdChartPie(dadosTransacoes) {
  let totalDebito = 0;
  let totalCredito = 0;

  for (var i = 0; i < dadosTransacoes.length; i++) {
    var valor = parseFloat(dadosTransacoes[i][2]);
    dadosTransacoes[i][0] === 'Débito'
      ? (totalDebito += valor)
      : (totalCredito += valor);
  }

  var dados = {
    labels: ['Total Débitos', 'Total Créditos'],
    datasets: [
      {
        data: [totalDebito, totalCredito],
        backgroundColor: ['red', 'green'],
      },
    ],
  };

  var opcoes = {
    plugins: {
      title: {
        display: true,
        text: 'Total Débito X Total Crédito',
      },
    },
  };

  const chartContainer = document.querySelector('.chart');
  const newCanvas = document.createElement('canvas');
  newCanvas.id = 'meuGrafico';
  chartContainer.innerHTML = '';
  chartContainer.appendChild(newCanvas);

  new Chart(newCanvas, {
    type: 'pie',
    data: dados,
    options: opcoes,
  });
}

function categorizarTransacoes(dadosTransacoes) {
  const categorias = {
    ALIMENTACAO: ['MERCADO', 'RESTAURANTE', 'PADARIA', 'EPA'],
    TRANSPORTE: ['UBER', 'GASOLINA', 'ESTACIONAMENTO'],
    PAGAMENTOS: ['PAGAMENTO'],
    COMPRAS: ['COMPRA'],
    CREDITOS: ['PIX', 'RECEBIDA', 'TRANSFERêNCIA'],
  };
  return dadosTransacoes.map((transacao) => {
    const descricao = transacao[3].toUpperCase();
    const categoriaEncontrada = encontrarCategoria(descricao, categorias);
    const categoria =
      categoriaEncontrada !== null ? categoriaEncontrada : 'OUTROS';
    return [...transacao, categoria];
  });
}

function encontrarCategoria(descricao, categorias) {
  for (const categoria in categorias) {
    for (const palavraChave of categorias[categoria]) {
      if (descricao.includes(palavraChave.toUpperCase())) {
        return categoria;
      }
    }
  }
  return null;
}
