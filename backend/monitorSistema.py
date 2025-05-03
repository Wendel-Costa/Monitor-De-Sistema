import psutil
from flask import Flask, jsonify
from flask_cors import CORS
import socket
import datetime
import platform

app = Flask(__name__)
CORS(app)

@app.route('/api/info_sistema', methods=['GET'])
def obter_info_sistema():
    """Coleta informações gerais do sistema."""
    try:
        nucleos_fisicos_cpu = psutil.cpu_count(logical=False)
        nucleos_logicos_cpu = psutil.cpu_count(logical=True)
        percentual_cpu = psutil.cpu_percent(interval=1)
        frequencia_cpu = psutil.cpu_freq()

        info_memoria = psutil.virtual_memory()
        memoria_total_gb = round(info_memoria.total / (1024**3), 2)
        memoria_usada_gb = round(info_memoria.used / (1024**3), 2)
        memoria_livre_gb = round(info_memoria.free / (1024**3), 2) 
        percentual_memoria = info_memoria.percent

        info_disco = psutil.disk_usage('/')
        disco_total_gb = round(info_disco.total / (1024**3), 2)
        disco_usado_gb = round(info_disco.used / (1024**3), 2)
        disco_livre_gb = round(info_disco.free / (1024**3), 2)
        percentual_disco = info_disco.percent

        info_bateria = None
        try:
            bateria = psutil.sensors_battery()
            if bateria:
                info_bateria = {
                    "percentual": bateria.percent,
                    "conectado_energia": bateria.power_plugged,
                    "segundos_restantes": bateria.secsleft if bateria.secsleft != psutil.POWER_TIME_UNLIMITED else "Ilimitado"
                }
            else:
                info_bateria = "Informação de bateria não disponível neste sistema."
        except AttributeError:
            info_bateria = "Informação de bateria não disponível (Erro de Atributo)."

        tempo_inicializacao_sistema = psutil.boot_time()
        hora_inicializacao = datetime.datetime.fromtimestamp(tempo_inicializacao_sistema).strftime("%Y-%m-%d %H:%M:%S") 

        hostname_sistema = socket.gethostname()

        dados_sistema = {
            "cpu": {
                "nucleos_fisicos": nucleos_fisicos_cpu,
                "nucleos_logicos": nucleos_logicos_cpu,
                "uso_percentual": percentual_cpu,
                "frequencia_mhz": frequencia_cpu.current if frequencia_cpu else "N/A"
            },
            "memoria": {
                "total_gb": memoria_total_gb,
                "usada_gb": memoria_usada_gb,
                "livre_gb": memoria_livre_gb,
                "uso_percentual": percentual_memoria
            },
            "disco": {
                "total_gb": disco_total_gb,
                "usada_gb": disco_usado_gb,
                "livre_gb": disco_livre_gb,
                "uso_percentual": percentual_disco
            },
            "bateria": info_bateria,
            "tempo_inicializacao": hora_inicializacao,
            "hostname": hostname_sistema,
            "sistema_operacional": f"{platform.system()} {platform.release()}"
        }
        return jsonify(dados_sistema)

    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route('/api/processos', methods=['GET'])
def listar_processos():
    """Lista os processos em execução."""
    lista_processos = []
    try:
        for proc in psutil.process_iter(['pid', 'name', 'status', 'cpu_percent', 'memory_percent']):
            try:
                lista_processos.append(proc.as_dict(attrs=['pid', 'name', 'status', 'cpu_percent', 'memory_percent']))
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass

        lista_processos.sort(key=lambda p: p.get('cpu_percent', 0.0), reverse=True)

        return jsonify(lista_processos)
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route('/api/processo/<int:pid>', methods=['GET'])
def obter_detalhes_processo(pid):
    """Obtém detalhes de um processo pelo PID."""
    try:
        p = psutil.Process(pid)
        detalhes = p.as_dict(attrs=['pid', 'name', 'status', 'cpu_percent', 'memory_percent', 'cmdline', 'create_time', 'num_threads', 'username', 'exe'])
        
        detalhes['create_time_formatada'] = datetime.datetime.fromtimestamp(detalhes['create_time']).strftime("%Y-%m-%d %H:%M:%S")

        return jsonify(detalhes)
    except psutil.NoSuchProcess:
        return jsonify({"erro": f"Processo com PID {pid} não encontrado."}), 404
    except psutil.AccessDenied:
        return jsonify({"erro": f"Acesso negado para obter detalhes do processo com PID {pid}."}), 403
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route('/api/processo/<int:pid>/encerrar', methods=['POST'])
def encerrar_processo(pid):
    """Encerra um processo pelo PID."""
    try:
        p = psutil.Process(pid)
        p.terminate()
        p.wait(timeout=3)
        return jsonify({"mensagem": f"Processo com PID {pid} encerrado com sucesso."}), 200
    except psutil.NoSuchProcess:
        return jsonify({"erro": f"Processo com PID {pid} não encontrado."}), 404
    except psutil.AccessDenied:
        return jsonify({"erro": f"Acesso negado para encerrar o processo com PID {pid}."}), 403
    except psutil.TimeoutExpired:
        return jsonify({"erro": f"Não foi possível encerrar o processo com PID {pid} dentro do tempo limite."}), 500
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)