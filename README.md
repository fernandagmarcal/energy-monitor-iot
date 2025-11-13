## ⚡ Energy Monitor IoT: Monitoramento Inteligente de Energia Elétrica

Este projeto é um **Monitoramento Inteligente de Energia Elétrica (Energy Monitor IoT)**, desenvolvido para aquisição, processamento e visualização em tempo real de grandezas elétricas.

Utilizando um circuito de hardware dedicado, o sistema coleta dados brutos de tensão e corrente, que são processados por uma API backend (módulo `API_IOT` https://github.com/joao-fcosta/API_IOT) para calcular métricas cruciais como:
* **Potência Ativa (W)**
* **Módulos RMS** (Tensão e Corrente efetivas)
* **Fator de Potência (FP)**
* **Distorção Harmônica Total (THD)**

O frontend, construído com ajuda da ferramenta Lovable, está totalmente configurado e integrado à API, ajustando e exibindo os dados obtidos diretamente do circuito de medição. Ele oferece um painel de controle completo com:
* Visualizações de **forma de onda instantânea**.
* Análise detalhada de **harmônicos**.
* Histórico de **consumo de energia**.

O objetivo principal é fornecer uma ferramenta robusta e flexível para a análise da **qualidade da energia** e a **otimização do consumo** em ambientes residenciais ou industriais.
