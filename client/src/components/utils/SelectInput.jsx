export default function SelectInput({ children, label, value, onChange }) {
	return (
		<>
			<label className="text-white self-baseline font-bold mb-2 capitalize">{label}</label>
			<select className="border border-neutral-500/50 p-2 mb-4 rounded" name={label} value={value} onChange={onChange}>
				{children}
			</select>
		</>
	)
}
