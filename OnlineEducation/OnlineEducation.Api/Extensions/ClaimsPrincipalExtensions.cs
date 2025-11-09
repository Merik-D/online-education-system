using System.Security.Claims;

namespace OnlineEducation.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var idClaim = user.FindFirst(ClaimTypes.NameIdentifier);

        if (idClaim == null)
        {
            throw new ApplicationException("User ID claim not found in token");
        }

        return int.Parse(idClaim.Value);
    }
}