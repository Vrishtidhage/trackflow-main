import Spinner from "./Spinner";

export default function TextInput({ label, type = "text", placeholder = "", value, onChange, disabled = false, isLoading = false }) {
	return (
		<>
			<div className="flex gap-2 items-center mb-2">
				<label className="text-white self-baseline font-bold" >{label}</label>
				{isLoading && <Spinner size="h-5 w-5" />}
			</div>
			<input disabled={disabled || isLoading} className="mb-4 text-white px-2 py-1 border border-neutral-500/50 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-neutral-900 disabled:cursor-not-allowed" type={type} placeholder={placeholder || label} value={value} onChange={onChange} required />
		</>
	)
}

