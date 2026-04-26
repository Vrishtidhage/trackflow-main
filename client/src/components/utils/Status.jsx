import { Clock, Loader, CheckCircle, Hourglass, Pickaxe } from "lucide-react";
export default function Status({ status }) {
	const text = {
		"todo": "Todo",
		"in_progress": "In Progress",
		"in_review": "In Review",
		"done": "Done"
	}

	const color = {
		"todo": "bg-neutral-700/50 text-white",
		"in_progress": "bg-blue-500 text-white",
		"in_review": "bg-purple-500 text-white",
		"done": "bg-green-500/80 text-white"
	}

	const icons = {
		"todo": <Clock className="inline mr-1 h-4 w-4" />,
		"in_progress": <Pickaxe className="inline mr-1 h-4 w-4" />,
		"in_review": <Hourglass className="inline mr-1 h-4 w-4" />,
		"done": <CheckCircle className="inline mr-1 h-4 w-4" />
	};

	return (
		<span className={"px-2 py-1 flex items-center gap-2 text-sm self-baseline rounded " + color[status]}>{icons[status]} {text[status]}</span>
	)
}
