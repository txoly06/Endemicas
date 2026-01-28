# 📚 API Documentation - Sistema de Monitorização de Doenças Endémicas

**Versão:** 1.0.0  
**Base URL:** `http://localhost:8000/api`  
**Autenticação:** Bearer Token (Sanctum)  

---

## 📋 Índice

1. [Autenticação](#-autenticação)
2. [Rotas Públicas](#-rotas-públicas)
3. [Doenças](#-doenças)
4. [Casos](#-casos)
5. [Alertas](#-alertas)
6. [Estatísticas](#-estatísticas)
7. [Conteúdo Educativo](#-conteúdo-educativo)
8. [Códigos de Erro](#-códigos-de-erro)
9. [Recomendações para Frontend](#-recomendações-para-frontend)

---

## 🔐 Autenticação

### Visão Geral

A API utiliza **Laravel Sanctum** com sistema de **access + refresh tokens**:

| Token | Duração | Uso |
|-------|---------|-----|
| Access Token | 60 minutos | Autenticação de requests |
| Refresh Token | 30 dias | Obter novos tokens |

### Headers Obrigatórios

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {access_token}
```

---

### POST `/auth/register`

Registra um novo utilizador.

**Rate Limit:** 10 requests/minuto

**Request Body:**
```json
{
    "name": "João Silva",
    "email": "joao@email.ao",
    "password": "MinhaPassword123",
    "password_confirmation": "MinhaPassword123",
    "role": "health_professional",
    "phone": "+244 923 456 789",
    "institution": "Hospital Central de Luanda"
}
```

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `name` | string | ✅ | max: 255 |
| `email` | string | ✅ | email válido, único |
| `password` | string | ✅ | confirmado |
| `role` | string | ❌ | `health_professional` \| `public` (default: `public`) |
| `phone` | string | ❌ | max: 20 |
| `institution` | string | ❌ | max: 255 |

> ⚠️ **Nota:** O role `admin` não pode ser auto-registado por segurança.

**Response (201):**
```json
{
    "message": "User registered successfully",
    "user": {
        "id": 4,
        "name": "João Silva",
        "email": "joao@email.ao",
        "role": "health_professional"
    },
    "access_token": "1|abc123...",
    "refresh_token": "2|xyz789...",
    "expires_in": 3600,
    "token_type": "Bearer"
}
```

---

### POST `/auth/login`

Autentica um utilizador.

**Rate Limit:** 10 requests/minuto

**Request Body:**
```json
{
    "email": "admin@sistema.ao",
    "password": "password123"
}
```

**Response (200):**
```json
{
    "message": "Login successful",
    "user": {
        "id": 1,
        "name": "Administrador",
        "email": "admin@sistema.ao",
        "role": "admin",
        "institution": "Ministério da Saúde"
    },
    "access_token": "3|abc123...",
    "refresh_token": "4|xyz789...",
    "expires_in": 3600,
    "token_type": "Bearer"
}
```

**Response (422) - Credenciais inválidas:**
```json
{
    "message": "The provided credentials are incorrect.",
    "errors": {
        "email": ["The provided credentials are incorrect."]
    }
}
```

---

### POST `/auth/refresh`

Renova os tokens usando o refresh token.

**Request Body:**
```json
{
    "refresh_token": "4|xyz789..."
}
```

**Response (200):**
```json
{
    "message": "Token refreshed successfully",
    "user": { ... },
    "access_token": "5|new_access...",
    "refresh_token": "6|new_refresh...",
    "expires_in": 3600,
    "token_type": "Bearer"
}
```

---

### POST `/auth/logout` 🔒

Revoga o token atual.

**Response (200):**
```json
{
    "message": "Logged out successfully"
}
```

---

### POST `/auth/revoke-all` 🔒

Revoga todos os tokens do utilizador (logout de todos os dispositivos).

**Response (200):**
```json
{
    "message": "All tokens revoked successfully"
}
```

---

### GET `/auth/me` 🔒

Retorna o utilizador autenticado.

**Response (200):**
```json
{
    "user": {
        "id": 1,
        "name": "Administrador",
        "email": "admin@sistema.ao",
        "role": "admin",
        "phone": null,
        "institution": "Ministério da Saúde"
    }
}
```

---

## 🌐 Rotas Públicas

Estas rotas **não requerem autenticação**.

### GET `/public/diseases`

Lista todas as doenças ativas.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `search` | string | Busca por nome ou código |
| `per_page` | int | Itens por página (default: 15) |

**Response (200):**
```json
{
    "data": [
        {
            "id": 1,
            "name": "Malária",
            "code": "MAL001",
            "description": "Doença causada pelo parasita Plasmodium...",
            "symptoms": "Febre, calafrios, sudorese...",
            "prevention": "Uso de mosquiteiros...",
            "is_active": true
        }
    ],
    "current_page": 1,
    "per_page": 15,
    "total": 5
}
```

---

### GET `/public/alerts`

Lista alertas ativos ordenados por severidade.

**Response (200):**
```json
[
    {
        "id": 1,
        "title": "Surto de Malária em Luanda",
        "message": "Aumento significativo de casos...",
        "severity": "critical",
        "affected_area": "Viana, Cacuaco",
        "is_active": true,
        "expires_at": "2026-02-15T00:00:00Z",
        "disease": {
            "id": 1,
            "name": "Malária"
        }
    }
]
```

---

### GET `/public/content`

Lista conteúdo educativo publicado.

**Response (200):**
```json
{
    "data": [
        {
            "id": 1,
            "title": "Guia de Prevenção da Malária",
            "slug": "guia-prevencao-malaria",
            "type": "guide",
            "excerpt": "Aprenda a proteger...",
            "is_published": true
        }
    ]
}
```

### GET `/public/content/{slug}`

Detalhes de um conteúdo específico.

---

## 🦠 Doenças

### GET `/diseases` 🔒

Lista doenças com filtros.

**Permissões:** Todos os utilizadores autenticados

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `active` | boolean | Filtrar por status ativo |
| `search` | string | Busca por nome/código |
| `per_page` | int | Itens por página |

---

### POST `/diseases` 🔒 👑

Cria uma nova doença.

**Permissões:** Apenas `admin`

**Request Body:**
```json
{
    "name": "Dengue",
    "code": "DEN001",
    "description": "Doença viral transmitida pelo mosquito Aedes...",
    "symptoms": "Febre alta, dor de cabeça, dores musculares...",
    "prevention": "Eliminar água parada, usar repelente...",
    "treatment": "Hidratação, repouso, analgésicos...",
    "is_active": true
}
```

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `name` | string | ✅ |
| `code` | string | ✅ (único) |
| `description` | string | ❌ |
| `symptoms` | string | ❌ |
| `prevention` | string | ❌ |
| `treatment` | string | ❌ |
| `is_active` | boolean | ❌ (default: true) |

---

### GET `/diseases/{id}` 🔒

Detalhes de uma doença com casos recentes.

**Permissões:** `admin`, `health_professional`

---

### PUT `/diseases/{id}` 🔒 👑

Atualiza uma doença.

**Permissões:** Apenas `admin`

---

### DELETE `/diseases/{id}` 🔒 👑

Remove uma doença.

**Permissões:** Apenas `admin`

---

## 📋 Casos

### GET `/cases` 🔒

Lista casos com filtros.

**Permissões:** `admin`, `health_professional`

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `disease_id` | int | Filtrar por doença |
| `province` | string | Filtrar por província |
| `status` | string | `suspected` \| `confirmed` \| `recovered` \| `deceased` |
| `start_date` | date | Data início (YYYY-MM-DD) |
| `end_date` | date | Data fim (YYYY-MM-DD) |
| `search` | string | Busca por nome/código paciente |
| `per_page` | int | Itens por página |

**Response (200):**
```json
{
    "data": [
        {
            "id": 1,
            "patient_code": "CASE-A1B2C3D4",
            "patient_name": "Maria Santos",
            "patient_gender": "F",
            "status": "confirmed",
            "province": "Luanda",
            "municipality": "Viana",
            "diagnosis_date": "2026-01-25",
            "disease": {
                "id": 1,
                "name": "Malária"
            }
        }
    ],
    "current_page": 1,
    "total": 30
}
```

---

### POST `/cases` 🔒

Regista um novo caso.

**Permissões:** `admin`, `health_professional`

**Request Body:**
```json
{
    "disease_id": 1,
    "patient_name": "António Silva",
    "patient_dob": "1985-03-15",
    "patient_id_number": "001234567LA001",
    "patient_gender": "M",
    "symptoms_reported": "Febre alta, calafrios, dor de cabeça",
    "symptom_onset_date": "2026-01-20",
    "diagnosis_date": "2026-01-25",
    "status": "suspected",
    "province": "Luanda",
    "municipality": "Viana",
    "commune": "Zango",
    "latitude": -8.8383,
    "longitude": 13.2344,
    "notes": "Paciente com histórico de malária"
}
```

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `disease_id` | int | ✅ | ID de doença existente |
| `patient_name` | string | ✅ | max: 255 |
| `patient_dob` | date | ✅ | YYYY-MM-DD |
| `patient_id_number` | string | ❌ | Número de BI |
| `patient_gender` | string | ✅ | `M` \| `F` \| `O` |
| `symptoms_reported` | string | ✅ | |
| `symptom_onset_date` | date | ✅ | YYYY-MM-DD |
| `diagnosis_date` | date | ✅ | YYYY-MM-DD |
| `status` | string | ❌ | default: `suspected` |
| `province` | string | ✅ | max: 100 |
| `municipality` | string | ✅ | max: 100 |
| `commune` | string | ❌ | max: 100 |
| `latitude` | decimal | ❌ | -90 a 90 |
| `longitude` | decimal | ❌ | -180 a 180 |
| `notes` | string | ❌ | |

---

### GET `/cases/{id}` 🔒

Detalhes de um caso com dados mascarados.

**Permissões:** `admin`, `health_professional`

**Response (200):**
```json
{
    "id": 1,
    "patient_code": "CASE-A1B2C3D4",
    "patient_name": "António Silva",
    "patient_dob": "1985-03-15",
    "patient_gender": "M",
    "masked_id_number": "****0001",
    "status": "confirmed",
    "qr_data": "{\"code\":\"CASE-A1B2C3D4\",\"name\":\"António Silva\",\"dob\":\"1985-03-15\",\"verified\":\"2026-01-27T12:00:00Z\"}",
    "disease": { ... },
    "registered_by": {
        "id": 2,
        "name": "Dr. Manuel"
    },
    "histories": [
        {
            "id": 1,
            "previous_status": "suspected",
            "new_status": "confirmed",
            "notes": "Teste positivo",
            "created_at": "2026-01-26T10:00:00Z",
            "user": { "id": 2, "name": "Dr. Manuel" }
        }
    ]
}
```

> 🔒 **Segurança:** O `patient_id_number` nunca é exposto. Apenas o `masked_id_number` é retornado.

---

### PUT `/cases/{id}` 🔒

Atualiza um caso. Mudanças de status são registadas no histórico.

**Permissões:** `admin`, `health_professional`

**Request Body:**
```json
{
    "status": "confirmed",
    "status_notes": "Teste laboratorial confirmou malária"
}
```

---

### DELETE `/cases/{id}` 🔒

Remove um caso (soft delete).

**Permissões:** `admin`, `health_professional`

---

### GET `/cases/{id}/history` 🔒

Histórico de alterações de status do caso.

**Permissões:** `admin`, `health_professional`

---

## 🚨 Alertas

### GET `/alerts` 🔒

Lista alertas com filtros.

**Permissões:** `admin`, `health_professional`

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `active` | boolean | Filtrar por status |
| `severity` | string | `low` \| `medium` \| `high` \| `critical` |
| `disease_id` | int | Filtrar por doença |

---

### POST `/alerts` 🔒 👑

Cria um novo alerta.

**Permissões:** Apenas `admin`

**Request Body:**
```json
{
    "disease_id": 1,
    "title": "Surto de Malária em Luanda",
    "message": "Registado aumento de 50% nos casos...",
    "severity": "high",
    "affected_area": "Viana, Cacuaco",
    "is_active": true,
    "expires_at": "2026-02-28"
}
```

---

## 📊 Estatísticas

Todas as rotas de estatísticas requerem `admin` ou `health_professional`.

### GET `/stats/dashboard` 🔒

Resumo geral para o dashboard.

**Response (200):**
```json
{
    "total_cases": 150,
    "confirmed_cases": 85,
    "suspected_cases": 40,
    "recovered_cases": 20,
    "deceased_cases": 5,
    "active_alerts": 3,
    "diseases_monitored": 5
}
```

---

### GET `/stats/cases-by-disease` 🔒

Casos agrupados por doença.

**Response (200):**
```json
[
    {
        "disease_id": 1,
        "total": 80,
        "disease": { "id": 1, "name": "Malária", "code": "MAL001" }
    },
    {
        "disease_id": 2,
        "total": 35,
        "disease": { "id": 2, "name": "Cólera", "code": "COL001" }
    }
]
```

---

### GET `/stats/cases-by-province` 🔒

Casos agrupados por província.

**Response (200):**
```json
[
    { "province": "Luanda", "total": 50 },
    { "province": "Benguela", "total": 30 },
    { "province": "Huambo", "total": 25 }
]
```

---

### GET `/stats/cases-by-status` 🔒

Casos agrupados por status.

---

### GET `/stats/timeline` 🔒

Evolução temporal de casos.

**Query Parameters:**
| Param | Tipo | Default |
|-------|------|---------|
| `days` | int | 30 (max: 365) |

**Response (200):**
```json
[
    { "date": "2026-01-01", "total": 5 },
    { "date": "2026-01-02", "total": 8 },
    { "date": "2026-01-03", "total": 3 }
]
```

---

### GET `/stats/geographic` 🔒

Dados geográficos para mapa/heatmap.

**Response (200):**
```json
[
    {
        "latitude": "-8.8383",
        "longitude": "13.2344",
        "status": "confirmed",
        "disease_id": 1,
        "disease": { "id": 1, "name": "Malária" }
    }
]
```

---

### GET `/stats/cases-by-age` 🔒

Casos por faixa etária.

**Response (200):**
```json
[
    { "age_group": "0-17", "total": 15 },
    { "age_group": "18-35", "total": 45 },
    { "age_group": "36-50", "total": 30 },
    { "age_group": "51-65", "total": 20 },
    { "age_group": "65+", "total": 10 }
]
```

---

### GET `/stats/cases-by-gender` 🔒

Casos por género.

**Response (200):**
```json
[
    { "patient_gender": "M", "total": 65 },
    { "patient_gender": "F", "total": 55 }
]
```

---

## 📖 Conteúdo Educativo

### GET `/admin/content` 🔒 👑

Lista todo o conteúdo (incluindo não publicado).

**Permissões:** Apenas `admin`

---

### POST `/content` 🔒 👑

Cria conteúdo educativo.

**Permissões:** Apenas `admin`

---

### PUT `/content/{id}` 🔒 👑

Atualiza conteúdo.

---

### DELETE `/content/{id}` 🔒 👑

Remove conteúdo.

---

## ❌ Códigos de Erro

| Código | Significado |
|--------|-------------|
| `200` | Sucesso |
| `201` | Criado com sucesso |
| `401` | Não autenticado (token inválido/expirado) |
| `403` | Não autorizado (role insuficiente) |
| `404` | Recurso não encontrado |
| `422` | Erro de validação |
| `429` | Rate limit excedido |
| `500` | Erro interno do servidor |

### Formato de Erro de Validação (422)

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password must be at least 8 characters."]
    }
}
```

### Formato de Erro de Autorização (403)

```json
{
    "message": "Forbidden",
    "error": "Insufficient permissions. Required roles: admin, health_professional"
}
```

---

## 🔑 Legenda

| Símbolo | Significado |
|---------|-------------|
| 🔒 | Requer autenticação (Bearer Token) |
| 👑 | Apenas Admin |

---

## 🚀 Recomendações para o Desenvolvedor Frontend

### 1. Gestão de Autenticação

```javascript
// Estrutura recomendada para armazenamento de tokens
const authStorage = {
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
    expiresAt: localStorage.getItem('expires_at'),
    user: JSON.parse(localStorage.getItem('user'))
};
```

#### Interceptor Axios com Refresh Automático

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor de request - adiciona token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de response - refresh automático
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const { data } = await axios.post('/api/auth/refresh', {
                    refresh_token: refreshToken
                });
                
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
                
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh falhou - redirecionar para login
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
```

---

### 2. Gestão de Roles

```javascript
// Verificar permissões no frontend
const ROLES = {
    ADMIN: 'admin',
    HEALTH_PROFESSIONAL: 'health_professional',
    PUBLIC: 'public'
};

function canAccess(requiredRoles, userRole) {
    return requiredRoles.includes(userRole);
}

// Uso
const user = JSON.parse(localStorage.getItem('user'));

if (canAccess([ROLES.ADMIN], user.role)) {
    // Mostrar botão de criar doença
}

if (canAccess([ROLES.ADMIN, ROLES.HEALTH_PROFESSIONAL], user.role)) {
    // Mostrar dashboard
}
```

---

### 3. Páginas por Role

| Página | admin | health_professional | public |
|--------|:-----:|:-------------------:|:------:|
| Login/Register | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ❌ |
| Lista de Casos | ✅ | ✅ | ❌ |
| Criar/Editar Caso | ✅ | ✅ | ❌ |
| Gestão de Doenças | ✅ | ❌ | ❌ |
| Gestão de Alertas | ✅ | ❌ | ❌ |
| Conteúdo Educativo (público) | ✅ | ✅ | ✅ |
| Gestão de Conteúdo | ✅ | ❌ | ❌ |
| Mapa de Heatmap | ✅ | ✅ | ❌ |

---

### 4. Componentes Recomendados

#### Dashboard
- Use os dados de `/stats/dashboard` para cards de resumo
- Use Chart.js com `/stats/timeline` para gráfico de evolução
- Use Chart.js com `/stats/cases-by-disease` para gráfico de barras
- Use Leaflet.js com `/stats/geographic` para heatmap

#### Lista de Casos
- Implemente filtros com query parameters
- Use paginação do servidor (não carregar todos de uma vez)
- Gerar QR Code com a propriedade `qr_data` do caso

#### Formulário de Caso
- Obter lista de doenças de `/public/diseases`
- Usar datepicker para campos de data
- Usar mapa para selecionar latitude/longitude

---

### 5. Tratamento de Erros

```javascript
function handleApiError(error) {
    if (error.response) {
        switch (error.response.status) {
            case 401:
                toast.error('Sessão expirada. Faça login novamente.');
                break;
            case 403:
                toast.error('Não tem permissão para esta ação.');
                break;
            case 422:
                // Erros de validação
                const errors = error.response.data.errors;
                Object.values(errors).flat().forEach(msg => 
                    toast.error(msg)
                );
                break;
            case 429:
                toast.error('Muitas tentativas. Aguarde um momento.');
                break;
            default:
                toast.error('Erro ao processar pedido.');
        }
    }
}
```

---

### 6. Esquema de Cores para Severidade

```css
:root {
    --severity-low: #22c55e;      /* Verde */
    --severity-medium: #f59e0b;   /* Amarelo */
    --severity-high: #f97316;     /* Laranja */
    --severity-critical: #ef4444; /* Vermelho */
    
    --status-suspected: #f59e0b;  /* Amarelo */
    --status-confirmed: #ef4444;  /* Vermelho */
    --status-recovered: #22c55e;  /* Verde */
    --status-deceased: #6b7280;   /* Cinza */
}
```

---

### 7. Províncias de Angola (para Dropdowns)

```javascript
const PROVINCES = [
    'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
    'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
    'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico',
    'Namibe', 'Uíge', 'Zaire'
];
```

---

### 8. Checklist de Implementação

- [ ] **Auth**: Login, Register, Logout, Refresh Token
- [ ] **Routing**: Proteger rotas por role
- [ ] **Dashboard**: Cards + Gráficos + Mapa
- [ ] **Casos**: CRUD + Filtros + Paginação + QR Code
- [ ] **Doenças**: CRUD (apenas admin)
- [ ] **Alertas**: CRUD (apenas admin) + Badge de severidade
- [ ] **Conteúdo**: Página pública + CRUD admin
- [ ] **Error Handling**: Toast notifications
- [ ] **Loading States**: Skeletons/Spinners
- [ ] **Responsividade**: Mobile-first

---

**Última atualização:** 2026-01-28
