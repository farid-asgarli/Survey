using FluentValidation;
using MediatR;
using SurveyApp.Application.Common;
using ValidationException = SurveyApp.Application.Common.Exceptions.ValidationException;

namespace SurveyApp.Application.Behaviors;

public class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators = validators;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken
    )
    {
        if (!_validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken))
        );

        var failures = validationResults
            .SelectMany(result => result.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Count != 0)
        {
            // Check if TResponse is a Result type
            var responseType = typeof(TResponse);
            if (
                responseType.IsGenericType
                && responseType.GetGenericTypeDefinition() == typeof(Result<>)
            )
            {
                var errorDict = failures
                    .GroupBy(f => f.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(f => f.ErrorMessage).ToArray());
                var resultType = responseType.GetGenericArguments()[0];
                var failureMethod = typeof(Result<>)
                    .MakeGenericType(resultType)
                    .GetMethod(
                        nameof(Result<object>.ValidationFailure),
                        [typeof(IDictionary<string, string[]>)]
                    );

                return (TResponse)failureMethod!.Invoke(null, [errorDict])!;
            }

            if (responseType == typeof(Result))
            {
                var errorDict1 = failures
                    .GroupBy(f => f.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(f => f.ErrorMessage).ToArray());
                return (TResponse)(object)Result.ValidationFailure(errorDict1);
            }

            var errorDict2 = failures
                .GroupBy(f => f.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(f => f.ErrorMessage).ToArray());
            throw new ValidationException(errorDict2);
        }

        return await next();
    }
}
