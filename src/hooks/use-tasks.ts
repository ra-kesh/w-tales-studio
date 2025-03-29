export const getTasks = async () => {
	const response = await fetch("/api/tasks", {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch tasks");
	}

	return response.json();
};
