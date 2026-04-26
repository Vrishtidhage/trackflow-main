export default function CountCard({ count, label, active, handleClick }) {
	return (
		<div onClick={handleClick} className={`p-3 border-2 bg-neutral-900/40 rounded-lg flex flex-col gap-3 hover:border-blue-500 cursor-pointer ${active ? "border-green-500/70" : "border-neutral-500/70"}`}>
			<span className="text-neutral-400">{label}</span>
			<span className="text-xl font-bold">{count}</span>
		</div>
	)
}
