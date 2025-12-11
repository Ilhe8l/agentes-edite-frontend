# Sistema de Gestão de Editais FAPES

Sistema de gestão de editais desenvolvido com Vue.js 3, TypeScript e TailwindCSS, seguindo o padrão modular LEDS.

## Pré-requisitos 
- Docker
- Docker Compose
- Node.js (versão 16 ou superior)
- npm (gerenciador de pacotes do Node.js)
- Vue CLI (opcional, para facilitar o desenvolvimento)
- Django (para o backend), disponível em: [Repositório Django](https://github.com/leds-conectafapes/agentes-edite-controlpanel)

## Instalação
1. Clone o repositório:
    ```bash
    git clone https://github.com/Ilhe8l/agentes-edite-frontend.git

    cd agentes-edite-frontend
    ```
2. Configure as variáveis de ambiente:
    - Crie um arquivo `.env` na raiz do projeto e adicione as variáveis necessárias conforme o arquivo `.env.example`.
3. Construa e inicie os contêineres Docker:
    ```bash
    docker-compose up --build
    ```
4. Acesse a aplicação:
    - Abra o navegador e vá para `http://localhost:5173`.

## Detalhes do Projeto
- **Frontend**: Desenvolvido com Vue.js 3, TypeScript e TailwindCSS.
- **Backend**: Desenvolvido com Django (repositório separado).
- **Padrão Modular**: Segue o padrão LEDS para organização do código.
- **Mocks**: A aplicação não inclui dados mockados, dependendo do backend para funcionalidade completa.

## Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.