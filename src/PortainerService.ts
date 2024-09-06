import * as core from '@actions/core';
import axios, { AxiosError, AxiosInstance } from 'axios';

type Stack = {
	Id: number;
	Name: string;
	Env: string | null;
};
export class PortainerService {
	private client: AxiosInstance;

	constructor(url: string, private endPointId: number) {
		this.client = axios.create({ baseURL: url + '/api' });
	}

	async authenticate(username: string, password: string) {
		core.info('Authenticating with Portainer...');
		try {
			const { data } = await this.client.post('/auth', {
				username,
				password,
			});
			this.client.defaults.headers.common[
				'Authorization'
			] = `Bearer ${data.jwt}`;
			core.info('Authentication succeeded');
		} catch (e) {
			core.info(
				`Authentication failed: ${JSON.stringify(
					e instanceof AxiosError ? e.response?.data : e
				)}`
			);
			throw e;
		}
	}

	async getStacks(): Promise<Stack[]> {
		const { data } = await this.client.get('/stacks', {
			params: { endpointId: this.endPointId },
		});
		return data;
	}

	async findStack(name: string) {
		const stacks = await this.getStacks();
		return stacks.find((s) => s.Name === name);
	}

	async crupdateStack(name: string, stackFileContent: string) {
		const stack = await this.findStack(name);
		if (!stack) {
			core.info(`Creating stack ${name}...`);
			try {
				const { data } = await this.client.post(
					'/stacks',
					{ name, stackFileContent },
					{
						params: {
							endpointId: this.endPointId,
							method: 'string',
							type: 2,
						},
					}
				);
				core.info(
					`Successfully created stack ${data.Name} with id ${data.Id}`
				);
			} catch (e) {
				core.info(
					`Stack creation failed: ${JSON.stringify(
						e instanceof AxiosError ? e.response?.data : e
					)}`
				);
				throw e;
			}
		} else {
			core.info(`Updating stack ${stack.Name}...`);
			try {
				const { data } = await this.client.put(
					`/stacks/${stack.Id}`,
					{ env: stack.Env, stackFileContent },
					{
						params: {
							endpointId: this.endPointId,
						},
					}
				);
				core.info(`Successfully updated stack ${data.Name}`);
			} catch (e) {
				core.info(
					`Stack update failed: ${JSON.stringify(
						e instanceof AxiosError ? e.response?.data : e
					)}`
				);
				throw e;
			}
		}
	}

	async deleteStack(name: string) {
		const stack = await this.findStack(name);
		if (stack) {
			core.info(`Deleting stack ${name}...`);
			try {
				await this.client.delete(`/stacks/${stack.Id}`, {
					params: { endPointId: this.endPointId },
				});
				core.info(`Successfully deleted stack ${name}`);
			} catch (e) {
				core.info(
					`Stack deletion failed: ${JSON.stringify(
						e instanceof AxiosError ? e.response?.data : e
					)}`
				);
				throw e;
			}
		}
	}
}
