import * as core from '@actions/core';
import fs from 'fs';

export function getConfig() {
	const url = core.getInput('url', { required: true });
	const username = core.getInput('username', { required: true });
	const password = core.getInput('password', { required: true });
	const endPointId = parseInt(
		core.getInput('endpoint_id', { required: true })
	);

	const stackName = core.getInput('stack_name', { required: true });
	const deleteStack = core.getInput('delete', { required: false }) === 'true';
	const stackDefinition = !deleteStack ? getStackDefinition() : '';

	const envVars: Record<string, string> = {};
	const envInput = core.getInput('env');
	if (envInput && !deleteStack) {
		const envEntries = envInput.split('\n').map((i) => i.trim());
		for (const envEntry of envEntries) {
			const [key, value] = envEntry.split('=');
			if (key && value) {
				core.info(`Setting env variable ${key}=${value}`);
				envVars[key] = value;
			}
		}
	}

	return {
		url,
		username,
		password,
		endPointId,
		stackName,
		deleteStack,
		stackDefinition,
		envVars,
	};
}

function getStackDefinition() {
	const filePath = core.getInput('stack_definition');
	if (!filePath) {
		throw new Error('Missing stack definition');
	}
	let stackDefinition = fs.readFileSync(filePath, 'utf-8');

	const templateVarsInput = core.getInput('template_variables', {
		required: false,
	});
	if (templateVarsInput) {
		const templateVars = templateVarsInput.split('\n').map((i) => i.trim());
		for (const templateVar of templateVars) {
			const [key, value] = templateVar.split('=');
			if (key && value) {
				core.info(`Substituting template variable ${key}=${value}`);
				stackDefinition = stackDefinition.replaceAll(
					`{{${key}}}`,
					`${value}`
				);
			}
		}
	}
	return stackDefinition;
}
