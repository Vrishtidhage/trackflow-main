import { Plus, MoveRight, FileText, ChartPie, CircleCheckBig, UserPlus, UserMinus } from "lucide-react"
import { FormatDate } from "./BugsCard"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../contexts/AuthContext"
import Spinner from "./utils/Spinner"
import axios from "axios"
import API_BASE_URL from "../api"

const STATUS_MAP = {
	todo: "Todo",
	in_progress: "In Progress",
	in_review: "In Review",
	done: "Done"
}

const LOGO_MAP = {
	create: Plus,
	title: FileText,
	description: FileText,
	status: CircleCheckBig,
	priority: ChartPie,
	assign: UserPlus,
	unassign: UserMinus
}

const CardHeader = ({ title, date, authorEmail }) => (
	<>
		<div className="flex flex-col sm:flex-row justify-between items-start">
			<h2 className="font-medium">{title}</h2>
			<span className="text-neutral-500 text-sm">{FormatDate(date, true)}</span>
		</div>
		<span className="text-neutral-500 mt-3">by {authorEmail}</span>
	</>
)

const ValueChange = ({ oldValue, newValue, className = "" }) => (
	<div className="flex justify-between items-center gap-5 mt-5">
		<div className="grow flex flex-col p-2 bg-neutral-800/50 rounded border border-neutral-500/30">
			<span className={className}>{oldValue}</span>
		</div>
		<MoveRight className="shrink-0" />
		<div className="grow flex flex-col p-2 bg-blue-900/30 rounded border border-blue-500/30">
			<span className={`text-blue-500 ${className}`}>{newValue}</span>
		</div>
	</div>
)

const FIELD_CONFIG = {
	create: {
		title: "Created Bug",
		render: () => <p className="mt-5 text-neutral-500">Bug was created in the system</p>
	},
	title: {
		title: "Updated Title",
		render: ({ history }) => <ValueChange oldValue={history.old_value} newValue={history.new_value} />
	},
	description: {
		title: "Updated Description",
		render: ({ history }) => (
			<ValueChange oldValue={history.old_value} newValue={history.new_value} className="whitespace-pre-wrap" />
		)
	},
	status: {
		title: "Updated Status",
		render: ({ history }) => (
			<ValueChange oldValue={STATUS_MAP[history.old_value]} newValue={STATUS_MAP[history.new_value]} />
		)
	},
	priority: {
		title: "Updated Priority",
		render: ({ history }) => (
			<ValueChange oldValue={history.old_value} newValue={history.new_value} className="capitalize" />
		)
	},
	assign: {
		title: "Assigned User",
		render: ({ user, currentUser }) => <UserBox user={user} currentUser={currentUser} />
	},
	unassign: {
		title: "Unassigned User",
		render: ({ user, currentUser }) => <UserBox user={user} currentUser={currentUser} />
	}
}

const UserBox = ({ user, currentUser }) => (
	<div className="mt-5">
		<span className="text-neutral-500">User: </span>
		<div className="p-2 mt-1 bg-blue-900/30 rounded border border-blue-500/30">
			<span className="text-blue-500">{currentUser.email === user.email ? "You" : user.email}</span>
		</div>
	</div>
)

export default function HistoryCard({ history }) {
	const Logo = LOGO_MAP[history.field_name]
	const { user: currentUser } = useContext(AuthContext)
	const [author, setAuthor] = useState(null)
	const [user, setUser] = useState(null)

	const isUserField = ["assign", "unassign"].includes(history.field_name)

	useEffect(() => {
		axios.get(`${API_BASE_URL}/users/${history.changed_by_id}`).then(res => setAuthor(res.data.data))

		if (isUserField) {
			axios.get(`${API_BASE_URL}/users/${history.new_value}`).then(res => setUser(res.data.data))
		}
	}, [history, isUserField])

	const config = FIELD_CONFIG[history.field_name]

	return (
		<div className="mb-5 flex gap-5">
			<div className="flex flex-col items-center">
				<Logo className="text-neutral-500 bg-neutral-900 rounded-4xl p-2 h-10 w-10" />
				<div className="grow mt-2 w-0.5 border border-neutral-800" />
			</div>

			<div className="border border-neutral-500/50 grow p-5 rounded">
				{(!author || !currentUser || (isUserField && !user)) ? <Spinner /> :
					<>
						<CardHeader title={config.title} date={history.changed_at} authorEmail={author.email} />
						{config.render({ history, author, user, currentUser })}
					</>
				}
			</div>
		</div>
	)
}

