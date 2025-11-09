using OnlineEducation.Api.Enums;
using OnlineEducation.Api.Interfaces;

namespace OnlineEducation.Api.Services;

public class GradingStrategyFactory : IGradingStrategyFactory
{
    private readonly IEnumerable<IGradingStrategy> _strategies;

    public GradingStrategyFactory(IEnumerable<IGradingStrategy> strategies)
    {
        _strategies = strategies;
    }

    public IGradingStrategy GetStrategy(GradingStrategyType type)
    {
        var strategy = _strategies.FirstOrDefault(s => s.StrategyType == type);
        if (strategy == null)
        {
            throw new ArgumentOutOfRangeException(nameof(type), $"Strategy not found for type {type}");
        }
        return strategy;
    }
}