import { useNavigate } from "react-router-dom";

export default function TextWithBugLinks({ text, projectId }) {
	const navigate = useNavigate();
	const regex = /bug #(\d+)/gi;
	const parts = [];
	let lastIndex = 0;
	let match;

	while ((match = regex.exec(text)) !== null) {
		parts.push(text.substring(lastIndex, match.index));
		const bugId = match[1];
		parts.push(
			<button
				key={match.index}
				onClick={() => navigate(`/projects/${projectId}/bugs/${bugId}`)}
				className="text-blue-500 underline cursor-pointer bg-transparent border-none p-0"
				type="button"
			>
				{match[0]}
			</button>
		);
		lastIndex = regex.lastIndex;
	}
	parts.push(text.substring(lastIndex));
	return <>{parts}</>;
}

