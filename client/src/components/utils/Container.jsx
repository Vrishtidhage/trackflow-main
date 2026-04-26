export default function Container({ children, className }) {
	return (
		<div className={"container mx-auto px-4 min-h-screen " + className}>
			{children}
		</div>
	)
}
