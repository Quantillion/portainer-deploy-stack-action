import * as core from '@actions/core';
import { PortainerService } from './PortainerService';
import { getConfig } from './config';

(async () => {
	try {
		const {
			url,
			endPointId,
			username,
			password,
			stackName,
			deleteStack,
			stackDefinition,
			envVars,
		} = getConfig();

		const portainer = new PortainerService(url, endPointId);
		await portainer.authenticate(username, password);

		if (deleteStack) {
			await portainer.deleteStack(stackName);
		} else {
			const stack = await portainer.findStack(stackName);
			if (!stack) {
				await portainer.createStack(
					stackName,
					stackDefinition,
					envVars
				);
			} else {
				await portainer.updateStack(stack, stackDefinition, envVars);
			}
		}
	} catch (e) {
		core.setFailed(`Action failed with error: ${e.message}`);
	}
})();
