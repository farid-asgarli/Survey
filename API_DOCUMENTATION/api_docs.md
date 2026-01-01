# SurveyApp API Documentation

Auto-generated API documentation with request/response models for each endpoint.

## Table of Contents

- [Auth](#auth)
- [EmailDistributions](#emaildistributions)
- [EmailTemplates](#emailtemplates)
- [EmailTracking](#emailtracking)
- [Files](#files)
- [Namespaces](#namespaces)
- [QuestionLogic](#questionlogic)
- [Questions](#questions)
- [RecurringSurveys](#recurringsurveys)
- [Responses](#responses)
- [SurveyLinks](#surveylinks)
- [Surveys](#surveys)
- [Templates](#templates)
- [Themes](#themes)
- [Translations](#translations)
- [Users](#users)

---

## Auth

**Base Route:** `api/auth`
**Default Authorization:** None

### 🌐 POST `api/auth/register`

_Register a new user_

**Action:** `Register`

#### Request Body

**Model:** `RegisterCommand`

```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
```

| Property    | Type     | Required |
| ----------- | -------- | -------- |
| `email`     | `string` | Yes      |
| `password`  | `string` | Yes      |
| `firstName` | `string` | Yes      |
| `lastName`  | `string` | Yes      |

#### Responses

| Status | Description | Model             |
| ------ | ----------- | ----------------- |
| 200    | O K         | `AuthResponseDto` |
| 400    | Bad Request | -                 |

---

### 🌐 POST `api/auth/login`

_Login with email and password_

**Action:** `Login`

#### Request Body

**Model:** `LoginCommand`

```json
{
  "email": "string",
  "password": "string"
}
```

| Property   | Type     | Required |
| ---------- | -------- | -------- |
| `email`    | `string` | Yes      |
| `password` | `string` | Yes      |

#### Responses

| Status | Description  | Model             |
| ------ | ------------ | ----------------- |
| 200    | O K          | `AuthResponseDto` |
| 401    | Unauthorized | -                 |

---

### 🌐 POST `api/auth/refresh`

_Refresh an expired token_

**Action:** `Refresh`

#### Request Body

**Model:** `RefreshTokenCommand`

```json
{
  "refreshToken": "string"
}
```

| Property       | Type     | Required |
| -------------- | -------- | -------- |
| `refreshToken` | `string` | Yes      |

#### Responses

| Status | Description  | Model                     |
| ------ | ------------ | ------------------------- |
| 200    | O K          | `TokenRefreshResponseDto` |
| 401    | Unauthorized | -                         |

---

### 🌐 POST `api/auth/forgot-password`

_Request a password reset_

**Action:** `ForgotPassword`

#### Request Body

**Model:** `ForgotPasswordCommand`

```json
{
  "email": "string"
}
```

| Property | Type     | Required |
| -------- | -------- | -------- |
| `email`  | `string` | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |

---

### 🌐 POST `api/auth/reset-password`

_Reset password with token_

**Action:** `ResetPassword`

#### Request Body

**Model:** `ResetPasswordCommand`

```json
{
  "email": "string",
  "token": "string",
  "newPassword": "string"
}
```

| Property      | Type     | Required |
| ------------- | -------- | -------- |
| `email`       | `string` | Yes      |
| `token`       | `string` | Yes      |
| `newPassword` | `string` | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 400    | Bad Request | -     |

---

### 🔒 POST `api/auth/logout`

_Logout and revoke the user's refresh token_

**Action:** `Logout`

#### Responses

| Status | Description  | Model |
| ------ | ------------ | ----- |
| 204    | No Content   | -     |
| 401    | Unauthorized | -     |

---

## EmailDistributions

**Base Route:** `api/surveys/{surveyId:guid}/distributions`
**Default Authorization:** Required

### 🔒 GET `api/surveys/{surveyId:guid}/distributions`

_Gets all distributions for a survey._

**Action:** `GetDistributions`

#### Parameters

| Name         | Type   | Location | Required |
| ------------ | ------ | -------- | -------- |
| `surveyId`   | `Guid` | route    | Yes      |
| `surveyId`   | `Guid` | query    | Yes      |
| `pageNumber` | `int`  | query    | Yes      |
| `pageSize`   | `int`  | query    | Yes      |

#### Responses

| Status | Description | Model            |
| ------ | ----------- | ---------------- |
| 400    | Bad Request | `ProblemDetails` |

---

### 🔒 GET `api/surveys/{surveyId:guid}/distributions/{distId:guid}`

_Gets a distribution by its ID._

**Action:** `GetDistributionById`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |
| `distId`   | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model                  |
| ------ | ----------- | ---------------------- |
| 200    | O K         | `EmailDistributionDto` |
| 404    | Not Found   | `ProblemDetails`       |

---

### 🔒 POST `api/surveys/{surveyId:guid}/distributions`

_Creates a new email distribution._

**Action:** `CreateDistribution`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `CreateDistributionCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "emailTemplateId": "00000000-0000-0000-0000-000000000000",
  "subject": "string",
  "body": "string",
  "senderName": "string",
  "senderEmail": "string",
  "recipients": []
}
```

| Property          | Type                      | Required |
| ----------------- | ------------------------- | -------- |
| `surveyId`        | `Guid`                    | Yes      |
| `emailTemplateId` | `Guid?`                   | No       |
| `subject`         | `string`                  | Yes      |
| `body`            | `string`                  | Yes      |
| `senderName`      | `string?`                 | No       |
| `senderEmail`     | `string?`                 | No       |
| `recipients`      | `List<RecipientInputDto>` | Yes      |

#### Responses

| Status | Description | Model                  |
| ------ | ----------- | ---------------------- |
| 201    | Created     | `EmailDistributionDto` |
| 400    | Bad Request | `ProblemDetails`       |

---

### 🔒 POST `api/surveys/{surveyId:guid}/distributions/{distId:guid}/schedule`

_Schedules a distribution to be sent at a specific time._

**Action:** `ScheduleDistribution`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |
| `distId`   | `Guid` | route    | Yes      |

#### Request Body

**Model:** `ScheduleDistributionCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "distributionId": "00000000-0000-0000-0000-000000000000",
  "scheduledAt": "2024-01-01T00:00:00Z"
}
```

| Property         | Type       | Required |
| ---------------- | ---------- | -------- |
| `surveyId`       | `Guid`     | Yes      |
| `distributionId` | `Guid`     | Yes      |
| `scheduledAt`    | `DateTime` | Yes      |

#### Responses

| Status | Description | Model                  |
| ------ | ----------- | ---------------------- |
| 200    | O K         | `EmailDistributionDto` |
| 400    | Bad Request | `ProblemDetails`       |
| 404    | Not Found   | `ProblemDetails`       |

---

### 🔒 POST `api/surveys/{surveyId:guid}/distributions/{distId:guid}/send`

_Sends a distribution immediately._

**Action:** `SendDistribution`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |
| `distId`   | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model                  |
| ------ | ----------- | ---------------------- |
| 200    | O K         | `EmailDistributionDto` |
| 400    | Bad Request | `ProblemDetails`       |
| 404    | Not Found   | `ProblemDetails`       |

---

### 🔒 POST `api/surveys/{surveyId:guid}/distributions/{distId:guid}/cancel`

_Cancels a scheduled distribution._

**Action:** `CancelDistribution`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |
| `distId`   | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model            |
| ------ | ----------- | ---------------- |
| 204    | No Content  | -                |
| 400    | Bad Request | `ProblemDetails` |
| 404    | Not Found   | `ProblemDetails` |

---

### 🔒 DELETE `api/surveys/{surveyId:guid}/distributions/{distId:guid}`

_Deletes a distribution._

**Action:** `DeleteDistribution`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |
| `distId`   | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model            |
| ------ | ----------- | ---------------- |
| 204    | No Content  | -                |
| 404    | Not Found   | `ProblemDetails` |

---

### 🔒 GET `api/surveys/{surveyId:guid}/distributions/{distId:guid}/stats`

_Gets distribution statistics._

**Action:** `GetDistributionStats`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |
| `distId`   | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model                  |
| ------ | ----------- | ---------------------- |
| 200    | O K         | `DistributionStatsDto` |
| 404    | Not Found   | `ProblemDetails`       |

---

### 🔒 GET `api/surveys/{surveyId:guid}/distributions/{distId:guid}/recipients`

_Gets recipients for a distribution._

**Action:** `GetDistributionRecipients`

#### Parameters

| Name             | Type               | Location | Required |
| ---------------- | ------------------ | -------- | -------- |
| `surveyId`       | `Guid`             | route    | Yes      |
| `distId`         | `Guid`             | route    | Yes      |
| `surveyId`       | `Guid`             | query    | Yes      |
| `distributionId` | `Guid`             | query    | Yes      |
| `pageNumber`     | `int`              | query    | Yes      |
| `pageSize`       | `int`              | query    | Yes      |
| `status`         | `RecipientStatus?` | query    | Yes      |

#### Responses

| Status | Description | Model                              |
| ------ | ----------- | ---------------------------------- |
| 200    | O K         | `IReadOnlyList<EmailRecipientDto>` |
| 404    | Not Found   | `ProblemDetails`                   |

---

## EmailTemplates

**Base Route:** `api/email-templates`
**Default Authorization:** Required

### 🔒 GET `api/email-templates`

_Gets all email templates in the current namespace._

**Action:** `GetEmailTemplates`

#### Parameters

| Name           | Type                 | Location | Required |
| -------------- | -------------------- | -------- | -------- |
| `page`         | `int?`               | query    | Yes      |
| `pageSize`     | `int?`               | query    | Yes      |
| `templateType` | `EmailTemplateType?` | query    | Yes      |
| `search`       | `string?`            | query    | Yes      |

#### Responses

| Status | Description | Model                                    |
| ------ | ----------- | ---------------------------------------- |
| 200    | O K         | `PagedResponse<EmailTemplateSummaryDto>` |
| 400    | Bad Request | -                                        |

---

### 🔒 GET `api/email-templates/{id:guid}`

_Gets an email template by its ID._

**Action:** `GetEmailTemplateById`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model              |
| ------ | ----------- | ------------------ |
| 200    | O K         | `EmailTemplateDto` |
| 404    | Not Found   | -                  |

---

### 🔒 POST `api/email-templates`

_Creates a new email template._

**Action:** `CreateEmailTemplate`

#### Request Body

**Model:** `CreateEmailTemplateCommand`

```json
{
  "name": "string",
  "subject": "string",
  "body": "string",
  "templateType": "EnumValue",
  "language": "string"
}
```

| Property       | Type                | Required |
| -------------- | ------------------- | -------- |
| `name`         | `string`            | Yes      |
| `subject`      | `string`            | Yes      |
| `body`         | `string`            | Yes      |
| `templateType` | `EmailTemplateType` | Yes      |
| `language`     | `string?`           | No       |

#### Responses

| Status | Description | Model              |
| ------ | ----------- | ------------------ |
| 201    | Created     | `EmailTemplateDto` |
| 400    | Bad Request | -                  |

---

### 🔒 PUT `api/email-templates/{id:guid}`

_Updates an existing email template._

**Action:** `UpdateEmailTemplate`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `UpdateEmailTemplateCommand`

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "name": "string",
  "subject": "string",
  "body": "string",
  "isDefault": true
}
```

| Property    | Type      | Required |
| ----------- | --------- | -------- |
| `id`        | `Guid`    | Yes      |
| `name`      | `string?` | No       |
| `subject`   | `string?` | No       |
| `body`      | `string?` | No       |
| `isDefault` | `bool?`   | No       |

#### Responses

| Status | Description | Model              |
| ------ | ----------- | ------------------ |
| 200    | O K         | `EmailTemplateDto` |
| 400    | Bad Request | -                  |
| 404    | Not Found   | -                  |

---

### 🔒 DELETE `api/email-templates/{id:guid}`

_Deletes an email template._

**Action:** `DeleteEmailTemplate`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/email-templates/{id:guid}/duplicate`

_Duplicates an existing email template._

**Action:** `DuplicateEmailTemplate`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `DuplicateEmailTemplateComman`

#### Responses

| Status | Description | Model              |
| ------ | ----------- | ------------------ |
| 201    | Created     | `EmailTemplateDto` |
| 404    | Not Found   | -                  |

---

## EmailTracking

**Base Route:** `api/track`
**Default Authorization:** None

### 🌐 GET `api/track/open/{token}`

_Tracks an email open event (1x1 pixel)._

**Action:** `TrackOpen`

#### Parameters

| Name    | Type     | Location | Required |
| ------- | -------- | -------- | -------- |
| `token` | `string` | route    | Yes      |

#### Responses

| Status | Description       | Model |
| ------ | ----------------- | ----- |
| 200    | O K               | -     |
| 429    | Too Many Requests | -     |

---

### 🌐 GET `api/track/click/{token}`

_Tracks a link click event and redirects to the survey._

**Action:** `TrackClick`

#### Parameters

| Name    | Type     | Location | Required |
| ------- | -------- | -------- | -------- |
| `token` | `string` | route    | Yes      |

#### Responses

| Status | Description       | Model            |
| ------ | ----------------- | ---------------- |
| 302    | Found             | -                |
| 404    | Not Found         | `ProblemDetails` |
| 429    | Too Many Requests | -                |

---

## Files

**Base Route:** `api/files`
**Default Authorization:** Required

### 🔒 DELETE `api/files/{fileId}`

_Delete a file by ID_

**Action:** `DeleteFile`

#### Parameters

| Name     | Type     | Location | Required |
| -------- | -------- | -------- | -------- |
| `fileId` | `string` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 404    | Not Found   | -     |

---

## Namespaces

**Base Route:** `api/namespaces`
**Default Authorization:** Required

### 🔒 GET `api/namespaces`

_Get all namespaces for the current user_

**Action:** `GetUserNamespaces`

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |

---

### 🔒 GET `api/namespaces/{id:guid}`

_Get a namespace by ID_

**Action:** `GetById`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

### 🔒 GET `api/namespaces/by-slug/{slug}`

_Get a namespace by slug_

**Action:** `GetBySlug`

#### Parameters

| Name   | Type     | Location | Required |
| ------ | -------- | -------- | -------- |
| `slug` | `string` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/namespaces`

_Create a new namespace_

**Action:** `Create`

#### Request Body

**Model:** `CreateNamespaceCommand`

```json
{
  "name": "string",
  "slug": "string",
  "description": "string",
  "logoUrl": "string"
}
```

| Property      | Type      | Required |
| ------------- | --------- | -------- |
| `name`        | `string`  | Yes      |
| `slug`        | `string`  | Yes      |
| `description` | `string?` | No       |
| `logoUrl`     | `string?` | No       |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 201    | Created     | -     |
| 400    | Bad Request | -     |

---

### 🔒 PUT `api/namespaces/{id:guid}`

_Update a namespace_

**Action:** `Update`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `UpdateNamespaceCommand`

```json
{
  "namespaceId": "00000000-0000-0000-0000-000000000000",
  "name": "string",
  "description": "string",
  "logoUrl": "string"
}
```

| Property      | Type      | Required |
| ------------- | --------- | -------- |
| `namespaceId` | `Guid`    | Yes      |
| `name`        | `string`  | Yes      |
| `description` | `string?` | No       |
| `logoUrl`     | `string?` | No       |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 GET `api/namespaces/{id:guid}/members`

_Get members of a namespace_

**Action:** `GetMembers`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/namespaces/{id:guid}/members`

_Invite a user to a namespace_

**Action:** `InviteMember`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `InviteUserToNamespaceCommand`

```json
{
  "namespaceId": "00000000-0000-0000-0000-000000000000",
  "email": "string",
  "role": "object"
}
```

| Property      | Type            | Required |
| ------------- | --------------- | -------- |
| `namespaceId` | `Guid`          | Yes      |
| `email`       | `string`        | Yes      |
| `role`        | `NamespaceRole` | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 201    | Created     | -     |
| 400    | Bad Request | -     |

---

### 🔒 DELETE `api/namespaces/{namespaceId:guid}/members/{membershipId:guid}`

_Remove a member from a namespace_

**Action:** `RemoveMember`

#### Parameters

| Name           | Type   | Location | Required |
| -------------- | ------ | -------- | -------- |
| `namespaceId`  | `Guid` | route    | Yes      |
| `membershipId` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 PUT `api/namespaces/{namespaceId:guid}/members/{membershipId:guid}`

_Update a member's role in a namespace_

**Action:** `UpdateMemberRole`

#### Parameters

| Name           | Type   | Location | Required |
| -------------- | ------ | -------- | -------- |
| `namespaceId`  | `Guid` | route    | Yes      |
| `membershipId` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `UpdateMemberRoleCommand`

```json
{
  "namespaceId": "00000000-0000-0000-0000-000000000000",
  "membershipId": "00000000-0000-0000-0000-000000000000",
  "role": "object"
}
```

| Property       | Type            | Required |
| -------------- | --------------- | -------- |
| `namespaceId`  | `Guid`          | Yes      |
| `membershipId` | `Guid`          | Yes      |
| `role`         | `NamespaceRole` | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

## QuestionLogic

**Base Route:** `api/surveys/{surveyId:guid}`
**Default Authorization:** Required

### 🔒 GET `api/surveys/{surveyId:guid}/questions/{questionId:guid}/logic`

_Get all logic rules for a question._

**Action:** `GetQuestionLogic`

#### Parameters

| Name         | Type   | Location | Required |
| ------------ | ------ | -------- | -------- |
| `surveyId`   | `Guid` | route    | Yes      |
| `questionId` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model                             |
| ------ | ----------- | --------------------------------- |
| 200    | O K         | `IReadOnlyList<QuestionLogicDto>` |
| 404    | Not Found   | -                                 |

---

### 🔒 POST `api/surveys/{surveyId:guid}/questions/{questionId:guid}/logic`

_Add conditional logic to a question._

**Action:** `AddQuestionLogic`

#### Parameters

| Name         | Type   | Location | Required |
| ------------ | ------ | -------- | -------- |
| `surveyId`   | `Guid` | route    | Yes      |
| `questionId` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `AddQuestionLogicCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "questionId": "00000000-0000-0000-0000-000000000000",
  "sourceQuestionId": "00000000-0000-0000-0000-000000000000",
  "operator": "object",
  "conditionValue": "string",
  "action": "object",
  "targetQuestionId": "00000000-0000-0000-0000-000000000000",
  "priority": 0
}
```

| Property           | Type            | Required |
| ------------------ | --------------- | -------- |
| `surveyId`         | `Guid`          | Yes      |
| `questionId`       | `Guid`          | Yes      |
| `sourceQuestionId` | `Guid`          | Yes      |
| `operator`         | `LogicOperator` | Yes      |
| `conditionValue`   | `string`        | Yes      |
| `action`           | `LogicAction`   | Yes      |
| `targetQuestionId` | `Guid?`         | No       |
| `priority`         | `int?`          | No       |

#### Responses

| Status | Description | Model              |
| ------ | ----------- | ------------------ |
| 201    | Created     | `QuestionLogicDto` |
| 400    | Bad Request | -                  |
| 404    | Not Found   | -                  |

---

### 🔒 PUT `api/surveys/{surveyId:guid}/questions/{questionId:guid}/logic/{logicId:guid}`

_Update an existing logic rule._

**Action:** `UpdateQuestionLogic`

#### Parameters

| Name         | Type   | Location | Required |
| ------------ | ------ | -------- | -------- |
| `surveyId`   | `Guid` | route    | Yes      |
| `questionId` | `Guid` | route    | Yes      |
| `logicId`    | `Guid` | route    | Yes      |

#### Request Body

**Model:** `UpdateQuestionLogicCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "questionId": "00000000-0000-0000-0000-000000000000",
  "logicId": "00000000-0000-0000-0000-000000000000",
  "sourceQuestionId": "00000000-0000-0000-0000-000000000000",
  "operator": "object",
  "conditionValue": "string",
  "action": "object",
  "targetQuestionId": "00000000-0000-0000-0000-000000000000",
  "priority": 0
}
```

| Property           | Type            | Required |
| ------------------ | --------------- | -------- |
| `surveyId`         | `Guid`          | Yes      |
| `questionId`       | `Guid`          | Yes      |
| `logicId`          | `Guid`          | Yes      |
| `sourceQuestionId` | `Guid`          | Yes      |
| `operator`         | `LogicOperator` | Yes      |
| `conditionValue`   | `string`        | Yes      |
| `action`           | `LogicAction`   | Yes      |
| `targetQuestionId` | `Guid?`         | No       |
| `priority`         | `int`           | Yes      |

#### Responses

| Status | Description | Model              |
| ------ | ----------- | ------------------ |
| 200    | O K         | `QuestionLogicDto` |
| 400    | Bad Request | -                  |
| 404    | Not Found   | -                  |

---

### 🔒 DELETE `api/surveys/{surveyId:guid}/questions/{questionId:guid}/logic/{logicId:guid}`

_Delete a logic rule._

**Action:** `DeleteQuestionLogic`

#### Parameters

| Name         | Type   | Location | Required |
| ------------ | ------ | -------- | -------- |
| `surveyId`   | `Guid` | route    | Yes      |
| `questionId` | `Guid` | route    | Yes      |
| `logicId`    | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 404    | Not Found   | -     |

---

### 🔒 PUT `api/surveys/{surveyId:guid}/questions/{questionId:guid}/logic/reorder`

_Reorder logic rules for a question._

**Action:** `ReorderLogic`

#### Parameters

| Name         | Type   | Location | Required |
| ------------ | ------ | -------- | -------- |
| `surveyId`   | `Guid` | route    | Yes      |
| `questionId` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `ReorderLogicPriorityCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "questionId": "00000000-0000-0000-0000-000000000000",
  "logicIds": []
}
```

| Property     | Type         | Required |
| ------------ | ------------ | -------- |
| `surveyId`   | `Guid`       | Yes      |
| `questionId` | `Guid`       | Yes      |
| `logicIds`   | `List<Guid>` | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 GET `api/surveys/{surveyId:guid}/logic-map`

_Get the full logic map for a survey._

**Action:** `GetSurveyLogicMap`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model               |
| ------ | ----------- | ------------------- |
| 200    | O K         | `SurveyLogicMapDto` |
| 404    | Not Found   | -                   |

---

### 🌐 POST `api/surveys/{surveyId:guid}/evaluate-logic`

_Evaluate logic for given answers._

**Action:** `EvaluateLogic`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `EvaluateLogicQuery`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "currentQuestionId": "00000000-0000-0000-0000-000000000000",
  "answers": []
}
```

| Property            | Type                           | Required |
| ------------------- | ------------------------------ | -------- |
| `surveyId`          | `Guid`                         | Yes      |
| `currentQuestionId` | `Guid?`                        | No       |
| `answers`           | `List<AnswerForEvaluationDto>` | Yes      |

#### Responses

| Status | Description | Model                      |
| ------ | ----------- | -------------------------- |
| 200    | O K         | `LogicEvaluationResultDto` |
| 404    | Not Found   | -                          |

---

## Questions

**Base Route:** `api/surveys/{surveyId:guid}/questions`
**Default Authorization:** Required

### 🔒 GET `api/surveys/{surveyId:guid}/questions`

_Get all questions in a survey._

**Action:** `GetQuestions`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model                        |
| ------ | ----------- | ---------------------------- |
| 200    | O K         | `IReadOnlyList<QuestionDto>` |
| 404    | Not Found   | -                            |

---

### 🔒 GET `api/surveys/{surveyId:guid}/questions/{questionId:guid}`

_Get a specific question by ID._

**Action:** `GetQuestion`

#### Parameters

| Name         | Type   | Location | Required |
| ------------ | ------ | -------- | -------- |
| `surveyId`   | `Guid` | route    | Yes      |
| `questionId` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model         |
| ------ | ----------- | ------------- |
| 200    | O K         | `QuestionDto` |
| 404    | Not Found   | -             |

---

### 🔒 POST `api/surveys/{surveyId:guid}/questions`

_Create a new question in a survey._

**Action:** `CreateQuestion`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `CreateQuestionCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "text": "string",
  "type": "EnumValue",
  "description": "string",
  "isRequired": true,
  "order": 0,
  "options": [],
  "settings": "object"
}
```

| Property      | Type                       | Required |
| ------------- | -------------------------- | -------- |
| `surveyId`    | `Guid`                     | Yes      |
| `text`        | `string`                   | Yes      |
| `type`        | `QuestionType`             | Yes      |
| `description` | `string?`                  | No       |
| `isRequired`  | `bool`                     | Yes      |
| `order`       | `int?`                     | No       |
| `options`     | `List<QuestionOptionDto>?` | No       |
| `settings`    | `QuestionSettingsDto?`     | No       |

#### Responses

| Status | Description | Model         |
| ------ | ----------- | ------------- |
| 201    | Created     | `QuestionDto` |
| 400    | Bad Request | -             |
| 404    | Not Found   | -             |

---

### 🔒 PUT `api/surveys/{surveyId:guid}/questions/{questionId:guid}`

_Update a question in a survey._

**Action:** `UpdateQuestion`

#### Parameters

| Name         | Type   | Location | Required |
| ------------ | ------ | -------- | -------- |
| `surveyId`   | `Guid` | route    | Yes      |
| `questionId` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `UpdateQuestionCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "questionId": "00000000-0000-0000-0000-000000000000",
  "text": "string",
  "description": "string",
  "isRequired": true,
  "order": 0,
  "options": [],
  "settings": "object"
}
```

| Property      | Type                       | Required |
| ------------- | -------------------------- | -------- |
| `surveyId`    | `Guid`                     | Yes      |
| `questionId`  | `Guid`                     | Yes      |
| `text`        | `string?`                  | No       |
| `description` | `string?`                  | No       |
| `isRequired`  | `bool?`                    | No       |
| `order`       | `int?`                     | No       |
| `options`     | `List<QuestionOptionDto>?` | No       |
| `settings`    | `QuestionSettingsDto?`     | No       |

#### Responses

| Status | Description | Model         |
| ------ | ----------- | ------------- |
| 200    | O K         | `QuestionDto` |
| 400    | Bad Request | -             |
| 404    | Not Found   | -             |

---

### 🔒 DELETE `api/surveys/{surveyId:guid}/questions/{questionId:guid}`

_Delete a question from a survey._

**Action:** `DeleteQuestion`

#### Parameters

| Name         | Type   | Location | Required |
| ------------ | ------ | -------- | -------- |
| `surveyId`   | `Guid` | route    | Yes      |
| `questionId` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 PUT `api/surveys/{surveyId:guid}/questions/reorder`

_Reorder questions in a survey._

**Action:** `ReorderQuestions`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `ReorderQuestionsCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "questionIds": []
}
```

| Property      | Type         | Required |
| ------------- | ------------ | -------- |
| `surveyId`    | `Guid`       | Yes      |
| `questionIds` | `List<Guid>` | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/surveys/{surveyId:guid}/questions/sync`

_Batch sync questions in a survey._

**Action:** `BatchSyncQuestions`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `BatchSyncQuestionsCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "questions": []
}
```

| Property    | Type                     | Required |
| ----------- | ------------------------ | -------- |
| `surveyId`  | `Guid`                   | Yes      |
| `questions` | `List<QuestionSyncItem>` | Yes      |

#### Responses

| Status | Description | Model                      |
| ------ | ----------- | -------------------------- |
| 200    | O K         | `BatchSyncQuestionsResult` |
| 400    | Bad Request | -                          |
| 404    | Not Found   | -                          |

---

## RecurringSurveys

**Base Route:** `api/recurring-surveys`
**Default Authorization:** Required

### 🔒 GET `api/recurring-surveys`

_Get all recurring surveys in the current namespace._

**Action:** `GetRecurringSurveys`

#### Parameters

| Name         | Type      | Location | Required |
| ------------ | --------- | -------- | -------- |
| `pageNumber` | `int`     | query    | Yes      |
| `pageSize`   | `int`     | query    | Yes      |
| `searchTerm` | `string?` | query    | Yes      |
| `isActive`   | `bool?`   | query    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |

---

### 🔒 GET `api/recurring-surveys/upcoming`

_Get upcoming scheduled runs._

**Action:** `GetUpcomingRuns`

#### Parameters

| Name    | Type  | Location | Required |
| ------- | ----- | -------- | -------- |
| `count` | `int` | query    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |

---

### 🔒 GET `api/recurring-surveys/{id:guid}`

_Get a recurring survey by ID._

**Action:** `GetById`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/recurring-surveys`

_Create a new recurring survey._

**Action:** `Create`

#### Request Body

**Model:** `CreateRecurringSurveyCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "name": "string",
  "pattern": "object",
  "cronExpression": "string",
  "sendTime": "object",
  "timezoneId": "string",
  "dayOfMonth": 0,
  "audienceType": "EnumValue",
  "audienceListId": "00000000-0000-0000-0000-000000000000",
  "sendReminders": true,
  "reminderDaysAfter": 0,
  "maxReminders": 0,
  "customSubject": "string",
  "customMessage": "string",
  "endsAt": "2024-01-01T00:00:00Z",
  "maxRuns": 0,
  "activateImmediately": true
}
```

| Property              | Type                | Required |
| --------------------- | ------------------- | -------- |
| `surveyId`            | `Guid`              | Yes      |
| `name`                | `string`            | Yes      |
| `pattern`             | `RecurrencePattern` | Yes      |
| `cronExpression`      | `string?`           | No       |
| `sendTime`            | `TimeOnly`          | Yes      |
| `timezoneId`          | `string`            | Yes      |
| `dayOfMonth`          | `int?`              | No       |
| `audienceType`        | `AudienceType`      | Yes      |
| `audienceListId`      | `Guid?`             | No       |
| `sendReminders`       | `bool`              | Yes      |
| `reminderDaysAfter`   | `int`               | Yes      |
| `maxReminders`        | `int`               | Yes      |
| `customSubject`       | `string?`           | No       |
| `customMessage`       | `string?`           | No       |
| `endsAt`              | `DateTime?`         | No       |
| `maxRuns`             | `int?`              | No       |
| `activateImmediately` | `bool`              | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 201    | Created     | -     |
| 400    | Bad Request | -     |

---

### 🔒 PUT `api/recurring-surveys/{id:guid}`

_Update a recurring survey._

**Action:** `Update`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `UpdateRecurringSurveyCommand`

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "name": "string",
  "pattern": "object",
  "cronExpression": "string",
  "sendTime": "object",
  "timezoneId": "string",
  "dayOfMonth": 0,
  "audienceType": "EnumValue",
  "audienceListId": "00000000-0000-0000-0000-000000000000",
  "sendReminders": true,
  "reminderDaysAfter": 0,
  "maxReminders": 0,
  "customSubject": "string",
  "customMessage": "string",
  "endsAt": "2024-01-01T00:00:00Z",
  "maxRuns": 0
}
```

| Property            | Type                | Required |
| ------------------- | ------------------- | -------- |
| `id`                | `Guid`              | Yes      |
| `name`              | `string`            | Yes      |
| `pattern`           | `RecurrencePattern` | Yes      |
| `cronExpression`    | `string?`           | No       |
| `sendTime`          | `TimeOnly`          | Yes      |
| `timezoneId`        | `string`            | Yes      |
| `dayOfMonth`        | `int?`              | No       |
| `audienceType`      | `AudienceType`      | Yes      |
| `audienceListId`    | `Guid?`             | No       |
| `sendReminders`     | `bool`              | Yes      |
| `reminderDaysAfter` | `int`               | Yes      |
| `maxReminders`      | `int`               | Yes      |
| `customSubject`     | `string?`           | No       |
| `customMessage`     | `string?`           | No       |
| `endsAt`            | `DateTime?`         | No       |
| `maxRuns`           | `int?`              | No       |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 DELETE `api/recurring-surveys/{id:guid}`

_Delete a recurring survey._

**Action:** `Delete`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/recurring-surveys/{id:guid}/pause`

_Pause a recurring survey._

**Action:** `Pause`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/recurring-surveys/{id:guid}/resume`

_Resume a paused recurring survey._

**Action:** `Resume`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/recurring-surveys/{id:guid}/trigger`

_Trigger an immediate run of a recurring survey._

**Action:** `Trigger`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

### 🔒 GET `api/recurring-surveys/{id:guid}/runs`

_Get run history for a recurring survey._

**Action:** `GetRuns`

#### Parameters

| Name                | Type   | Location | Required |
| ------------------- | ------ | -------- | -------- |
| `id`                | `Guid` | route    | Yes      |
| `recurringSurveyId` | `Guid` | query    | Yes      |
| `pageNumber`        | `int`  | query    | Yes      |
| `pageSize`          | `int`  | query    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

### 🔒 GET `api/recurring-surveys/{id:guid}/runs/{runId:guid}`

_Get a specific run by ID._

**Action:** `GetRunById`

#### Parameters

| Name    | Type   | Location | Required |
| ------- | ------ | -------- | -------- |
| `id`    | `Guid` | route    | Yes      |
| `runId` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

## Responses

**Base Route:** `api/responses`
**Default Authorization:** Required

### 🔒 GET `api/responses`

_Get responses for a survey_

**Action:** `GetResponses`

#### Parameters

| Name        | Type        | Location | Required |
| ----------- | ----------- | -------- | -------- |
| `surveyId`  | `Guid`      | query    | Yes      |
| `page`      | `int?`      | query    | Yes      |
| `pageSize`  | `int?`      | query    | Yes      |
| `startDate` | `DateTime?` | query    | Yes      |
| `endDate`   | `DateTime?` | query    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |

---

### 🔒 GET `api/responses/{id:guid}`

_Get a response by ID_

**Action:** `GetById`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

### 🌐 POST `api/responses/start`

_Start a new survey response (creates a draft response)._

**Action:** `Start`

#### Request Body

**Model:** `StartResponseCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "shareToken": "string",
  "respondentEmail": "string",
  "language": "string"
}
```

| Property          | Type      | Required |
| ----------------- | --------- | -------- |
| `surveyId`        | `Guid?`   | No       |
| `shareToken`      | `string?` | No       |
| `respondentEmail` | `string?` | No       |
| `language`        | `string?` | No       |

#### Responses

| Status | Description | Model                 |
| ------ | ----------- | --------------------- |
| 201    | Created     | `StartResponseResult` |
| 400    | Bad Request | -                     |
| 404    | Not Found   | -                     |

---

### 🌐 POST `api/responses`

_Submit/complete a survey response._

**Action:** `Submit`

#### Request Body

**Model:** `SubmitSurveyResponseCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "responseId": "00000000-0000-0000-0000-000000000000",
  "shareToken": "string",
  "answers": [],
  "respondentEmail": "string",
  "respondentName": "string",
  "language": "string"
}
```

| Property          | Type              | Required |
| ----------------- | ----------------- | -------- |
| `surveyId`        | `Guid?`           | No       |
| `responseId`      | `Guid?`           | No       |
| `shareToken`      | `string?`         | No       |
| `answers`         | `List<AnswerDto>` | Yes      |
| `respondentEmail` | `string?`         | No       |
| `respondentName`  | `string?`         | No       |
| `language`        | `string?`         | No       |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 201    | Created     | -     |
| 400    | Bad Request | -     |

---

### 🌐 POST `api/responses/{id:guid}/submit`

_Submit/complete an existing draft response by ID._

**Action:** `SubmitById`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `SubmitSurveyResponseCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "responseId": "00000000-0000-0000-0000-000000000000",
  "shareToken": "string",
  "answers": [],
  "respondentEmail": "string",
  "respondentName": "string",
  "language": "string"
}
```

| Property          | Type              | Required |
| ----------------- | ----------------- | -------- |
| `surveyId`        | `Guid?`           | No       |
| `responseId`      | `Guid?`           | No       |
| `shareToken`      | `string?`         | No       |
| `answers`         | `List<AnswerDto>` | Yes      |
| `respondentEmail` | `string?`         | No       |
| `respondentName`  | `string?`         | No       |
| `language`        | `string?`         | No       |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 DELETE `api/responses/{id:guid}`

_Delete a response_

**Action:** `Delete`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/responses/bulk-delete`

_Delete multiple responses in bulk_

**Action:** `BulkDelete`

#### Request Body

**Model:** `BulkDeleteResponsesCommand`

```json
{
  "responseIds": []
}
```

| Property      | Type         | Required |
| ------------- | ------------ | -------- |
| `responseIds` | `List<Guid>` | Yes      |

#### Responses

| Status | Description | Model            |
| ------ | ----------- | ---------------- |
| 200    | O K         | -                |
| 204    | No Content  | -                |
| 400    | Bad Request | `ProblemDetails` |

---

## SurveyLinks

**Base Route:** `api/surveys/{surveyId:guid}/links`
**Default Authorization:** Required

### 🔒 GET `api/surveys/{surveyId:guid}/links`

_Get all links for a survey._

**Action:** `GetSurveyLinks`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |
| `l`        | `boo`  | query    | Yes      |

#### Responses

| Status | Description | Model                 |
| ------ | ----------- | --------------------- |
| 200    | O K         | `List<SurveyLinkDto>` |
| 400    | Bad Request | -                     |
| 404    | Not Found   | -                     |

---

### 🔒 GET `api/surveys/{surveyId:guid}/links/{linkId:guid}`

_Get a survey link by ID._

**Action:** `GetSurveyLinkById`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |
| `linkId`   | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model                  |
| ------ | ----------- | ---------------------- |
| 200    | O K         | `SurveyLinkDetailsDto` |
| 404    | Not Found   | -                      |

---

### 🔒 POST `api/surveys/{surveyId:guid}/links`

_Create a new survey link._

**Action:** `CreateSurveyLink`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `CreateSurveyLinkCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "type": "EnumValue",
  "name": "string",
  "source": "string",
  "medium": "string",
  "campaign": "string",
  "prefillData": "object",
  "expiresAt": "2024-01-01T00:00:00Z",
  "maxUses": 0,
  "password": "string"
}
```

| Property      | Type                          | Required |
| ------------- | ----------------------------- | -------- |
| `surveyId`    | `Guid`                        | Yes      |
| `type`        | `SurveyLinkType`              | Yes      |
| `name`        | `string?`                     | No       |
| `source`      | `string?`                     | No       |
| `medium`      | `string?`                     | No       |
| `campaign`    | `string?`                     | No       |
| `prefillData` | `Dictionary<string, string>?` | No       |
| `expiresAt`   | `DateTime?`                   | No       |
| `maxUses`     | `int?`                        | No       |
| `password`    | `string?`                     | No       |

#### Responses

| Status | Description | Model           |
| ------ | ----------- | --------------- |
| 201    | Created     | `SurveyLinkDto` |
| 400    | Bad Request | -               |

---

### 🔒 PUT `api/surveys/{surveyId:guid}/links/{linkId:guid}`

_Update a survey link._

**Action:** `UpdateSurveyLink`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |
| `linkId`   | `Guid` | route    | Yes      |

#### Request Body

**Model:** `UpdateSurveyLinkCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "linkId": "00000000-0000-0000-0000-000000000000",
  "name": "string",
  "source": "string",
  "medium": "string",
  "campaign": "string",
  "prefillData": "object",
  "expiresAt": "2024-01-01T00:00:00Z",
  "maxUses": 0,
  "password": "string",
  "isActive": true
}
```

| Property      | Type                          | Required |
| ------------- | ----------------------------- | -------- |
| `surveyId`    | `Guid`                        | Yes      |
| `linkId`      | `Guid`                        | Yes      |
| `name`        | `string?`                     | No       |
| `source`      | `string?`                     | No       |
| `medium`      | `string?`                     | No       |
| `campaign`    | `string?`                     | No       |
| `prefillData` | `Dictionary<string, string>?` | No       |
| `expiresAt`   | `DateTime?`                   | No       |
| `maxUses`     | `int?`                        | No       |
| `password`    | `string?`                     | No       |
| `isActive`    | `bool?`                       | No       |

#### Responses

| Status | Description | Model           |
| ------ | ----------- | --------------- |
| 200    | O K         | `SurveyLinkDto` |
| 400    | Bad Request | -               |
| 404    | Not Found   | -               |

---

### 🔒 DELETE `api/surveys/{surveyId:guid}/links/{linkId:guid}`

_Deactivate a survey link._

**Action:** `DeactivateSurveyLink`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |
| `linkId`   | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 404    | Not Found   | -     |

---

### 🔒 GET `api/surveys/{surveyId:guid}/links/{linkId:guid}/analytics`

_Get analytics for a survey link._

**Action:** `GetLinkAnalytics`

#### Parameters

| Name       | Type      | Location | Required |
| ---------- | --------- | -------- | -------- |
| `surveyId` | `Guid`    | route    | Yes      |
| `linkId`   | `Guid`    | route    | Yes      |
| `e`        | `DateTim` | query    | Yes      |
| `e`        | `DateTim` | query    | Yes      |

#### Responses

| Status | Description | Model              |
| ------ | ----------- | ------------------ |
| 200    | O K         | `LinkAnalyticsDto` |
| 404    | Not Found   | -                  |

---

### 🔒 POST `api/surveys/{surveyId:guid}/links/bulk`

_Generate multiple unique links at once._

**Action:** `GenerateBulkLinks`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `GenerateBulkLinksCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "count": 0,
  "namePrefix": "string",
  "source": "string",
  "medium": "string",
  "campaign": "string",
  "expiresAt": "2024-01-01T00:00:00Z"
}
```

| Property     | Type        | Required |
| ------------ | ----------- | -------- |
| `surveyId`   | `Guid`      | Yes      |
| `count`      | `int`       | Yes      |
| `namePrefix` | `string?`   | No       |
| `source`     | `string?`   | No       |
| `medium`     | `string?`   | No       |
| `campaign`   | `string?`   | No       |
| `expiresAt`  | `DateTime?` | No       |

#### Responses

| Status | Description | Model                         |
| ------ | ----------- | ----------------------------- |
| 200    | O K         | `BulkLinkGenerationResultDto` |
| 400    | Bad Request | -                             |

---

### 🌐 GET `api/surveys/{surveyId:guid}/links/{token}`

_Get link information by token (for pre-validation)._

**Action:** `GetLinkByToken`

#### Parameters

| Name    | Type     | Location | Required |
| ------- | -------- | -------- | -------- |
| `token` | `string` | route    | Yes      |

#### Responses

| Status | Description | Model               |
| ------ | ----------- | ------------------- |
| 200    | O K         | `LinkByTokenResult` |
| 404    | Not Found   | -                   |

---

### 🌐 POST `api/surveys/{surveyId:guid}/links/{token}/access`

_Access a survey via short link (records click and redirects)._

**Action:** `AccessLink`

#### Parameters

| Name    | Type     | Location | Required |
| ------- | -------- | -------- | -------- |
| `token` | `string` | route    | Yes      |

#### Request Body

**Model:** `LinkAccessReques`

#### Responses

| Status | Description | Model                   |
| ------ | ----------- | ----------------------- |
| 200    | O K         | `RecordLinkClickResult` |
| 400    | Bad Request | -                       |
| 404    | Not Found   | -                       |

---

## Surveys

**Base Route:** `api/surveys`
**Default Authorization:** Required

### 🔒 GET `api/surveys`

_Get all surveys in the current namespace_

**Action:** `GetSurveys`

#### Parameters

| Name             | Type            | Location | Required |
| ---------------- | --------------- | -------- | -------- |
| `page`           | `int?`          | query    | Yes      |
| `pageSize`       | `int?`          | query    | Yes      |
| `status`         | `SurveyStatus?` | query    | Yes      |
| `search`         | `string?`       | query    | Yes      |
| `sortBy`         | `string?`       | query    | Yes      |
| `sortDescending` | `bool?`         | query    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |

---

### 🔒 GET `api/surveys/{id:guid}`

_Get a survey by ID_

**Action:** `GetById`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

### 🌐 GET `api/surveys/public/{shareToken}`

_Get a public survey by share token (no auth required)_

**Action:** `GetPublicSurvey`

#### Parameters

| Name         | Type     | Location | Required |
| ------------ | -------- | -------- | -------- |
| `shareToken` | `string` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/surveys`

_Create a new survey_

**Action:** `Create`

#### Request Body

**Model:** `CreateSurveyCommand`

```json
{
  "title": "string",
  "description": "string",
  "type": "EnumValue",
  "cxMetricType": "EnumValue",
  "welcomeMessage": "string",
  "thankYouMessage": "string",
  "allowAnonymousResponses": true,
  "allowMultipleResponses": true,
  "startsAt": "2024-01-01T00:00:00Z",
  "endsAt": "2024-01-01T00:00:00Z",
  "maxResponses": 0,
  "defaultLanguage": "string"
}
```

| Property                  | Type            | Required |
| ------------------------- | --------------- | -------- |
| `title`                   | `string`        | Yes      |
| `description`             | `string?`       | No       |
| `type`                    | `SurveyType`    | Yes      |
| `cxMetricType`            | `CxMetricType?` | No       |
| `welcomeMessage`          | `string?`       | No       |
| `thankYouMessage`         | `string?`       | No       |
| `allowAnonymousResponses` | `bool`          | Yes      |
| `allowMultipleResponses`  | `bool`          | Yes      |
| `startsAt`                | `DateTime?`     | No       |
| `endsAt`                  | `DateTime?`     | No       |
| `maxResponses`            | `int?`          | No       |
| `defaultLanguage`         | `string?`       | No       |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 201    | Created     | -     |
| 400    | Bad Request | -     |

---

### 🔒 PUT `api/surveys/{id:guid}`

_Update a survey_

**Action:** `Update`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `UpdateSurveyCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "title": "string",
  "description": "string",
  "welcomeMessage": "string",
  "thankYouMessage": "string",
  "allowAnonymousResponses": true,
  "allowMultipleResponses": true,
  "startsAt": "2024-01-01T00:00:00Z",
  "endsAt": "2024-01-01T00:00:00Z",
  "maxResponses": 0,
  "themeId": "00000000-0000-0000-0000-000000000000",
  "presetThemeId": "string",
  "defaultLanguage": "string"
}
```

| Property                  | Type        | Required |
| ------------------------- | ----------- | -------- |
| `surveyId`                | `Guid`      | Yes      |
| `title`                   | `string?`   | No       |
| `description`             | `string?`   | No       |
| `welcomeMessage`          | `string?`   | No       |
| `thankYouMessage`         | `string?`   | No       |
| `allowAnonymousResponses` | `bool?`     | No       |
| `allowMultipleResponses`  | `bool?`     | No       |
| `startsAt`                | `DateTime?` | No       |
| `endsAt`                  | `DateTime?` | No       |
| `maxResponses`            | `int?`      | No       |
| `themeId`                 | `Guid?`     | No       |
| `presetThemeId`           | `string?`   | No       |
| `defaultLanguage`         | `string?`   | No       |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/surveys/{id:guid}/publish`

_Publish a survey_

**Action:** `Publish`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 400    | Bad Request | -     |

---

### 🔒 POST `api/surveys/{id:guid}/duplicate`

_Duplicate a survey (create a copy as draft)_

**Action:** `Duplicate`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `DuplicateSurveyComman`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "newTitle": "string"
}
```

| Property   | Type      | Required |
| ---------- | --------- | -------- |
| `surveyId` | `Guid`    | Yes      |
| `newTitle` | `string?` | No       |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 201    | Created     | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/surveys/{id:guid}/close`

_Close a survey_

**Action:** `Close`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 400    | Bad Request | -     |

---

### 🔒 DELETE `api/surveys/{id:guid}`

_Delete a survey_

**Action:** `Delete`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 GET `api/surveys/{id:guid}/analytics`

_Get survey analytics_

**Action:** `GetAnalytics`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/surveys/{id:guid}/export`

_Export survey responses_

**Action:** `ExportResponses`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `ExportResponsesCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "format": "EnumValue",
  "includeMetadata": true,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-01T00:00:00Z",
  "questionIds": []
}
```

| Property          | Type           | Required |
| ----------------- | -------------- | -------- |
| `surveyId`        | `Guid`         | Yes      |
| `format`          | `ExportFormat` | Yes      |
| `includeMetadata` | `bool?`        | No       |
| `startDate`       | `DateTime?`    | No       |
| `endDate`         | `DateTime?`    | No       |
| `questionIds`     | `List<Guid>?`  | No       |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 GET `api/surveys/{id:guid}/export/preview`

_Get export preview information_

**Action:** `GetExportPreview`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

### 🔒 PUT `api/surveys/{id:guid}/theme`

_Apply a theme to a survey_

**Action:** `ApplyTheme`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `ApplyThemeToSurveyCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "themeId": "00000000-0000-0000-0000-000000000000",
  "presetThemeId": "string",
  "themeCustomizations": "string"
}
```

| Property              | Type      | Required |
| --------------------- | --------- | -------- |
| `surveyId`            | `Guid`    | Yes      |
| `themeId`             | `Guid?`   | No       |
| `presetThemeId`       | `string?` | No       |
| `themeCustomizations` | `string?` | No       |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 GET `api/surveys/{id:guid}/nps`

_Get NPS (Net Promoter Score) for a survey_

**Action:** `GetNps`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

### 🔒 GET `api/surveys/{id:guid}/nps/trend`

_Get NPS trend over time for a survey_

**Action:** `GetNpsTrend`

#### Parameters

| Name | Type             | Location | Required |
| ---- | ---------------- | -------- | -------- |
| `id` | `Guid`           | route    | Yes      |
| `e`  | `DateTim`        | query    | Yes      |
| `e`  | `DateTim`        | query    | Yes      |
| `y`  | `NpsTrendGroupB` | query    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 GET `api/surveys/{id:guid}/questions/{questionId:guid}/nps`

_Get NPS for a specific question in a survey_

**Action:** `GetQuestionNps`

#### Parameters

| Name         | Type   | Location | Required |
| ------------ | ------ | -------- | -------- |
| `id`         | `Guid` | route    | Yes      |
| `questionId` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

## Templates

**Base Route:** `api/templates`
**Default Authorization:** Required

### 🔒 GET `api/templates`

_Get all templates in the current namespace_

**Action:** `GetTemplates`

#### Parameters

| Name         | Type      | Location | Required |
| ------------ | --------- | -------- | -------- |
| `pageNumber` | `int`     | query    | Yes      |
| `pageSize`   | `int`     | query    | Yes      |
| `searchTerm` | `string?` | query    | Yes      |
| `category`   | `string?` | query    | Yes      |
| `isPublic`   | `bool?`   | query    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |

---

### 🔒 GET `api/templates/{id:guid}`

_Get a template by ID_

**Action:** `GetById`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/templates`

_Create a new template_

**Action:** `Create`

#### Request Body

**Model:** `CreateTemplateCommand`

```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "isPublic": true,
  "welcomeMessage": "string",
  "thankYouMessage": "string",
  "defaultAllowAnonymous": true,
  "defaultAllowMultipleResponses": true,
  "languageCode": "string",
  "questions": []
}
```

| Property                        | Type                              | Required |
| ------------------------------- | --------------------------------- | -------- |
| `name`                          | `string`                          | Yes      |
| `description`                   | `string?`                         | No       |
| `category`                      | `string?`                         | No       |
| `isPublic`                      | `bool`                            | Yes      |
| `welcomeMessage`                | `string?`                         | No       |
| `thankYouMessage`               | `string?`                         | No       |
| `defaultAllowAnonymous`         | `bool`                            | Yes      |
| `defaultAllowMultipleResponses` | `bool`                            | Yes      |
| `languageCode`                  | `string`                          | Yes      |
| `questions`                     | `List<CreateTemplateQuestionDto>` | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 201    | Created     | -     |
| 400    | Bad Request | -     |

---

### 🔒 POST `api/templates/from-survey`

_Create a template from an existing survey_

**Action:** `CreateFromSurvey`

#### Request Body

**Model:** `CreateTemplateFromSurveyCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "templateName": "string",
  "description": "string",
  "category": "string",
  "isPublic": true,
  "languageCode": "string"
}
```

| Property       | Type      | Required |
| -------------- | --------- | -------- |
| `surveyId`     | `Guid`    | Yes      |
| `templateName` | `string`  | Yes      |
| `description`  | `string?` | No       |
| `category`     | `string?` | No       |
| `isPublic`     | `bool`    | Yes      |
| `languageCode` | `string?` | No       |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 201    | Created     | -     |
| 400    | Bad Request | -     |

---

### 🔒 POST `api/templates/{id:guid}/create-survey`

_Create a survey from a template_

**Action:** `CreateSurveyFromTemplate`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `CreateSurveyFromTemplateCommand`

```json
{
  "templateId": "00000000-0000-0000-0000-000000000000",
  "surveyTitle": "string",
  "description": "string",
  "languageCode": "string"
}
```

| Property       | Type      | Required |
| -------------- | --------- | -------- |
| `templateId`   | `Guid`    | Yes      |
| `surveyTitle`  | `string`  | Yes      |
| `description`  | `string?` | No       |
| `languageCode` | `string?` | No       |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 201    | Created     | -     |
| 400    | Bad Request | -     |

---

### 🔒 PUT `api/templates/{id:guid}`

_Update a template_

**Action:** `Update`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `UpdateTemplateCommand`

```json
{
  "templateId": "00000000-0000-0000-0000-000000000000",
  "name": "string",
  "description": "string",
  "category": "string",
  "isPublic": true,
  "welcomeMessage": "string",
  "thankYouMessage": "string",
  "defaultAllowAnonymous": true,
  "defaultAllowMultipleResponses": true,
  "languageCode": "string",
  "questions": []
}
```

| Property                        | Type                              | Required |
| ------------------------------- | --------------------------------- | -------- |
| `templateId`                    | `Guid`                            | Yes      |
| `name`                          | `string`                          | Yes      |
| `description`                   | `string?`                         | No       |
| `category`                      | `string?`                         | No       |
| `isPublic`                      | `bool`                            | Yes      |
| `welcomeMessage`                | `string?`                         | No       |
| `thankYouMessage`               | `string?`                         | No       |
| `defaultAllowAnonymous`         | `bool`                            | Yes      |
| `defaultAllowMultipleResponses` | `bool`                            | Yes      |
| `languageCode`                  | `string?`                         | No       |
| `questions`                     | `List<UpdateTemplateQuestionDto>` | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 DELETE `api/templates/{id:guid}`

_Delete a template_

**Action:** `Delete`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

## Themes

**Base Route:** `api/themes`
**Default Authorization:** Required

### 🔒 GET `api/themes`

_Gets all themes in the current namespace._

**Action:** `GetThemes`

#### Parameters

| Name         | Type      | Location | Required |
| ------------ | --------- | -------- | -------- |
| `pageNumber` | `int`     | query    | Yes      |
| `pageSize`   | `int`     | query    | Yes      |
| `searchTerm` | `string?` | query    | Yes      |

#### Responses

| Status | Description | Model                                  |
| ------ | ----------- | -------------------------------------- |
| 200    | O K         | `IReadOnlyList<SurveyThemeSummaryDto>` |
| 400    | Bad Request | -                                      |

---

### 🔒 GET `api/themes/public`

_Gets all public themes available to all namespaces._

**Action:** `GetPublicThemes`

#### Responses

| Status | Description | Model                                  |
| ------ | ----------- | -------------------------------------- |
| 200    | O K         | `IReadOnlyList<SurveyThemeSummaryDto>` |

---

### 🔒 GET `api/themes/{id:guid}`

_Gets a theme by its ID._

**Action:** `GetThemeById`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model            |
| ------ | ----------- | ---------------- |
| 200    | O K         | `SurveyThemeDto` |
| 404    | Not Found   | -                |

---

### 🔒 GET `api/themes/{id:guid}/preview`

_Gets a theme preview with generated CSS._

**Action:** `GetThemePreview`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model             |
| ------ | ----------- | ----------------- |
| 200    | O K         | `ThemePreviewDto` |
| 404    | Not Found   | -                 |

---

### 🔒 GET `api/themes/{id:guid}/css`

_Gets the generated CSS for a theme._

**Action:** `GetThemeCss`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/themes`

_Creates a new theme._

**Action:** `CreateTheme`

#### Request Body

**Model:** `CreateThemeCommand`

```json
{
  "name": "string",
  "description": "string",
  "languageCode": "string",
  "isPublic": true,
  "colors": "object",
  "typography": "object",
  "layout": "object",
  "branding": "object",
  "button": "object",
  "customCss": "string"
}
```

| Property       | Type                  | Required |
| -------------- | --------------------- | -------- |
| `name`         | `string`              | Yes      |
| `description`  | `string?`             | No       |
| `languageCode` | `string`              | Yes      |
| `isPublic`     | `bool`                | Yes      |
| `colors`       | `ThemeColorsDto?`     | No       |
| `typography`   | `ThemeTypographyDto?` | No       |
| `layout`       | `ThemeLayoutDto?`     | No       |
| `branding`     | `ThemeBrandingDto?`   | No       |
| `button`       | `ThemeButtonDto?`     | No       |
| `customCss`    | `string?`             | No       |

#### Responses

| Status | Description | Model            |
| ------ | ----------- | ---------------- |
| 201    | Created     | `SurveyThemeDto` |
| 400    | Bad Request | -                |

---

### 🔒 PUT `api/themes/{id:guid}`

_Updates an existing theme._

**Action:** `UpdateTheme`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `UpdateThemeCommand`

```json
{
  "themeId": "00000000-0000-0000-0000-000000000000",
  "name": "string",
  "description": "string",
  "languageCode": "string",
  "isPublic": true,
  "colors": "object",
  "typography": "object",
  "layout": "object",
  "branding": "object",
  "button": "object",
  "customCss": "string"
}
```

| Property       | Type                 | Required |
| -------------- | -------------------- | -------- |
| `themeId`      | `Guid`               | Yes      |
| `name`         | `string`             | Yes      |
| `description`  | `string?`            | No       |
| `languageCode` | `string?`            | No       |
| `isPublic`     | `bool`               | Yes      |
| `colors`       | `ThemeColorsDto`     | Yes      |
| `typography`   | `ThemeTypographyDto` | Yes      |
| `layout`       | `ThemeLayoutDto`     | Yes      |
| `branding`     | `ThemeBrandingDto`   | Yes      |
| `button`       | `ThemeButtonDto`     | Yes      |
| `customCss`    | `string?`            | No       |

#### Responses

| Status | Description | Model            |
| ------ | ----------- | ---------------- |
| 200    | O K         | `SurveyThemeDto` |
| 400    | Bad Request | -                |
| 404    | Not Found   | -                |

---

### 🔒 DELETE `api/themes/{id:guid}`

_Deletes a theme._

**Action:** `DeleteTheme`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/themes/{id:guid}/duplicate`

_Duplicates an existing theme._

**Action:** `DuplicateTheme`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `DuplicateThemeComman`

```json
{
  "themeId": "00000000-0000-0000-0000-000000000000",
  "newName": "string",
  "languageCode": "string"
}
```

| Property       | Type      | Required |
| -------------- | --------- | -------- |
| `themeId`      | `Guid`    | Yes      |
| `newName`      | `string?` | No       |
| `languageCode` | `string?` | No       |

#### Responses

| Status | Description | Model            |
| ------ | ----------- | ---------------- |
| 201    | Created     | `SurveyThemeDto` |
| 400    | Bad Request | -                |
| 404    | Not Found   | -                |

---

### 🔒 POST `api/themes/{id:guid}/set-default`

_Sets a theme as the default for the namespace._

**Action:** `SetDefaultTheme`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 POST `api/themes/{id:guid}/apply`

_Applies a theme to a survey._

**Action:** `ApplyThemeToSurvey`

#### Parameters

| Name | Type   | Location | Required |
| ---- | ------ | -------- | -------- |
| `id` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `ApplyThemeToSurveyCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "themeId": "00000000-0000-0000-0000-000000000000",
  "presetThemeId": "string",
  "themeCustomizations": "string"
}
```

| Property              | Type      | Required |
| --------------------- | --------- | -------- |
| `surveyId`            | `Guid`    | Yes      |
| `themeId`             | `Guid?`   | No       |
| `presetThemeId`       | `string?` | No       |
| `themeCustomizations` | `string?` | No       |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

## Translations

**Base Route:** `api/surveys/{surveyId:guid}/translations`
**Default Authorization:** Required

### 🔒 GET `api/surveys/{surveyId:guid}/translations`

_Get all translations for a survey including its questions._

**Action:** `GetTranslations`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 404    | Not Found   | -     |

---

### 🔒 PUT `api/surveys/{surveyId:guid}/translations`

_Bulk update all translations for a survey (including question translations)._

**Action:** `BulkUpdateTranslations`

#### Parameters

| Name       | Type   | Location | Required |
| ---------- | ------ | -------- | -------- |
| `surveyId` | `Guid` | route    | Yes      |

#### Request Body

**Model:** `BulkUpdateSurveyTranslationsCommand`

```json
{
  "surveyId": "00000000-0000-0000-0000-000000000000",
  "translations": [],
  "questionTranslations": []
}
```

| Property               | Type                                           | Required |
| ---------------------- | ---------------------------------------------- | -------- |
| `surveyId`             | `Guid`                                         | Yes      |
| `translations`         | `IReadOnlyList<SurveyTranslationDto>`          | Yes      |
| `questionTranslations` | `IReadOnlyList<QuestionTranslationUpdateDto>?` | No       |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 PUT `api/surveys/{surveyId:guid}/translations/{languageCode}`

_Add or update a single translation for a survey._

**Action:** `UpdateTranslation`

#### Parameters

| Name           | Type     | Location | Required |
| -------------- | -------- | -------- | -------- |
| `surveyId`     | `Guid`   | route    | Yes      |
| `languageCode` | `string` | route    | Yes      |

#### Request Body

**Model:** `SurveyTranslationDto`

```json
{
  "languageCode": "string",
  "title": "string",
  "description": "string",
  "welcomeMessage": "string",
  "thankYouMessage": "string",
  "isDefault": true
}
```

| Property          | Type      | Required |
| ----------------- | --------- | -------- |
| `languageCode`    | `string`  | Yes      |
| `title`           | `string`  | Yes      |
| `description`     | `string?` | No       |
| `welcomeMessage`  | `string?` | No       |
| `thankYouMessage` | `string?` | No       |
| `isDefault`       | `bool`    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

### 🔒 DELETE `api/surveys/{surveyId:guid}/translations/{languageCode}`

_Delete a translation for a survey._

**Action:** `DeleteTranslation`

#### Parameters

| Name           | Type     | Location | Required |
| -------------- | -------- | -------- | -------- |
| `surveyId`     | `Guid`   | route    | Yes      |
| `languageCode` | `string` | route    | Yes      |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 204    | No Content  | -     |
| 400    | Bad Request | -     |
| 404    | Not Found   | -     |

---

## Users

**Base Route:** `api/users`
**Default Authorization:** Required

### 🔒 GET `api/users/me`

_Get the current user's profile_

**Action:** `GetCurrentUser`

#### Responses

| Status | Description  | Model |
| ------ | ------------ | ----- |
| 200    | O K          | -     |
| 401    | Unauthorized | -     |

---

### 🔒 PUT `api/users/me`

_Update the current user's profile_

**Action:** `UpdateProfile`

#### Request Body

**Model:** `UpdateProfileCommand`

```json
{
  "firstName": "string",
  "lastName": "string"
}
```

| Property    | Type      | Required |
| ----------- | --------- | -------- |
| `firstName` | `string?` | No       |
| `lastName`  | `string?` | No       |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 400    | Bad Request | -     |

---

### 🔒 GET `api/users/settings`

_Get the current user's preferences/settings_

**Action:** `GetUserPreferences`

#### Responses

| Status | Description  | Model |
| ------ | ------------ | ----- |
| 200    | O K          | -     |
| 401    | Unauthorized | -     |

---

### 🔒 PUT `api/users/settings`

_Update the current user's preferences/settings_

**Action:** `UpdateUserPreferences`

#### Request Body

**Model:** `UpdateUserPreferencesCommand`

```json
{
  "language": "string",
  "theme": "string",
  "emailNotifications": true,
  "defaultNamespaceId": "00000000-0000-0000-0000-000000000000"
}
```

| Property             | Type      | Required |
| -------------------- | --------- | -------- |
| `language`           | `string?` | No       |
| `theme`              | `string?` | No       |
| `emailNotifications` | `bool?`   | No       |
| `defaultNamespaceId` | `Guid?`   | No       |

#### Responses

| Status | Description | Model |
| ------ | ----------- | ----- |
| 200    | O K         | -     |
| 400    | Bad Request | -     |

---
