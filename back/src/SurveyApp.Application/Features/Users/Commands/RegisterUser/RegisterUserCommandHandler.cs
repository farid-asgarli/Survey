using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Application.Features.Users.Commands.RegisterUser;

public class RegisterUserCommandHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork,
    IMapper mapper
) : IRequestHandler<RegisterUserCommand, Result<UserDto>>
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<UserDto>> Handle(
        RegisterUserCommand request,
        CancellationToken cancellationToken
    )
    {
        // Validate email
        if (!Email.TryCreate(request.Email, out var email) || email == null)
        {
            return Result<UserDto>.Failure("Invalid email address.");
        }

        // Check if user already exists
        var existingUser = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (existingUser != null)
        {
            return Result<UserDto>.Failure("A user with this email already exists.");
        }

        // Create user (password hashing will be handled by Identity in Infrastructure layer)
        var user = User.Create(email.Value, request.Password, request.FirstName, request.LastName);

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<UserDto>(user);
        return Result<UserDto>.Success(dto);
    }
}
