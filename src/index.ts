import core from '@actions/core';
import axios from 'axios';
import { PortainerService } from './PortainerService';
import fs from 'fs';

(async () => {
	try {
		const url = core.getInput('url', { required: true });
		const username = core.getInput('username', { required: true });
		const password = core.getInput('password', { required: true });
		const endPointId = parseInt(
			core.getInput('endpoint_id', { required: true })
		);
		const name = core.getInput('stack_name', { required: true });
		const deleteStack =
			core.getInput('delete', { required: false }) === 'true';

		const portainer = new PortainerService(url, endPointId);

		await portainer.authenticate(username, password);

		if (deleteStack) {
			await portainer.deleteStack(name);
		} else {
			const filePath = core.getInput('stack_definition');
			if (!filePath) {
				throw new Error('Missing stack definition');
			}
			let file = fs.readFileSync(filePath, 'utf-8');
			if (!file) {
				throw new Error(
					`Could not find stack definition file ${filePath}`
				);
			}
			await portainer.createStack(name, file);
		}
	} catch (e) {
		core.setFailed(`Action failed with error: ${e.message}`);
	}
})();
