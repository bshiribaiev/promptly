
const rubric = [
  {
    name: "Purpose",
    weight: 2,
    description: "Main task and desired outcome are clear",
    check: prompt => /write|generate|build|create|make|design/i.test(prompt),
  },
  {
    name: "Context",
    weight: 2,
    description: "Provides enough background for accurate answers",
    check: prompt => prompt.length > 50 && /because|when|while|for|in order/i.test(prompt),
  },
  {
    name: "Specificity",
    weight: 2,
    description: "Narrow, detailed, and precise",
    check: prompt => /\d+|specific|exact|top|filter|with|by/i.test(prompt),
  },
  {
    name: "Unbiased",
    weight: 1,
    description: "Neutral tone, not leading or opinionated",
    check: prompt => !/terrible|best|worst|stupid|hate|amazing/i.test(prompt),
  },
  {
    name: "Format",
    weight: 1,
    description: "Clearly structured with expected output type",
    check: prompt => /step|example|code|explanation|definition|query|snippet/i.test(prompt),
  },
  {
    name: "Constraints",
    weight: 1,
    description: "Includes rules, limits, or requirements",
    check: prompt => /without|must|limit|under|constraint|max|min|only/i.test(prompt),
  },
  {
    name: "Audience",
    weight: 1,
    description: "Tailored to a specific user or skill level",
    check: prompt => /for a beginner|for a child|for a senior engineer|for non-technical/i.test(prompt),
  },
];

// ---- Scoring Logic ----
function scorePrompt(prompt) {
  let totalWeight = rubric.reduce((sum, c) => sum + c.weight, 0);
  let totalScore = 0;
  let breakdown = [];

  rubric.forEach(c => {
    const passed = c.check(prompt);
    const points = passed ? c.weight : 0;
    totalScore += points;

    breakdown.push({
      criterion: c.name,
      description: c.description,
      passed,
      points,
      weight: c.weight,
    });
  });

  return {
    totalScore: totalScore,
    maxScore: totalWeight,
    percentage: ((totalScore / totalWeight) * 100).toFixed(2) + "%",
    breakdown,
  };
}

// ---- Example Usage ----
//const examplePrompt = "Write a Python script that sorts a list of numbers without using sort().";
//console.log(scorePrompt(examplePrompt));
