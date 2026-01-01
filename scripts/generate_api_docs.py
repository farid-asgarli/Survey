#!/usr/bin/env python3
"""
API Documentation Generator for SurveyApp Backend

This script parses C# controller files and generates comprehensive 
API documentation with request/response models for each endpoint.

Usage:
    python generate_api_docs.py [--output api_docs.json] [--format json|md|both]
"""

import os
import re
import json
import argparse
from dataclasses import dataclass, field, asdict
from typing import Optional
from pathlib import Path
from enum import Enum

# Configuration
CONTROLLERS_PATH = Path(__file__).parent.parent / "back/src/SurveyApp.API/Controllers"
FEATURES_PATH = Path(__file__).parent.parent / "back/src/SurveyApp.Application/Features"
DTOS_PATH = Path(__file__).parent.parent / "back/src/SurveyApp.Application/DTOs"
OUTPUT_PATH = Path(__file__).parent.parent / "API_DOCUMENTATION"


class HttpMethod(Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"


@dataclass
class Parameter:
    name: str
    param_type: str
    source: str  # "route", "query", "body", "header"
    is_required: bool = True
    description: str = ""


@dataclass
class ResponseModel:
    status_code: int
    description: str
    model_type: Optional[str] = None
    model_properties: dict = field(default_factory=dict)


@dataclass
class Endpoint:
    http_method: str
    route: str
    action_name: str
    description: str
    requires_auth: bool
    request_model: Optional[str] = None
    request_properties: dict = field(default_factory=dict)
    parameters: list = field(default_factory=list)
    responses: list = field(default_factory=list)
    controller: str = ""


@dataclass
class Controller:
    name: str
    base_route: str
    requires_auth: bool
    endpoints: list = field(default_factory=list)


def parse_controller_file(file_path: Path) -> Optional[Controller]:
    """Parse a single controller file and extract endpoint information."""
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None

    controller_name = file_path.stem.replace("Controller", "")
    
    # Extract base route
    route_match = re.search(r'\[Route\("([^"]+)"\)\]', content)
    base_route = route_match.group(1) if route_match else f"api/{controller_name.lower()}"
    base_route = base_route.replace("[controller]", controller_name.lower())
    
    # Check class-level authorization
    class_requires_auth = "[Authorize]" in content.split("public class")[0] if "public class" in content else False
    # More accurate check - look for [Authorize] before the class definition
    class_def_match = re.search(r'(\[Authorize\][^\[]*)?public class \w+Controller', content)
    if class_def_match and class_def_match.group(1):
        class_requires_auth = True
    
    controller = Controller(
        name=controller_name,
        base_route=base_route,
        requires_auth=class_requires_auth
    )
    
    # Parse endpoints using regex
    # Match method signatures with their attributes
    endpoint_pattern = re.compile(
        r'(?P<attributes>(?:\s*///.*\n)*(?:\s*\[[^\]]+\]\s*\n)+)'
        r'\s*public\s+async\s+Task<IActionResult>\s+(?P<method_name>\w+)\s*\((?P<params>[^)]*)\)',
        re.MULTILINE
    )
    
    for match in endpoint_pattern.finditer(content):
        attributes = match.group('attributes')
        method_name = match.group('method_name')
        params = match.group('params')
        
        endpoint = parse_endpoint(attributes, method_name, params, base_route, class_requires_auth)
        if endpoint:
            endpoint.controller = controller_name
            controller.endpoints.append(endpoint)
    
    return controller


def parse_endpoint(attributes: str, method_name: str, params: str, base_route: str, class_auth: bool) -> Optional[Endpoint]:
    """Parse endpoint attributes and parameters."""
    
    # Determine HTTP method
    http_method = "GET"
    method_route = ""
    
    http_methods = {
        r'\[HttpGet(?:\("([^"]*)"\))?\]': "GET",
        r'\[HttpPost(?:\("([^"]*)"\))?\]': "POST",
        r'\[HttpPut(?:\("([^"]*)"\))?\]': "PUT",
        r'\[HttpPatch(?:\("([^"]*)"\))?\]': "PATCH",
        r'\[HttpDelete(?:\("([^"]*)"\))?\]': "DELETE",
    }
    
    for pattern, method in http_methods.items():
        match = re.search(pattern, attributes)
        if match:
            http_method = method
            method_route = match.group(1) if match.group(1) else ""
            break
    
    # Build full route
    full_route = base_route
    if method_route:
        full_route = f"{base_route}/{method_route}".replace("//", "/")
    
    # Extract description from XML comments
    description = ""
    summary_match = re.search(r'///\s*<summary>\s*\n\s*///\s*(.+?)\s*\n', attributes)
    if summary_match:
        description = summary_match.group(1).strip()
    
    # Check authorization
    requires_auth = class_auth
    if "[AllowAnonymous]" in attributes:
        requires_auth = False
    elif "[Authorize" in attributes:
        requires_auth = True
    
    # Parse response types
    responses = []
    response_pattern = re.compile(r'\[ProducesResponseType\((?:typeof\(([^)]+)\),\s*)?StatusCodes\.Status(\d+)(\w+)\)\]')
    for resp_match in response_pattern.finditer(attributes):
        model_type = resp_match.group(1)
        status_code = int(resp_match.group(2))
        status_name = resp_match.group(3)
        
        responses.append(ResponseModel(
            status_code=status_code,
            description=camel_to_title(status_name),
            model_type=model_type
        ))
    
    # Default responses if none specified
    if not responses:
        responses.append(ResponseModel(status_code=200, description="OK"))
    
    # Parse parameters
    parameters = []
    request_model = None
    request_properties = {}
    
    if params.strip():
        param_parts = split_params(params)
        for param in param_parts:
            param = param.strip()
            if not param:
                continue
            
            # Check for [FromBody]
            if "[FromBody]" in param:
                body_match = re.search(r'\[FromBody\]\s*(\w+(?:<[^>]+>)?)\s*(\w+)', param)
                if body_match:
                    request_model = body_match.group(1)
                    request_properties = get_model_properties(request_model)
            
            # Check for [FromQuery]
            elif "[FromQuery]" in param:
                query_match = re.search(r'\[FromQuery\]\s*(\w+(?:<[^>]+>)?)\s*(\w+)', param)
                if query_match:
                    param_type = query_match.group(1)
                    param_name = query_match.group(2)
                    # If it's a query object, expand its properties
                    if param_type.endswith("Query"):
                        query_props = get_model_properties(param_type)
                        for prop_name, prop_type in query_props.items():
                            parameters.append(Parameter(
                                name=to_camel_case(prop_name),
                                param_type=prop_type,
                                source="query"
                            ))
                    else:
                        parameters.append(Parameter(
                            name=to_camel_case(param_name),
                            param_type=param_type,
                            source="query"
                        ))
            
            # Route parameters (Guid id, string token, etc.)
            else:
                route_match = re.search(r'(\w+(?:<[^>]+>)?)\s+(\w+)', param)
                if route_match:
                    param_type = route_match.group(1)
                    param_name = route_match.group(2)
                    # Check if it's in the route
                    if f"{{{param_name}" in full_route or param_name in ['id', 'surveyId', 'questionId']:
                        parameters.append(Parameter(
                            name=param_name,
                            param_type=param_type,
                            source="route"
                        ))
    
    return Endpoint(
        http_method=http_method,
        route=full_route,
        action_name=method_name,
        description=description,
        requires_auth=requires_auth,
        request_model=request_model,
        request_properties=request_properties,
        parameters=parameters,
        responses=responses
    )


def split_params(params: str) -> list:
    """Split parameter string handling nested generics."""
    result = []
    current = ""
    depth = 0
    
    for char in params:
        if char == '<':
            depth += 1
        elif char == '>':
            depth -= 1
        elif char == ',' and depth == 0:
            result.append(current)
            current = ""
            continue
        current += char
    
    if current:
        result.append(current)
    
    return result


def get_model_properties(model_name: str) -> dict:
    """
    Get properties of a model by searching through Features and DTOs.
    Returns a dict of property_name: property_type
    """
    properties = {}
    
    # Common model property mappings (fallback/known models)
    known_models = {
        "LoginCommand": {
            "Email": "string",
            "Password": "string"
        },
        "RegisterCommand": {
            "Email": "string",
            "Password": "string",
            "FirstName": "string",
            "LastName": "string"
        },
        "RefreshTokenCommand": {
            "RefreshToken": "string"
        },
        "ForgotPasswordCommand": {
            "Email": "string"
        },
        "ResetPasswordCommand": {
            "Email": "string",
            "Token": "string",
            "NewPassword": "string"
        },
        "CreateSurveyCommand": {
            "Title": "string",
            "Description": "string?",
            "Type": "SurveyType",
            "CxMetricType": "CxMetricType?",
            "WelcomeMessage": "string?",
            "ThankYouMessage": "string?",
            "AllowAnonymousResponses": "bool",
            "AllowMultipleResponses": "bool",
            "StartsAt": "DateTime?",
            "EndsAt": "DateTime?",
            "MaxResponses": "int?",
            "DefaultLanguage": "string?"
        },
        "UpdateSurveyCommand": {
            "SurveyId": "Guid",
            "Title": "string?",
            "Description": "string?",
            "WelcomeMessage": "string?",
            "ThankYouMessage": "string?",
            "AllowAnonymousResponses": "bool?",
            "AllowMultipleResponses": "bool?",
            "StartsAt": "DateTime?",
            "EndsAt": "DateTime?",
            "MaxResponses": "int?",
            "ThemeId": "Guid?",
            "PresetThemeId": "string?",
            "DefaultLanguage": "string?"
        },
        "DuplicateSurveyCommand": {
            "SurveyId": "Guid",
            "NewTitle": "string?"
        },
        "CreateQuestionCommand": {
            "SurveyId": "Guid",
            "Text": "string",
            "Type": "QuestionType",
            "Description": "string?",
            "IsRequired": "bool",
            "Order": "int?",
            "Options": "List<QuestionOptionDto>?",
            "Settings": "QuestionSettingsDto?"
        },
        "UpdateQuestionCommand": {
            "SurveyId": "Guid",
            "QuestionId": "Guid",
            "Text": "string?",
            "Description": "string?",
            "IsRequired": "bool?",
            "Order": "int?",
            "Options": "List<QuestionOptionDto>?",
            "Settings": "QuestionSettingsDto?"
        },
        "ReorderQuestionsCommand": {
            "SurveyId": "Guid",
            "QuestionIds": "List<Guid>"
        },
        "StartResponseCommand": {
            "SurveyId": "Guid?",
            "ShareToken": "string?",
            "RespondentEmail": "string?",
            "Language": "string?"
        },
        "SubmitSurveyResponseCommand": {
            "SurveyId": "Guid?",
            "ResponseId": "Guid?",
            "ShareToken": "string?",
            "Answers": "List<AnswerDto>",
            "RespondentEmail": "string?",
            "RespondentName": "string?",
            "Language": "string?"
        },
        "GetSurveysQuery": {
            "Page": "int?",
            "PageSize": "int?",
            "Status": "SurveyStatus?",
            "Search": "string?",
            "SortBy": "string?",
            "SortDescending": "bool?"
        },
        "GetResponsesQuery": {
            "SurveyId": "Guid",
            "Page": "int?",
            "PageSize": "int?",
            "StartDate": "DateTime?",
            "EndDate": "DateTime?"
        },
        "ExportResponsesCommand": {
            "SurveyId": "Guid",
            "Format": "ExportFormat",
            "IncludeMetadata": "bool?",
            "StartDate": "DateTime?",
            "EndDate": "DateTime?",
            "QuestionIds": "List<Guid>?"
        },
        "UpdateProfileCommand": {
            "FirstName": "string?",
            "LastName": "string?"
        },
        "UpdateUserPreferencesCommand": {
            "Language": "string?",
            "Theme": "string?",
            "EmailNotifications": "bool?",
            "DefaultNamespaceId": "Guid?"
        },
        "CreateEmailTemplateCommand": {
            "Name": "string",
            "Subject": "string",
            "Body": "string",
            "TemplateType": "EmailTemplateType",
            "Language": "string?"
        },
        "UpdateEmailTemplateCommand": {
            "Id": "Guid",
            "Name": "string?",
            "Subject": "string?",
            "Body": "string?",
            "IsDefault": "bool?"
        },
        "BulkDeleteResponsesCommand": {
            "ResponseIds": "List<Guid>"
        },
        "BatchSyncQuestionsCommand": {
            "SurveyId": "Guid",
            "Questions": "List<QuestionSyncItem>"
        },
        "GetEmailTemplatesQuery": {
            "Page": "int?",
            "PageSize": "int?",
            "TemplateType": "EmailTemplateType?",
            "Search": "string?"
        }
    }
    
    if model_name in known_models:
        return known_models[model_name]
    
    # Try to find the model file
    if model_name:
        # Search in Features directory
        if model_name.endswith("Command") or model_name.endswith("Query"):
            search_dirs = [FEATURES_PATH]
        else:
            search_dirs = [DTOS_PATH, FEATURES_PATH]
        
        for search_dir in search_dirs:
            if search_dir.exists():
                for file_path in search_dir.rglob("*.cs"):
                    try:
                        content = file_path.read_text(encoding='utf-8')
                        if f"class {model_name}" in content or f"record {model_name}" in content:
                            properties = extract_properties_from_content(content, model_name)
                            if properties:
                                return properties
                    except:
                        continue
    
    return properties


def extract_properties_from_content(content: str, class_name: str) -> dict:
    """Extract properties from C# class/record content."""
    properties = {}
    
    # Find the class/record definition
    pattern = rf'(?:class|record)\s+{class_name}[^{{]*\{{'
    match = re.search(pattern, content)
    if not match:
        return properties
    
    # Get content after class definition
    start = match.end()
    brace_count = 1
    end = start
    
    for i, char in enumerate(content[start:], start):
        if char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                end = i
                break
    
    class_body = content[start:end]
    
    # Match properties
    prop_pattern = re.compile(
        r'public\s+(?:required\s+)?(\w+(?:<[^>]+>)?(?:\?)?)\s+(\w+)\s*\{',
        re.MULTILINE
    )
    
    for prop_match in prop_pattern.finditer(class_body):
        prop_type = prop_match.group(1)
        prop_name = prop_match.group(2)
        properties[prop_name] = prop_type
    
    # For records, also check constructor-style properties
    record_props = re.findall(
        r'public\s+(?:required\s+)?(\w+(?:<[^>]+>)?(?:\?)?)\s+(\w+)\s*(?:,|;|\))',
        content[:match.start()]
    )
    for prop_type, prop_name in record_props:
        if prop_name not in properties:
            properties[prop_name] = prop_type
    
    return properties


def camel_to_title(name: str) -> str:
    """Convert CamelCase to Title Case with spaces."""
    return re.sub(r'([A-Z])', r' \1', name).strip()


def to_camel_case(name: str) -> str:
    """Convert PascalCase to camelCase."""
    if not name:
        return name
    return name[0].lower() + name[1:]


def generate_json_output(controllers: list) -> dict:
    """Generate JSON output from parsed controllers."""
    output = {
        "apiVersion": "1.0",
        "generatedAt": __import__('datetime').datetime.now().isoformat(),
        "baseUrl": "/api",
        "controllers": []
    }
    
    for controller in controllers:
        ctrl_dict = {
            "name": controller.name,
            "baseRoute": controller.base_route,
            "requiresAuth": controller.requires_auth,
            "endpoints": []
        }
        
        for endpoint in controller.endpoints:
            ep_dict = {
                "method": endpoint.http_method,
                "route": endpoint.route,
                "action": endpoint.action_name,
                "description": endpoint.description,
                "requiresAuth": endpoint.requires_auth,
                "parameters": [asdict(p) for p in endpoint.parameters],
                "requestBody": None,
                "responses": []
            }
            
            if endpoint.request_model:
                ep_dict["requestBody"] = {
                    "model": endpoint.request_model,
                    "properties": endpoint.request_properties
                }
            
            for resp in endpoint.responses:
                ep_dict["responses"].append({
                    "statusCode": resp.status_code,
                    "description": resp.description,
                    "model": resp.model_type
                })
            
            ctrl_dict["endpoints"].append(ep_dict)
        
        output["controllers"].append(ctrl_dict)
    
    return output


def generate_markdown_output(controllers: list) -> str:
    """Generate Markdown documentation from parsed controllers."""
    lines = [
        "# SurveyApp API Documentation",
        "",
        "Auto-generated API documentation with request/response models for each endpoint.",
        "",
        "## Table of Contents",
        ""
    ]
    
    # TOC
    for controller in controllers:
        anchor = controller.name.lower()
        lines.append(f"- [{controller.name}](#{anchor})")
    
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Each controller
    for controller in controllers:
        lines.append(f"## {controller.name}")
        lines.append("")
        lines.append(f"**Base Route:** `{controller.base_route}`")
        lines.append(f"**Default Authorization:** {'Required' if controller.requires_auth else 'None'}")
        lines.append("")
        
        for endpoint in controller.endpoints:
            # Endpoint header
            auth_badge = "🔒" if endpoint.requires_auth else "🌐"
            lines.append(f"### {auth_badge} {endpoint.http_method} `{endpoint.route}`")
            lines.append("")
            
            if endpoint.description:
                lines.append(f"_{endpoint.description}_")
                lines.append("")
            
            lines.append(f"**Action:** `{endpoint.action_name}`")
            lines.append("")
            
            # Parameters
            if endpoint.parameters:
                lines.append("#### Parameters")
                lines.append("")
                lines.append("| Name | Type | Location | Required |")
                lines.append("|------|------|----------|----------|")
                for param in endpoint.parameters:
                    required = "Yes" if param.is_required else "No"
                    lines.append(f"| `{param.name}` | `{param.param_type}` | {param.source} | {required} |")
                lines.append("")
            
            # Request Body
            if endpoint.request_model:
                lines.append("#### Request Body")
                lines.append("")
                lines.append(f"**Model:** `{endpoint.request_model}`")
                lines.append("")
                
                if endpoint.request_properties:
                    lines.append("```json")
                    json_example = {}
                    for prop_name, prop_type in endpoint.request_properties.items():
                        json_example[to_camel_case(prop_name)] = get_example_value(prop_type)
                    lines.append(json.dumps(json_example, indent=2))
                    lines.append("```")
                    lines.append("")
                    
                    lines.append("| Property | Type | Required |")
                    lines.append("|----------|------|----------|")
                    for prop_name, prop_type in endpoint.request_properties.items():
                        required = "No" if "?" in prop_type else "Yes"
                        lines.append(f"| `{to_camel_case(prop_name)}` | `{prop_type}` | {required} |")
                    lines.append("")
            
            # Responses
            lines.append("#### Responses")
            lines.append("")
            lines.append("| Status | Description | Model |")
            lines.append("|--------|-------------|-------|")
            for resp in endpoint.responses:
                model = f"`{resp.model_type}`" if resp.model_type else "-"
                lines.append(f"| {resp.status_code} | {resp.description} | {model} |")
            lines.append("")
            
            lines.append("---")
            lines.append("")
    
    return "\n".join(lines)


def get_example_value(prop_type: str) -> any:
    """Get an example value for a property type."""
    prop_type = prop_type.rstrip("?").strip()
    
    type_examples = {
        "string": "string",
        "int": 0,
        "long": 0,
        "float": 0.0,
        "double": 0.0,
        "decimal": 0.0,
        "bool": True,
        "boolean": True,
        "Guid": "00000000-0000-0000-0000-000000000000",
        "DateTime": "2024-01-01T00:00:00Z",
        "DateTimeOffset": "2024-01-01T00:00:00+00:00"
    }
    
    if prop_type in type_examples:
        return type_examples[prop_type]
    
    if prop_type.startswith("List<") or prop_type.startswith("IReadOnlyList<"):
        return []
    
    if prop_type.endswith("Type") or prop_type.endswith("Status") or prop_type.endswith("Format"):
        return "EnumValue"
    
    return "object"


def main():
    parser = argparse.ArgumentParser(description="Generate API documentation from C# controllers")
    parser.add_argument("--output", "-o", default="api_docs", help="Output filename (without extension)")
    parser.add_argument("--format", "-f", choices=["json", "md", "both"], default="both", help="Output format")
    args = parser.parse_args()
    
    print(f"Scanning controllers in: {CONTROLLERS_PATH}")
    
    if not CONTROLLERS_PATH.exists():
        print(f"Error: Controllers path not found: {CONTROLLERS_PATH}")
        return 1
    
    controllers = []
    
    for file_path in sorted(CONTROLLERS_PATH.glob("*.cs")):
        if file_path.name == "ApiControllerBase.cs":
            continue
        
        print(f"  Parsing: {file_path.name}")
        controller = parse_controller_file(file_path)
        if controller and controller.endpoints:
            controllers.append(controller)
            print(f"    Found {len(controller.endpoints)} endpoints")
    
    print(f"\nTotal: {len(controllers)} controllers, {sum(len(c.endpoints) for c in controllers)} endpoints")
    
    # Create output directory
    OUTPUT_PATH.mkdir(exist_ok=True)
    
    # Generate outputs
    if args.format in ["json", "both"]:
        json_output = generate_json_output(controllers)
        json_file = OUTPUT_PATH / f"{args.output}.json"
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(json_output, f, indent=2)
        print(f"\nJSON documentation: {json_file}")
    
    if args.format in ["md", "both"]:
        md_output = generate_markdown_output(controllers)
        md_file = OUTPUT_PATH / f"{args.output}.md"
        with open(md_file, "w", encoding="utf-8") as f:
            f.write(md_output)
        print(f"Markdown documentation: {md_file}")
    
    print("\n✅ API documentation generated successfully!")
    return 0


if __name__ == "__main__":
    exit(main())
