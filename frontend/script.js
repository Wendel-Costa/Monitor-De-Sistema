const URL_BASE_API = 'http://127.0.0.1:5000/api';

async function buscarInfoSistema() {
    try {
        const resposta = await fetch(`${URL_BASE_API}/info_sistema`);
        const dados = await resposta.json();

        if (resposta.ok) {
            document.getElementById('hostname-sistema').textContent = dados.hostname;
            document.getElementById('sistema-operacional').textContent = dados.sistema_operacional;
            document.getElementById('tempo-inicializacao').textContent = dados.tempo_inicializacao;

            document.getElementById('cpu-nucleos-fisicos').textContent = dados.cpu.nucleos_fisicos;
            document.getElementById('cpu-nucleos-logicos').textContent = dados.cpu.nucleos_logicos;
            document.getElementById('cpu-frequencia').textContent = dados.cpu.frequencia_mhz !== "N/A" ? dados.cpu.frequencia_mhz.toFixed(2) : "N/A";
            document.getElementById('cpu-percentual').textContent = dados.cpu.uso_percentual;

            document.getElementById('mem-total').textContent = dados.memoria.total_gb;
            document.getElementById('mem-usada').textContent = dados.memoria.usada_gb;
            document.getElementById('mem-livre').textContent = dados.memoria.livre_gb;
            document.getElementById('mem-percentual').textContent = dados.memoria.uso_percentual;

            document.getElementById('disco-total').textContent = dados.disco.total_gb;
            document.getElementById('disco-usada').textContent = dados.disco.usada_gb;
            document.getElementById('disco-livre').textContent = dados.disco.livre_gb;
            document.getElementById('disco-percentual').textContent = dados.disco.uso_percentual;

            const infoBateriaElement = document.getElementById('info-bateria');
            if (typeof dados.bateria === 'object') {
                document.getElementById('bateria-percentual').textContent = dados.bateria.percentual;
                document.getElementById('bateria-conectado').textContent = dados.bateria.conectado_energia ? 'Sim' : 'Não';
                document.getElementById('bateria-segundos-restantes').textContent = formatarTempo(dados.bateria.segundos_restantes);
                infoBateriaElement.style.display = 'block';
            } else {
                infoBateriaElement.innerHTML = `<p><strong>Bateria:</strong> ${dados.bateria}</p>`;
                infoBateriaElement.style.display = 'block';
            }
        } else {
            console.error('Erro ao buscar informações do sistema:', dados.erro);
        }
    } catch (erro) {
        console.error('Erro na requisição de informações do sistema:', erro);
    }
}

function formatarTempo(segundos) {
    if (segundos === "Ilimitado") return "Ilimitado";
    if (segundos < 0) return "Calculando...";
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    const segundosRestantes = Math.floor(segundos % 60);
    return `${horas}h ${minutosRestantes}m ${segundosRestantes}s`;
}

async function buscarProcessos() {
    try {
        const resposta = await fetch(`${URL_BASE_API}/processos`);
        const processos = await resposta.json();

        if (resposta.ok) {
            exibirProcessos(processos);
        } else {
            console.error('Erro ao buscar lista de processos:', processos.erro);
        }
    } catch (erro) {
        console.error('Erro na requisição de lista de processos:', erro);
    }
}

function exibirProcessos(processos) {
    const corpoTabela = document.getElementById('corpo-tabela-processos');
    corpoTabela.innerHTML = '';

    const termoBusca = document.getElementById('busca-processos').value.toLowerCase();

    processos.forEach(processo => {
        if (processo.name.toLowerCase().includes(termoBusca) || String(processo.pid).includes(termoBusca)) {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${processo.pid}</td>
                <td>${processo.name}</td>
                <td>${processo.status}</td>
                <td>${processo.cpu_percent ? processo.cpu_percent.toFixed(1) : 'N/A'}</td>
                <td>${processo.memory_percent ? processo.memory_percent.toFixed(1) : 'N/A'}</td>
                <td><button class="btn btn-sm btn-info botao-ver-detalhes" data-pid="${processo.pid}">Detalhes</button></td>
            `;
            corpoTabela.appendChild(linha);
        }
    });

    document.querySelectorAll('.botao-ver-detalhes').forEach(botao => {
        botao.addEventListener('click', lidarCliqueVerDetalhes);
    });
}

async function lidarCliqueVerDetalhes(evento) {
    const pid = evento.target.dataset.pid;
    try {
        const resposta = await fetch(`${URL_BASE_API}/processo/${pid}`);
        const detalhes = await resposta.json();

        if (resposta.ok) {
            document.getElementById('modal-processo-nome').textContent = detalhes.name;
            document.getElementById('modal-processo-pid').textContent = detalhes.pid;
            document.getElementById('modal-processo-status').textContent = detalhes.status;
            document.getElementById('modal-processo-cpu').textContent = detalhes.cpu_percent ? detalhes.cpu_percent.toFixed(1) : 'N/A';
            document.getElementById('modal-processo-mem').textContent = detalhes.memory_percent ? detalhes.memory_percent.toFixed(1) : 'N/A';
            document.getElementById('modal-processo-linha-comando').textContent = detalhes.cmdline ? detalhes.cmdline.join(' ') : 'N/A';
            document.getElementById('modal-processo-hora-criacao').textContent = detalhes.create_time_formatada;
            document.getElementById('modal-processo-threads').textContent = detalhes.num_threads;
            document.getElementById('modal-processo-usuario').textContent = detalhes.username;
            document.getElementById('modal-processo-executavel').textContent = detalhes.exe || 'N/A';

            const modal = new bootstrap.Modal(document.getElementById('modalDetalhesProcesso'));
            modal.show();
        } else {
            alert(`Erro ao obter detalhes do processo: ${detalhes.erro}`);
            console.error('Erro ao buscar detalhes do processo:', detalhes.erro);
        }
    } catch (erro) {
        alert(`Erro na requisição de detalhes do processo: ${erro}`);
        console.error('Erro na requisição de detalhes do processo:', erro);
    }
}

document.getElementById('busca-processos').addEventListener('input', buscarProcessos);

function atualizarInfoPeriodicamente() {
    buscarInfoSistema();
    buscarProcessos();
    setTimeout(atualizarInfoPeriodicamente, 5000);
}

atualizarInfoPeriodicamente();