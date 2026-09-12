import { useId } from "react";

export function Shape({
	variant = 0,
	className = "",
	progress = 1,
}: {
	variant?: number;
	className?: string;
	progress?: number;
}) {
	const id = useId().replace(/:/g, "");
	return (
		<svg
			viewBox="0 0 400 320"
			fill="none"
			className={`shape w-full h-auto block ${className}`}
			aria-hidden="true"
		>
			<defs>
				<pattern
					id={`${id}-lines`}
					width="5"
					height="5"
					patternUnits="userSpaceOnUse"
					patternTransform={`rotate(${variant % 2 ? -35 : 35})`}
				>
					<path d="M0 0V5" stroke="currentColor" strokeWidth="1.8" />
				</pattern>
				<pattern
					id={`${id}-thin`}
					width="5"
					height="5"
					patternUnits="userSpaceOnUse"
				>
					<path d="M0 0V5" stroke="currentColor" strokeWidth="1.5" />
				</pattern>
			</defs>
			{variant % 4 === 0 ? (
				<g transform="translate(0 -12)">
					{[
						[200, 46],
						[142, 80],
						[258, 80],
						[200, 114],
						[84, 114],
						[142, 148],
						[258, 148],
						[200, 182],
					].map(([x = 0, y = 0], i) => (
						<g key={`${x}-${y}`} opacity={i / 8 > progress ? 0.14 : 1}>
							<path
								d={`M${x} ${y}l58 34-58 34-58-34Z`}
								fill={`url(#${id}-lines)`}
							/>
							<path
								d={`M${x - 58} ${y + 34}l58 34v65l-58-34Z`}
								fill={`url(#${id}-thin)`}
							/>
							<path
								d={`M${x} ${y + 68}l58-34v65l-58 34Z`}
								fill={`url(#${id}-lines)`}
							/>
						</g>
					))}
				</g>
			) : variant % 4 === 1 ? (
				<g transform="translate(200 160)">
					{Array.from({ length: 28 }, (_, i) => (
						<ellipse
							key={i}
							rx={28 + i * 4.1}
							ry={120 - i * 2.7}
							transform={`rotate(${i * 6.4})`}
							stroke="currentColor"
							strokeWidth="1"
							opacity={i / 28 > progress ? 0.13 : 0.85}
						/>
					))}
				</g>
			) : variant % 4 === 2 ? (
				<g>
					{Array.from({ length: 28 }, (_, i) => (
						<path
							key={i}
							d={`M${62 + i * 4} 255 L${200 + i * 2} ${40 + i * 3} L${338 - i * 4} 255Z`}
							stroke="currentColor"
							strokeWidth="1.25"
							opacity={i / 28 > progress ? 0.13 : 1}
						/>
					))}
				</g>
			) : (
				<g transform="translate(200 160)">
					{Array.from({ length: 32 }, (_, i) => (
						<rect
							key={i}
							x={-108 + i * 2}
							y={-108 + i * 2}
							width={216 - i * 4}
							height={216 - i * 4}
							transform={`rotate(${i * 3})`}
							stroke="currentColor"
							opacity={i / 32 > progress ? 0.13 : 1}
						/>
					))}
				</g>
			)}
		</svg>
	);
}
