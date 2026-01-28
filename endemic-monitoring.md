# Sistema de Monitorização de Doenças Endémicas

## Visão Geral

Sistema web full-stack para monitorização, análise e resposta a doenças endémicas. Permite registo de casos, acompanhamento georreferenciado, alertas e relatórios estatísticos.

**Tipo de Projeto:** WEB (Full-Stack)
**Framework:** Laravel 11
**Disciplina:** Programação Web - ISPI

---

## Critérios de Sucesso

- [ ] API RESTful funcional
- [ ] Autenticação com Laravel Sanctum
- [ ] Dashboard com gráficos de evolução temporal
- [ ] Mapas de calor georreferenciados
- [ ] Geração de relatórios PDF/CSV
- [ ] Ficha de paciente com QR Code
- [ ] Interface responsiva

---

## Stack Tecnológica

| Camada | Tecnologia | Justificação |
|--------|------------|--------------|
| **Backend** | Laravel 11 | Framework PHP moderno, MVC, Eloquent ORM |
| **Base de Dados** | MySQL 8 | Relacional, suporte nativo Laravel |
| **Autenticação** | Laravel Sanctum | API tokens, SPA support |
| **Frontend** | Blade + Alpine.js + Tailwind | Integração nativa Laravel |
| **Gráficos** | Chart.js | Leve, fácil integração |
| **Mapas** | Leaflet.js | Open-source |
| **PDF** | barryvdh/laravel-dompdf | Package Laravel |
| **QR Code** | simplesoftwareio/simple-qrcode | Package Laravel |
| **Excel/CSV** | maatwebsite/excel | Export nativo |

---

## Estrutura Laravel

```
/PPW/app
├── /app
│   ├── /Http
│   │   ├── /Controllers
│   │   │   ├── Api/              # API Controllers
│   │   │   └── Web/              # Web Controllers
│   │   ├── /Middleware
│   │   └── /Requests             # Form Requests
│   ├── /Models
│   ├── /Services
│   └── /Exports                  # Excel exports
├── /database
│   ├── /migrations
│   ├── /seeders
│   └── /factories
├── /resources
│   ├── /views
│   └── /js
├── /routes
│   ├── api.php
│   └── web.php
├── /tests
└── /docs
```

---

## Tarefas

### Fase 1: Setup Laravel (Hoje)
| # | Tarefa | Comando/Ação | Verificação |
|---|--------|--------------|-------------|
| 1.1 | Criar projeto Laravel | `composer create-project laravel/laravel app` | Pasta `app` existe |
| 1.2 | Configurar `.env` | Editar DB credentials | `php artisan migrate` funciona |
| 1.3 | Instalar Sanctum | `php artisan install:api` | Auth routes disponíveis |

### Fase 2: Migrations & Models
| # | Tarefa | Comando | Verificação |
|---|--------|---------|-------------|
| 2.1 | Migration `users` (já existe) | - | Tabela users OK |
| 2.2 | Migration `diseases` | `php artisan make:migration` | Tabela criada |
| 2.3 | Migration `cases` | `php artisan make:migration` | Tabela criada |
| 2.4 | Migration `alerts` | `php artisan make:migration` | Tabela criada |
| 2.5 | Migration `educational_contents` | `php artisan make:migration` | Tabela criada |
| 2.6 | Criar Models com relationships | `php artisan make:model -a` | Models funcionam |
| 2.7 | Seeders com dados de teste | `php artisan db:seed` | Dados inseridos |

### Fase 3: API Backend
| # | Tarefa | Endpoint | Verificação |
|---|--------|----------|-------------|
| 3.1 | AuthController (register/login) | POST /api/register, /api/login | Token retornado |
| 3.2 | DiseaseController CRUD | GET/POST/PUT/DELETE /api/diseases | CRUD funciona |
| 3.3 | CaseController CRUD | GET/POST/PUT/DELETE /api/cases | CRUD funciona |
| 3.4 | AlertController CRUD | GET/POST /api/alerts | Alertas criados |
| 3.5 | StatsController | GET /api/stats | JSON com estatísticas |
| 3.6 | ReportController | GET /api/reports/pdf, /csv | Download funciona |
| 3.7 | PublicController | GET /api/public/info | Dados públicos |

### Fase 4: Frontend (Views)
| # | Tarefa | Verificação |
|---|--------|-------------|
| 4.1 | Layout base com Tailwind | Página renderiza |
| 4.2 | Login/Register views | Formulários funcionam |
| 4.3 | Dashboard com Chart.js | Gráficos renderizam |
| 4.4 | Mapa com Leaflet.js | Mapa com markers |
| 4.5 | Listagem de casos | Tabela com paginação |
| 4.6 | Formulário de caso | Submissão salva |
| 4.7 | Ficha do paciente com QR | QR Code visível |
| 4.8 | Página pública educativa | Acessível sem login |

### Fase 5: Documentação
| # | Tarefa | Verificação |
|---|--------|-------------|
| 5.1 | README.md | Instruções claras |
| 5.2 | API Documentation (Postman/Swagger) | Endpoints documentados |
| 5.3 | Manual do utilizador | PDF exportado |

---

## Phase X: Verificação

```bash
# Testes Laravel
php artisan test

# Lint
./vendor/bin/pint

# Security
python .agent/skills/vulnerability-scanner/scripts/security_scan.py .
```

---

## Próximo Passo

**Iniciar Fase 1: Setup Laravel**
