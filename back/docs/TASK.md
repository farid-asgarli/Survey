# Task: Build a Multi-Tenant Survey Management System (.NET 8.0)

## Business Context

Create a SurveySparrow-like application that enables organizations to create, distribute, and analyze surveys. The system must support multi-tenancy through **namespace isolation**, where each namespace represents an organization or tenant with its own users, surveys, and data.

### Core Business Concepts

- **Namespaces**: Logical containers for tenant isolation. Each namespace has its own set of users, surveys, responses, and settings. A default namespace exists for system-wide operations.
- **Users**: Belong to one or more namespaces with specific roles (Owner, Admin, Member, Viewer, Respondent)
- **Surveys**: Question collections created within a namespace, with various question types (multiple choice, text, rating, matrix, etc.)
- **Survey Distribution**: Surveys can be shared via links, emails, or embedded forms
- **Responses**: Collected answers from respondents, tracked and analyzed within the namespace
- **Analytics**: Real-time reporting and insights on survey responses per namespace

## Architecture Requirements

Implement a **layered architecture** with **Domain-Driven Design** principles:

### Layer 1: Domain Layer (Core Business Logic)

**Purpose**: Contains all business entities, value objects, domain events, and business rules. This layer has NO dependencies on other layers or infrastructure.

**What to include**:

1. **Entities** (with rich domain behavior):

   - `Namespace`: Root aggregate

     - Properties: Id, Name, Slug (unique), SubscriptionTier, IsActive, MaxUsers, MaxSurveys
     - Business rules: Slug validation, subscription limits enforcement
     - Methods: AddUser(), RemoveMember(), UpgradeSubscription()

   - `User`:

     - Properties: Id, Email, PasswordHash, FirstName, LastName
     - Relationships: NamespaceMemberships (many-to-many with Namespace)

   - `NamespaceMembership` (join entity with domain logic):

     - Properties: UserId, NamespaceId, Role (enum), JoinedAt, InvitedBy
     - Business rules: Role-based permission validation
     - Methods: PromoteRole(), HasPermission(action)

   - `Survey`: Aggregate root

     - Properties: Id, NamespaceId, Title, Description, Status (Draft/Published/Closed), CreatedBy
     - Collections: Questions (value objects or entities)
     - Business rules: Cannot modify published surveys, must have at least one question
     - Methods: Publish(), Close(), AddQuestion(), RemoveQuestion()

   - `Question`:

     - Properties: Id, SurveyId, Text, Type (enum), Order, IsRequired, Settings (JSON for type-specific config)
     - Question types: SingleChoice, MultipleChoice, Text, LongText, Rating, Scale, Matrix, Date, FileUpload

   - `SurveyResponse`: Aggregate root

     - Properties: Id, SurveyId, RespondentEmail, SubmittedAt, IsComplete, TimeSpent, IpAddress
     - Collections: Answers
     - Methods: SubmitAnswer(), Complete(), ValidateCompleteness()

   - `Answer`:
     - Properties: Id, ResponseId, QuestionId, AnswerValue (JSON to handle different types)

2. **Value Objects**:

   - `Email`: Email validation logic
   - `NamespaceSlug`: Slug formatting and uniqueness rules
   - `QuestionSettings`: Type-specific question configurations
   - `SurveyStats`: Calculated statistics (response count, completion rate)

3. **Domain Events**:

   - `SurveyPublishedEvent`
   - `ResponseSubmittedEvent`
   - `UserInvitedToNamespaceEvent`
   - `NamespaceCreatedEvent`

4. **Enums**:

   - `NamespaceRole`: Owner, Admin, Member, Viewer, Respondent
   - `SurveyStatus`: Draft, Published, Closed, Archived
   - `QuestionType`: SingleChoice, MultipleChoice, Text, etc.
   - `SubscriptionTier`: Free, Pro, Enterprise

5. **Interfaces** (repository contracts):

   - `INamespaceRepository`
   - `IUserRepository`
   - `ISurveyRepository`
   - `ISurveyResponseRepository`

6. **Base Classes** for common functionality:
   - `Entity<TId>`: Base class with Id, auditing fields
   - `AggregateRoot<TId>`: Extends Entity, adds domain events collection
   - `IAuditable`: Interface with CreatedAt, CreatedBy, UpdatedAt, UpdatedBy, IsDeleted, DeletedAt

**Auditing Requirements**:

- All entities must implement `IAuditable`
- Track: CreatedAt, CreatedBy (UserId), UpdatedAt, UpdatedBy, IsDeleted (soft delete), DeletedAt, DeletedBy
- Audit trail should be automatically populated (handled in Application/Infrastructure layers)

### Layer 2: Application Layer (Use Cases & Orchestration)

**Purpose**: Implements application-specific business logic, coordinates domain objects, and defines use cases. This layer depends on the Domain layer but not on Infrastructure.

**What to include**:

1. **Commands** (CQRS write operations):

   - `CreateNamespaceCommand` / `CreateNamespaceCommandHandler`
   - `CreateSurveyCommand` / `CreateSurveyCommandHandler`
   - `PublishSurveyCommand` / `PublishSurveyCommandHandler`
   - `SubmitSurveyResponseCommand` / `SubmitSurveyResponseCommandHandler`
   - `InviteUserToNamespaceCommand` / `InviteUserToNamespaceCommandHandler`

2. **Queries** (CQRS read operations):

   - `GetNamespaceSurveysQuery` / `GetNamespaceSurveysQueryHandler`
   - `GetSurveyResponsesQuery` / `GetSurveyResponsesQueryHandler`
   - `GetSurveyAnalyticsQuery` / `GetSurveyAnalyticsQueryHandler`
   - `GetUserNamespacesQuery` / `GetUserNamespacesQueryHandler`

3. **DTOs** (Data Transfer Objects):

   - Request DTOs: `CreateSurveyRequest`, `SubmitResponseRequest`
   - Response DTOs: `SurveyDto`, `SurveyResponseDto`, `AnalyticsDto`
   - Use AutoMapper for entity-to-DTO mapping

4. **Validators** (FluentValidation):

   - Validate commands/queries before processing
   - Examples: `CreateSurveyCommandValidator`, `SubmitResponseCommandValidator`

5. **Services**:

   - `ISurveyDistributionService`: Handle survey link generation, email distribution
   - `IAnalyticsService`: Calculate statistics, generate reports
   - `INotificationService`: Interface for sending emails/notifications

6. **Common**:

   - `Result<T>` pattern for operation results (success/failure with errors)
   - `PagedList<T>` for pagination
   - Exception types: `NamespaceNotFoundException`, `UnauthorizedAccessException`, `ValidationException`

7. **Behaviors** (MediatR pipeline):
   - `ValidationBehavior`: Automatic validation before command execution
   - `LoggingBehavior`: Log all commands/queries
   - `TransactionBehavior`: Wrap commands in database transactions
   - `AuditBehavior`: Automatically populate audit fields

### Layer 3: Infrastructure Layer (External Concerns)

**Purpose**: Implements interfaces defined in Domain/Application layers. Handles data persistence, external services, and cross-cutting concerns.

**What to include**:

1. **Persistence**:

   - `ApplicationDbContext`: EF Core DbContext
   - Configure entity mappings with Fluent API
   - Implement repository interfaces from Domain layer
   - Configure indexes for performance (NamespaceId, SurveyId, UserId)
   - Implement soft delete query filters
   - Automatic audit field population via SaveChanges override

2. **Migrations**:

   - EF Core migrations for database schema
   - Seed default namespace and admin user

3. **Identity**:

   - ASP.NET Core Identity integration for authentication
   - JWT token generation and validation
   - Custom claims for namespace context

4. **External Services**:

   - Email service implementation (SMTP, SendGrid, etc.)
   - File storage service (local, Azure Blob, S3)
   - Caching service (Redis, Memory Cache)

5. **Configurations**:
   - Entity configurations (Fluent API)
   - Dependency injection setup
   - Options pattern for settings

### Layer 4: API Layer (Presentation)

**Purpose**: RESTful API endpoints, authentication, authorization, and API documentation.

**What to include**:

1. **Controllers**:

   - `NamespacesController`: CRUD operations for namespaces
   - `SurveysController`: Survey management within namespace context
   - `ResponsesController`: Submit and view responses
   - `AnalyticsController`: Survey analytics and reports
   - `UsersController`: User management and invitations

2. **Middleware**:

   - `NamespaceContextMiddleware`: Extract and validate namespace from request (header, route, subdomain)
   - `ExceptionHandlingMiddleware`: Global error handling
   - `AuditMiddleware`: Track user actions

3. **Authentication & Authorization**:

   - JWT Bearer authentication
   - Custom authorization policies: `RequireNamespaceAccess`, `RequireRole(NamespaceRole)`
   - `[Authorize]` attributes with namespace context validation

4. **API Features**:

   - Versioning (v1, v2)
   - Swagger/OpenAPI documentation
   - CORS configuration
   - Rate limiting per namespace
   - Health checks

5. **Namespace Context Resolution**:
   Support multiple strategies for namespace identification:
   - Header: `X-Namespace-Id` or `X-Namespace-Slug`
   - Route: `/api/namespaces/{namespaceId}/surveys`
   - Subdomain: `acme.surveyapp.com` (slug-based)
   - Default namespace fallback for public endpoints

## Key Technical Decisions

### 1. Multi-Tenancy via Namespace Isolation

- Each namespace has isolated data
- Use `NamespaceId` foreign key on all tenant-scoped entities
- Apply global query filters in DbContext to automatically filter by namespace
- Namespace context stored in `HttpContext` after middleware extraction

### 2. CQRS Pattern

- Use MediatR for command/query separation
- Commands modify state, queries only read
- Different models for reads vs writes where beneficial

### 3. Domain Events

- Entities raise domain events (in-memory)
- MediatR handles domain event dispatching
- Use for cross-aggregate communication and side effects

### 4. Soft Delete

- Implement soft delete for all entities via `IsDeleted` flag
- Configure global query filters to exclude deleted entities by default
- Allow explicit querying of deleted items when needed

### 5. Audit Trail

- Automatically track: Created/Updated/Deleted timestamps and user IDs
- Implement via `SaveChanges` override in DbContext
- Use `IHttpContextAccessor` to get current user ID

### 6. Validation Strategy

- Domain: Business rule validation in entities
- Application: FluentValidation for commands/queries
- API: Model validation with Data Annotations as fallback

## Implementation Guidelines

### Namespace Structure

```
SurveyApp.Domain/
  - Entities/
  - ValueObjects/
  - Enums/
  - Events/
  - Interfaces/
  - Common/

SurveyApp.Application/
  - Commands/
  - Queries/
  - DTOs/
  - Services/
  - Validators/
  - Behaviors/
  - Common/

SurveyApp.Infrastructure/
  - Persistence/
    - Configurations/
    - Repositories/
    - Migrations/
  - Identity/
  - Services/
  - DependencyInjection.cs

SurveyApp.API/
  - Controllers/
  - Middleware/
  - Filters/
  - Extensions/
  - Program.cs
```

### Database Schema Considerations

- Use **Guid** for all entity IDs (better for distributed systems)
- Composite unique index on (NamespaceId, Slug) for sluggable entities
- Index on frequently filtered fields: NamespaceId, CreatedAt, Status
- JSON columns for flexible data (Question.Settings, Answer.AnswerValue)
- Consider separate tables for survey templates vs survey instances

### Security Requirements

1. All endpoints require authentication except public survey submission
2. Namespace isolation must be enforced at data access layer
3. Users can only access namespaces they belong to
4. Role-based permissions enforced via policies
5. Public survey links use secure tokens (GUID-based)
6. Rate limiting to prevent abuse

### Performance Considerations

1. Use eager loading for navigation properties when needed
2. Implement pagination on all list endpoints
3. Cache frequently accessed data (namespace settings, user permissions)
4. Use projection (Select) to avoid loading unnecessary data
5. Consider read replicas for analytics queries
6. Async/await for all I/O operations

## Expected Deliverables

When implementing this specification, generate:

1. **Complete Domain Layer**: All entities, value objects, enums, interfaces with rich domain logic
2. **Application Layer**: Commands, queries, handlers, DTOs, validators, services
3. **Infrastructure Layer**: DbContext, repositories, configurations, migrations, identity setup
4. **API Layer**: Controllers, middleware, authentication/authorization, Swagger setup
5. **Program.cs**: Complete dependency injection and middleware pipeline configuration
6. **README.md**: Setup instructions, architecture overview, API documentation

## Success Criteria

The implementation should:

- ✅ Enforce namespace isolation at database and API levels
- ✅ Support multiple users per namespace with role-based permissions
- ✅ Allow survey creation, publishing, and response collection
- ✅ Automatically audit all entity changes
- ✅ Implement soft delete across all entities
- ✅ Provide comprehensive validation at all layers
- ✅ Use CQRS pattern with MediatR
- ✅ Follow DDD principles with rich domain models
- ✅ Include authentication and authorization
- ✅ Generate Swagger documentation
- ✅ Be production-ready with proper error handling

## Additional Notes

- Use **nullable reference types** enabled in .NET 8.0
- Follow **clean code principles** and SOLID design patterns
- Include **XML documentation comments** for public APIs
- Use **async/await** consistently
- Implement **proper logging** with Serilog or built-in ILogger
- Consider **health checks** for monitoring
- Include **unit tests** structure (separate project) if requested

## Default Namespace Bootstrap

On first run, seed:

- A default namespace with slug "default"
- A system admin user belonging to the default namespace
- Sample survey templates (optional)

This ensures the system is immediately usable after deployment.
