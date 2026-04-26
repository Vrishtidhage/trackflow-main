import { Lock } from "lucide-react"

const colorMaps = {
	"blue": "bg-blue-900/50",
	"green": "bg-green-900/50"
}

export default function FeatureCard({ features }) {
	return (
		<div className="p-5 border border-neutral-500/50 hover:border-blue-500/50 rounded-2xl flex flex-col gap-10 items-baseline">
			<div className={"p-2 rounded " + colorMaps[features.color]}>
				{features.logo}
			</div>
			<span className="text-lg font-bold inline">{features.title}</span>
			<span className="text-neutral-500 inline">{features.description}</span>
		</div>
	)
}
