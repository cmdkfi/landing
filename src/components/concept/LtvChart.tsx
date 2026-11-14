import { useState } from 'react';
import { Liveline } from 'liveline';
import { counterMeasure as copy } from '../../content/counter-measure';

// Illustrative scenario, anchored once so paused Liveline keeps the full comparison visible.
export default function LtvChart() {
  const [end] = useState(() => Date.now() / 1000);
  const points = (values: number[]) => values.map((value, i) => ({ time: end - 60 + i * 5, value }));
  const shared = [50, 51, 53, 56, 60, 65, 70];
  const series = [
    { id: 'protected', label: copy.text9, color: '#4b657a', data: points([...shared, 58, 50, 50, 50, 50, 50]), value: 50 },
    { id: 'unprotected', label: copy.text10, color: '#b44440', data: points([...shared, 74, 79, 83, 86, 86, 86]), value: 86 },
  ];
  return <div className="ltv-live" aria-label={copy.chartDescription}>
    <Liveline series={series} theme="light" window={65} paused windowStyle="text" style={{ height: "calc(100% - 56px)" }}
      referenceLine={{ value: 70, label: copy.actLabel }}
      formatValue={value => `${value.toFixed(1)}%`}
      formatTime={time => `${Math.round(time - end)}s`}
      pulse={false} momentum={false} fill={false} badge={false} degen={false}
      scrub lineWidth={2.5} padding={{ top: 28, bottom: 32, left: 12, right: 62 }} />
  </div>;
}
