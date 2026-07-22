import {
	Bar,
	BarChart as RechartsBarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

/**
 * A data-driven visualization island.
 *
 * @param {Object} props
 * @param {Array<{ label: string, value: number }>} props.data
 *   Plain serializable data — passed as an MDX prop, so no functions or
 *   class instances.
 * @param {string} [props.color] - Bar fill color.
 */
export default function BarChart({ data = [], color = '#9a6a3c' }) {
	const tick = { fill: '#908c83', fontSize: 12, fontFamily: 'IBM Plex Mono, monospace' };
	return (
		<div style={{ width: '100%', height: 320 }}>
			<ResponsiveContainer width="100%" height="100%">
				<RechartsBarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
					<CartesianGrid vertical={false} stroke="#e8e4db" />
					<XAxis dataKey="label" tick={tick} stroke="#e8e4db" tickLine={false} />
					<YAxis allowDecimals={false} tick={tick} stroke="#e8e4db" tickLine={false} />
					<Tooltip
						cursor={{ fill: 'rgba(154,106,60,0.08)' }}
						contentStyle={{
							border: '1px solid #e8e4db',
							borderRadius: 4,
							fontFamily: 'IBM Plex Mono, monospace',
							fontSize: 12,
						}}
					/>
					<Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
				</RechartsBarChart>
			</ResponsiveContainer>
		</div>
	);
}
