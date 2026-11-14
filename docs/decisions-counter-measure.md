# Counter-measure and incident charts

The /1 section follows an Origin-inspired text/chart split with large comparative results. It keeps the page's Kecal type, technical mono labels, white surfaces, slate #4b657a and liquidation red #b44440. A continuous, subdued green liquid backdrop sits outside the chart card; reduced-motion disables it.

## Liveline integration

All four charts use Liveline 0.0.7. The existing pnpm package patch preserves Kecal and adds optional `time`, `timeRange`, and `valueRange` props for controlled historical rendering. Omitted props retain the original live behavior. Both ESM and CJS builds and declarations are patched. Controlled time disables interpolation of live values, preventing previous samples and keyboard seeks from drifting.

The LTV timeline plays once on visibility for ten seconds, including a 1.2-second hold at 70%. Protected LTV returns to 50%; unprotected LTV reaches 86%. A fixed domain prevents autoscaling from obscuring the comparison. Pause, replay, and a native keyboard-accessible range control inspect the scenario. Rendering updates at most roughly 30 times per second; playback stops offscreen and while the document is hidden. Reduced-motion immediately shows the outcome without autoplay. Timestamps are illustrative and time is compressed by event, not proportional to wall-clock time.

Incident charts use the existing verified block samples through the write-off block, with exact before/after metrics retained. Later asset movements are excluded so the plotted endpoint agrees with REMAINING. Lines between sampled blocks are explicitly described as visual guides, not additional measurements. Decorative pulse and interpolated hover tooltips are disabled. The historic clock never advances with today's time.

## Evidence and arithmetic

The public cmdkfi/app backtest at 11f9e2ff8f26638051b9afcfdd7d6833bd02479e supports 20/20 simulated positions from Morpho and Aave across October 2025 and Jan–Feb 2026, using a two-minute execution delay. It does not establish the supplied exact timestamps, a 12-second intervention, a $4,810 penalty, or a 3.2% sale. The illustration is labeled separately and links to the source for the historical metric.

For constant-price collateral sale and debt repayment, (0.70 - x) / (1 - x) = 0.50 gives x = 0.40. The illustration therefore shows 40% sold and 60% retained, excluding fees/slippage. It does not advertise 96.8% retained for that operation. The unsupported 12% market-drop caption was removed.
