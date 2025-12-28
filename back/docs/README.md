# SurveyApp - Multi-Tenant Survey Management System

A SurveySparrow-like application that enables organizations to create, distribute, and analyze surveys with multi-tenancy through namespace isolation.

## 🏗️ Architecture

This application follows **Clean Architecture / Layered Architecture** with **Domain-Driven Design (DDD)** principles:

```text
┌─────────────────────────────────────────────────────────┐
│                    API Layer                             │
│  Controllers, Middleware, Authentication, Swagger        │
├─────────────────────────────────────────────────────────┤
│                 Application Layer                        │
│  CQRS (Commands/Queries), DTOs, Validators, Behaviors    │
├─────────────────────────────────────────────────────────┤
│               Infrastructure Layer                       │
│  EF Core, Repositories, Identity, External Services      │
├─────────────────────────────────────────────────────────┤
│                   Domain Layer                           │
│  Entities, Value Objects, Domain Events, Interfaces      │
└─────────────────────────────────────────────────────────┘
```

### Key Patterns & Technologies

- **.NET 8.0** - Target Framework
- **Entity Framework Core 8.0** - ORM with PostgreSQL
- **Npgsql** - PostgreSQL provider
- **MediatR** - CQRS pattern implementation
- **FluentValidation** - Request validation
- **AutoMapper** - Object-to-object mapping
- **ASP.NET Core Identity** - User management
- **JWT Bearer** - Token-based authentication
- **Serilog** - Structured logging
- **Swagger/OpenAPI** - API documentation
- **API Versioning** - Support for multiple API versions
- **Rate Limiting** - Per-namespace request throttling
- **Health Checks** - Application and database health monitoring

## 📁 Project Structure

```text
SurveyApp/
├── src/
│   ├── SurveyApp.Domain/           # Core business logic
│   │   ├── Common/                 # Base classes (Entity, AggregateRoot, ValueObject)
│   │   ├── Entities/               # Domain entities
│   │   ├── Enums/                  # Enumerations
│   │   ├── Events/                 # Domain events
│   │   ├── Interfaces/             # Repository interfaces
│   │   └── ValueObjects/           # Value objects
│   │
│   ├── SurveyApp.Application/      # Application logic
│   │   ├── Behaviors/              # MediatR pipeline behaviors
│   │   ├── Common/                 # Result<T>, PagedList<T>, etc.
│   │   ├── DTOs/                   # Data transfer objects
│   │   ├── Exceptions/             # Application exceptions
│   │   ├── Features/               # CQRS Commands & Queries
│   │   │   ├── Namespaces/
│   │   │   ├── Surveys/
│   │   │   ├── Responses/
│   │   │   └── Users/
│   │   ├── Interfaces/             # Service interfaces
│   │   ├── Mappings/               # AutoMapper profiles
│   │   ├── Services/               # Service interfaces
│   │   └── Validators/             # FluentValidation validators
│   │
│   ├── SurveyApp.Infrastructure/   # External concerns
│   │   ├── Identity/               # JWT, Identity services
│   │   ├── Persistence/            # EF Core DbContext & configurations
│   │   ├── Repositories/           # Repository implementations
│   │   └── Services/               # External service implementations
│   │
│   └── SurveyApp.API/              # Presentation layer
│       ├── Controllers/            # API endpoints
│       ├── Middleware/             # Custom middleware
│       └── Services/               # API-specific services
│
└── SurveyApp.sln                   # Solution file
```

## 🚀 Getting Started

### Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PostgreSQL 14+](https://www.postgresql.org/download/)
- [Visual Studio 2022](https://visualstudio.microsoft.com/) or [VS Code](https://code.visualstudio.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-repo/surveyapp.git
   cd surveyapp
   ```

2. **Restore packages**

   ```bash
   dotnet restore
   ```

3. **Update connection strings** in `appsettings.Development.json`:

   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=surveyapp_dev;Username=postgres;Password=postgres",
       "IdentityConnection": "Host=localhost;Port=5432;Database=surveyapp_identity_dev;Username=postgres;Password=postgres"
     }
   }
   ```

4. **Create PostgreSQL databases**

   ```bash
   psql -U postgres -c "CREATE DATABASE surveyapp_dev;"
   psql -U postgres -c "CREATE DATABASE surveyapp_identity_dev;"
   ```

5. **Apply database migrations**

   ```bash
   cd src/SurveyApp.API
   dotnet ef database update --context ApplicationDbContext
   dotnet ef database update --context ApplicationIdentityDbContext
   ```

6. **Run the application**

   ```bash
   dotnet run --project src/SurveyApp.API
   ```

7. **Open Swagger UI** at `https://localhost:5001` (or configured port)

### Default Admin User

On first run, the application seeds a default namespace and admin user:

- **Email**: `admin@surveyapp.com`
- **Password**: `Admin@123456`
- **Namespace**: `default`

## 🔐 Authentication

The API uses JWT Bearer authentication. To access protected endpoints:

1. **Register a user**

   ```http
   POST /api/auth/register
   Content-Type: application/json

   {
     "email": "user@example.com",
     "password": "Password123!",
     "firstName": "John",
     "lastName": "Doe"
   }
   ```

2. **Login to get token**

   ```http
   POST /api/auth/login
   Content-Type: application/json

   {
     "email": "user@example.com",
     "password": "Password123!"
   }
   ```

3. **Use token in requests**

   ```http
   Authorization: Bearer <your-jwt-token>
   ```

## 🏢 Multi-Tenancy

The application implements multi-tenancy through **namespace isolation**. Each organization (namespace) has its own isolated data.

### Setting Namespace Context

Include the namespace ID in request headers:

```http
X-Namespace-Id: <namespace-guid>
```

Or use namespace slug:

```http
X-Namespace-Slug: my-organization
```

## 📡 API Endpoints

### API Versioning

The API supports versioning through multiple mechanisms:

- **URL Segment**: `/api/v1/surveys`
- **Header**: `X-Api-Version: 1.0`
- **Query String**: `/api/surveys?api-version=1.0`

### Rate Limiting

The API implements rate limiting to prevent abuse:

| Limiter | Limit | Window | Use Case |
| ------- | ----- | ------ | -------- |
| fixed | 100 requests | 1 minute | Global rate limit |
| per-namespace | 1000 requests | 1 minute | Namespace-specific |
| auth | 10 requests | 1 minute | Authentication endpoints |

### Health Check Endpoints

| Endpoint | Description |
| -------- | ----------- |
| `/health` | Full health status with all checks |
| `/health/ready` | Readiness probe (database) |
| `/health/live` | Liveness probe (app running) |

### Namespaces

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/namespaces` | Get user's namespaces |
| GET | `/api/namespaces/{id}` | Get namespace by ID |
| GET | `/api/namespaces/slug/{slug}` | Get namespace by slug |
| POST | `/api/namespaces` | Create namespace |
| PUT | `/api/namespaces/{id}` | Update namespace |
| GET | `/api/namespaces/{id}/members` | Get namespace members |
| POST | `/api/namespaces/{id}/invite` | Invite user to namespace |
| DELETE | `/api/namespaces/{id}/members/{userId}` | Remove member |

### Surveys

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/surveys` | Get surveys (paginated) |
| GET | `/api/surveys/{id}` | Get survey by ID |
| GET | `/api/surveys/public/{id}` | Get public survey (no auth) |
| POST | `/api/surveys` | Create survey |
| PUT | `/api/surveys/{id}` | Update survey |
| POST | `/api/surveys/{id}/publish` | Publish survey |
| POST | `/api/surveys/{id}/close` | Close survey |
| DELETE | `/api/surveys/{id}` | Delete survey |
| GET | `/api/surveys/{id}/analytics` | Get survey analytics |

### Responses

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/responses` | Get responses (paginated) |
| GET | `/api/responses/{id}` | Get response by ID |
| POST | `/api/responses` | Submit survey response |
| DELETE | `/api/responses/{id}` | Delete response |

### Users

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/users/me` | Get current user |
| PUT | `/api/users/me` | Update profile |

### Authentication

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

## 📊 Question Types

The system supports various question types:

| Type | Description |
| ---- | ----------- |
| `ShortText` | Single-line text input |
| `LongText` | Multi-line text area |
| `SingleChoice` | Radio buttons (one selection) |
| `MultipleChoice` | Checkboxes (multiple selections) |
| `Dropdown` | Dropdown select |
| `Rating` | Star or numeric rating |
| `Scale` | Linear scale (1-10, etc.) |
| `Date` | Date picker |
| `Time` | Time picker |
| `DateTime` | Date and time picker |
| `FileUpload` | File attachment |
| `Email` | Email input with validation |
| `Number` | Numeric input |
| `Phone` | Phone number input |
| `Url` | URL input with validation |
| `YesNo` | Yes/No toggle |
| `Matrix` | Matrix/grid question |
| `Ranking` | Ranking/ordering |
| `NPS` | Net Promoter Score |
| `Signature` | Digital signature |

## 🧪 Creating Migrations

To create a new migration after model changes:

```bash
cd src/SurveyApp.API

# For ApplicationDbContext
dotnet ef migrations add <MigrationName> --context ApplicationDbContext --output-dir ../SurveyApp.Infrastructure/Persistence/Migrations

# For ApplicationIdentityDbContext
dotnet ef migrations add <MigrationName> --context ApplicationIdentityDbContext --output-dir ../SurveyApp.Infrastructure/Identity/Migrations
```

## 🔧 Configuration

### JWT Settings

```json
{
  "JwtSettings": {
    "Secret": "your-secret-key-at-least-32-chars",
    "Issuer": "SurveyApp",
    "Audience": "SurveyAppUsers",
    "ExpirationInMinutes": 60,
    "RefreshTokenExpirationInDays": 7
  }
}
```

### CORS Settings

```json
{
  "AllowedOrigins": [
    "http://localhost:3000",
    "https://your-frontend-domain.com"
  ]
}
```

## 📝 Domain Events

The system publishes domain events for key business actions:

- `NamespaceCreatedEvent` - When a new namespace is created
- `UserInvitedToNamespaceEvent` - When a user is invited to a namespace
- `SurveyPublishedEvent` - When a survey is published
- `ResponseSubmittedEvent` - When a survey response is submitted

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password hashing** using ASP.NET Core Identity
- **Role-based access control** (Owner, Admin, Member, Viewer)
- **Namespace isolation** for multi-tenancy
- **Soft delete** for data recovery
- **Audit trail** (CreatedAt, CreatedBy, UpdatedAt, UpdatedBy)

## 📈 Behaviors (Cross-Cutting Concerns)

The application uses MediatR pipeline behaviors:

1. **ValidationBehavior** - Validates requests using FluentValidation
2. **LoggingBehavior** - Logs request/response details
3. **TransactionBehavior** - Wraps commands in database transactions
4. **PerformanceBehavior** - Monitors slow requests (>500ms)
5. **AuditBehavior** - Audit logging for commands

## 🐳 Docker Support (Optional)

Create a `Dockerfile` in the API project:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/SurveyApp.API/SurveyApp.API.csproj", "src/SurveyApp.API/"]
COPY ["src/SurveyApp.Application/SurveyApp.Application.csproj", "src/SurveyApp.Application/"]
COPY ["src/SurveyApp.Domain/SurveyApp.Domain.csproj", "src/SurveyApp.Domain/"]
COPY ["src/SurveyApp.Infrastructure/SurveyApp.Infrastructure.csproj", "src/SurveyApp.Infrastructure/"]
RUN dotnet restore "src/SurveyApp.API/SurveyApp.API.csproj"
COPY . .
WORKDIR "/src/src/SurveyApp.API"
RUN dotnet build "SurveyApp.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SurveyApp.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SurveyApp.API.dll"]
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
