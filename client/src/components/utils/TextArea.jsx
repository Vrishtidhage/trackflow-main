import Spinner from "./Spinner";

export default function TextArea({ label, isLoading = false, value, onChange, placeholder, disabled = false }) {
	return (
		<>
			<div className="flex gap-2 items-center mb-2">
				<label className="text-white self-baseline font-bold" >{label}</label>
				{isLoading && <Spinner size="h-5 w-5" />}
			</div>
			<textarea disabled={disabled || isLoading} placeholder={placeholder || label} value={value} onChange={onChange} className="px-3 py-2 min-h-32 mb-4 border border-neutral-500/50 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-neutral-900 disabled:cursor-not-allowed" />
		</>
	)
}
