import React, { Suspense } from "react";
import ProjeectForm from "../project-form";

const NewProject = () => {
	return (
		<div className="flex items-center justify-center p-4 pt-0">
			<Suspense>
				<ProjeectForm />
			</Suspense>
		</div>
	);
};

export default NewProject;
