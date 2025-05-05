# Monitor de Sistema em Tempo Real

Projeto desenvolvido para a cadeira de Sistemas Operacionais

O objetivo é fornecer uma visualização das métricas de performance do computador e permitir a interação com os processos em execução.

## Funcionalidades

* **Informações Gerais do Sistema:** Exibe hostname, sistema operacional, tempo de inicialização.
* **Monitoramento de Recursos:**
    * Detalhes da CPU (núcleos físicos/lógicos, frequência, uso percentual).
    * Detalhes da Memória RAM (total, usada, livre, uso percentual).
    * Detalhes do Disco (total, usado, livre, uso percentual).
    * Visualização gráfica do uso histórico de CPU, Memória e Disco.
    * Informações da Bateria (percentual, status de carga, tempo restante - se disponível).
* **Gerenciamento de Processos:**
    * Listagem de todos os processos em execução com informações básicas (PID, nome, status, uso de CPU/Memória).
    * Campo de busca para filtrar processos por nome ou PID.
    * Visualização detalhada de um processo específico (linha de comando, hora de criação, threads, usuário, executável).
    * Funcionalidade para encerrar um processo selecionado.

## Tecnologias Utilizadas

* **Backend:** Python 3.x, Flask, psutil, Flask-CORS.
* **Frontend:** HTML5, CSS3 (Bootstrap 5), JavaScript, Chart.js.

## Pré-requisitos

* Python 3.6+ instalado.
* Gerenciador de pacotes pip.
* Um navegador web moderno.

## Instalação e Configuração

1.  **Clone o repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd monitor-sistema # Substitua 'monitor-sistema' pelo nome da pasta do seu projeto
    ```

2.  **Instale as dependências do backend:**
    ```bash
    pip install flask psutil flask-cors
    ```

## Como Executar

1.  **Certifique-se de estar no diretório do projeto**.

2.  **Inicie o backend Flask:**
    ```bash
    python monitorSistema.py
    ```
    O servidor irá iniciar, geralmente em `http://localhost:5000`.

3.  **Acesse a interface web:**
    Abra seu navegador e vá para `http://localhost:5000`. A página `index.html` será carregada e começará a buscar e exibir os dados do sistema.

## Como Usar

* A interface web exibirá automaticamente as informações gerais do sistema, CPU, Memória e Disco, com gráficos de uso em tempo real.
* A lista de processos mostrará os processos ativos. Use a caixa de texto acima da tabela para filtrar a lista por nome ou PID.
* Clique no botão "Detalhes" ao lado de um processo para ver informações mais completas em uma janela modal.
* Dentro da modal de detalhes do processo, você encontrará um botão "Encerrar Processo" que tentará finalizar a execução do processo selecionado.
