import * as core from '@actions/core';
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
			let stackDefinition = fs.readFileSync(filePath, 'utf-8');
			if (!stackDefinition) {
				throw new Error(
					`Could not find stack definition file ${filePath}`
				);
			}

			const imagesInput = core.getInput('images');
			if (imagesInput) {
				const images = imagesInput.split('\n').map((i) => i.trim());
				for (const image of images) {
					const imageWithoutTag = image.substring(
						0,
						image.indexOf(':')
					);
					core.info(
						`Inserting image ${image} into the stack definition`
					);
					stackDefinition = stackDefinition.replace(
						new RegExp(
							`(['"]?)${imageWithoutTag}:[^'"\n]*\\1\n`,
							'g'
						),
						`$1${image}$1\n`
					);
				}
			}

			const envVars = {} as Record<string, string>;
			const envInput = core.getInput('env');
			if (envInput) {
				const envEntries = envInput.split('\n').map((i) => i.trim());
				for (const envEntry of envEntries) {
					const [key, value] = envEntry.split('=');
					if (key && value) {
						core.info(`Setting env variable ${key}=${value}`);
						envVars[key] = value;
					}
				}
			}

			const stack = await portainer.findStack(name);
			if (!stack) {
				await portainer.createStack(name, stackDefinition, envVars);
			} else {
				await portainer.updateStack(stack, stackDefinition, envVars);
			}
		}
	} catch (e) {
		core.setFailed(`Action failed with error: ${e.message}`);
	}
})();
