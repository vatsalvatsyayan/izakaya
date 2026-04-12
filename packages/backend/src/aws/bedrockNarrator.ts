import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import type { SimulationState, Recommendation, ChangeLogEntry } from '@izakaya/shared';

function bedrockClient() { return new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' }); }
function MODEL_ID() { return process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-3-haiku-20240307-v1:0'; }

function isEnabled(): boolean {
  return process.env.AWS_INTEGRATION_ENABLED === 'true';
}

async function invokeModel(system: string, userPrompt: string, maxTokens: number): Promise<string> {
  const response = await bedrockClient().send(new InvokeModelCommand({
    modelId: MODEL_ID(),
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  }));

  const responseBody = JSON.parse(Buffer.from(response.body).toString());
  return responseBody.content[0].text as string;
}

/**
 * Enrich a recommendation's body text using Bedrock.
 * Returns the enriched body, or the original body if Bedrock fails or is disabled.
 */
export async function enrichRecommendationWithBedrock(
  recommendation: Recommendation,
  currentState: SimulationState,
): Promise<string> {
  if (!isEnabled()) return recommendation.body;

  const metrics = recommendation.projectedImpact.metricChanges
    .map(m => `${m.metric}: current=${m.currentValue} → projected=${m.projectedValue}`)
    .join(', ');

  const prompt = `Current facility state:
- PUE: ${currentState.derivedMetrics.pue.toFixed(2)} | WUE: ${currentState.derivedMetrics.wue.toFixed(2)} L/kWh
- Carbon output: ${currentState.derivedMetrics.carbonOutputKgPerHr.toFixed(1)} kgCO2/hr
- Total carbon emitted this session: ${currentState.derivedMetrics.totalCarbonEmittedKg.toFixed(1)} kg
- Total water consumed this session: ${currentState.derivedMetrics.totalWaterConsumedLiters.toFixed(0)} liters
- Community: ${currentState.layers.location.communityName}, Water Stress Index: ${currentState.layers.location.waterStressIndex}

Alert triggered: ${recommendation.title}
Trigger condition: ${recommendation.triggerCondition}
Suggested action: Set ${recommendation.suggestedAction.lever} from ${recommendation.suggestedAction.currentValue} to ${recommendation.suggestedAction.suggestedValue}
Projected metric changes: ${metrics}
End-user impact if action taken: ${recommendation.projectedImpact.endUserImpact}
Community impact if action taken: ${recommendation.projectedImpact.communityImpact}

Generate a recommendation body paragraph for the operator.`;

  try {
    const enrichedText = await invokeModel(
      `You are the AI advisor embedded in a real-time data center sustainability dashboard.
You analyze live operational data and generate concise, actionable recommendations for human operators.
You always:
- Lead with the specific metric value and threshold that triggered this alert
- Quantify the projected impact of the suggested action in concrete units (liters, kgCO2, milliseconds, requests/hr)
- Mention the community or end-user group most affected
- Remind the operator this is a decision-support tool, not a decision-maker
- Write in 2-3 sentences maximum. Be direct and data-driven.
Do not use bullet points. Write in flowing prose.`,
      prompt,
      300,
    );
    console.log(`[Bedrock] Enriched recommendation: ${recommendation.id}`);
    return enrichedText;
  } catch (err) {
    console.error('[Bedrock] Enrichment failed, using template body (non-fatal):', err);
    return recommendation.body;
  }
}

/**
 * Generate a post-action sustainability narrative after 5 simulated minutes.
 * Returns an empty string if Bedrock fails or is disabled.
 */
export async function generatePostActionNarrative(
  entry: ChangeLogEntry,
  currentState: SimulationState,
): Promise<string> {
  if (!isEnabled()) return '';
  if (!entry.outcomeAfterFiveMinutes) return '';

  const outcome = entry.outcomeAfterFiveMinutes;

  const prompt = `An operator took the following action and we have observed the results after 5 simulated minutes:

Action: ${entry.operatorAction}
Layer: ${entry.layerId}, Lever: ${entry.leverId}
Change: ${entry.previousValue} → ${entry.newValue}
Tradeoff acknowledged: "${entry.tradeoffAcknowledgment.tradeoffText}"
Community impact acknowledged: "${entry.tradeoffAcknowledgment.communityImpactText}"

Projection accuracy: ${outcome.projectionAccuracy}
Current facility state after action:
- PUE: ${currentState.derivedMetrics.pue.toFixed(2)}
- Carbon output: ${currentState.derivedMetrics.carbonOutputKgPerHr.toFixed(1)} kgCO2/hr
- Water usage: ${currentState.layers.cooling.waterUsageRate} L/hr
- Community (${currentState.layers.location.communityName}) water stress: ${currentState.layers.location.waterStressIndex}

Generate a 2-3 sentence post-action narrative summarizing what happened and its significance.`;

  try {
    const narrative = await invokeModel(
      `You are a sustainability impact narrator for a data center operations dashboard.
When an operator takes an action and its effects are observed, you write a brief factual summary of what happened.
Write in past tense. 2-3 sentences maximum. Be specific with numbers.
Always end with one sentence about the broader significance — community, carbon, or end-user — of this decision.`,
      prompt,
      250,
    );
    console.log(`[Bedrock] Post-action narrative generated for entry: ${entry.id}`);
    return narrative;
  } catch (err) {
    console.error('[Bedrock] Post-action narrative failed (non-fatal):', err);
    return '';
  }
}
