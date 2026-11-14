# Counter-measure and incident charts

The /1 section follows an Origin-inspired text/chart split with large comparative results. It keeps the page's Kecal type, technical mono labels, white surfaces, slate #4b657a and liquidation red #b44440. A continuous, subdued green liquid backdrop sits outside the chart card; reduced-motion disables it.

## Chart rendering

The three incident charts use Liveline 0.0.7. The counter-measure uses a native horizontal 0–100% LTV scale. The existing pnpm package patch preserves Kecal and adds optional `time`, `timeRange`, and `valueRange` props for controlled historical rendering. Omitted props retain the original live behavior. Both ESM and CJS builds and declarations are patched. Controlled time disables interpolation of live values, preventing previous samples and keyboard seeks from drifting.

The LTV scale uses a circle for CMDK and a diamond for the unprotected position, offset vertically so coincident values remain visible. Fixed threshold marks at 50%, 70%, and 86% distinguish strategy settings from the market liquidation threshold. It plays once on visibility for ten seconds, including a 1.2-second hold at 70%. Protected LTV returns to 50%; unprotected LTV reaches the 86% liquidation-eligibility threshold. A fixed domain prevents autoscaling from obscuring the comparison. Pause, replay, and a native keyboard-accessible range control inspect the scenario. Rendering updates at most roughly 30 times per second; playback stops offscreen and while the document is hidden. Reduced-motion immediately shows the outcome without autoplay. The three stages describe the market fall, agent repayment, and return to target. No invented transaction timestamps or fixed execution-speed claims are displayed.

Incident charts use the existing verified block samples through the write-off block, with exact before/after metrics retained. Later asset movements are excluded so the plotted endpoint agrees with REMAINING. Lines between sampled blocks are explicitly described as visual guides, not additional measurements. Decorative pulse and interpolated hover tooltips are disabled. The historic clock never advances with today's time.

## Evidence and arithmetic

The public cmdkfi/app backtest at 11f9e2ff8f26638051b9afcfdd7d6833bd02479e supports 20/20 simulated positions from Morpho and Aave across October 2025 and Jan–Feb 2026, using a two-minute execution delay. It does not establish the supplied exact timestamps, a 12-second intervention, a $4,810 penalty, or a 3.2% sale. The illustration is labeled separately and links to the source for the historical metric.

The result metrics show 50% restored LTV and a 36 percentage-point buffer to the 86% example threshold, alongside the sourced 20/20 simulation. No guaranteed 100% collateral loss or universal 5% fee is claimed. Liquidation eligibility does not establish execution or the amount liquidated. Liveline remains unchanged for the historical incidents.

Validation: build and content checks pass. Browser inspection confirms both markers at 70%, the protected marker at 50% after repayment, and the unprotected marker at 86% at completion. Keyboard Home/End can inspect the start/end without an animated transition. The existing reduced-motion behavior shows the final outcome and disables autoplay.
