import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Container from "../components/utils/Container";
import Navbar from "../components/Navbar";
import Spinner from "../components/utils/Spinner";
import { BlackButton } from "../components/utils/Buttons";
import HistoryCard from "../components/HistoryCard";
import { History } from "lucide-react"
import API_BASE_URL from "../api";

export default function BugHistory() {
	const { bug_id, project_id } = useParams()
	const [history, setHistory] = useState(null)
	const navigate = useNavigate()

	useEffect(() => {
		axios.get(`${API_BASE_URL}/bugs/${bug_id}/history`)
			.then(response => {
				setHistory(response.data.data)
			})
	}, [bug_id])

	return (
		<Container className="max-w-5xl">
			<Navbar>
				<BlackButton onClick={() => navigate(`/projects/${project_id}/bugs/${bug_id}`)}>← Back to Bug</BlackButton>
			</Navbar>
			<div className="mt-16">
				<h1 className="flex gap-5 text-3xl pt-10 font-bold">
					<History className="h-10 w-10 text-blue-500" />
					Bug History
				</h1>
				<p className="text-neutral-400 text-lg mt-2">Complete timeline of changes for Bug #{bug_id}</p>
				{
					history ?
						<div className="mt-5">
							{history.map(entry => <HistoryCard key={entry.id} history={entry} />)}
						</div>
						:
						<Spinner />
				}
			</div>
		</Container>
	)
}
