import { ArrowDownCircle, ArrowUpCircle, Flame, Zap } from "lucide-react";

export default function Priority({ priority }) {
	const color = {
		"low": "text-gray-300",
		"medium": "text-blue-500",
		"high": "text-yellow-500",
		"top": "text-red-500"
	};

	const iconMap = {
		"low": <ArrowDownCircle className="inline mr-1 h-4 w-4" />,
		"medium": <ArrowUpCircle className="inline mr-1 h-4 w-4" />,
		"high": <Flame className="inline mr-1 h-4 w-4" />,
		"top": <Zap className="inline mr-1 h-4 w-4" />
	};

	return (
		<span className={`${color[priority]} py-1 text-sm rounded capitalize flex items-center`}>
			{iconMap[priority]}
			{priority}
		</span>
	);
}
