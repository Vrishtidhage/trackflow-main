export default function Spinner({ size = 'h-10 w-10', color = "border-blue-500", margin = "" }) {
	return (
		<div className="flex justify-center items-center">
			<div className={"border-4 border-t-transparent rounded-full animate-spin " + size + " " + color + " " + margin}></div>
		</div >

	)
}
