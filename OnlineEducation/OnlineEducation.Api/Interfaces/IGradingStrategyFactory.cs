using OnlineEducation.Api.Enums;
namespace OnlineEducation.Api.Interfaces;
public interface IGradingStrategyFactory
{
    IGradingStrategy GetStrategy(GradingStrategyType type);
}