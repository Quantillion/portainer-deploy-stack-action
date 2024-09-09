import * as core from '@actions/core';
import axios, { AxiosError, AxiosInstance } from 'axios';

type Stack = {
	Id: number;
	Name: string;
	Env: {
		name: string;
		value: string | number | boolean;
		needsDeletion: boolean;
	}[];
};
export class PortainerService {
	private client: AxiosInstance;

	constructor(url: string, private endpointId: number) {
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
			params: { endpointId: this.endpointId },
		});
		return data;
	}

	async findStack(name: string) {
		const stacks = await this.getStacks();
		return stacks.find((s) => s.Name === name);
	}

	async createStack(
		name: string,
		stackFileContent: string,
		envVars: Record<string, string>
	) {
		core.info(`Creating stack ${name}...`);
		try {
			const { data } = await this.client.post(
				'/stacks',
				{
					name,
					stackFileContent,
					env: Object.entries(envVars).map(([name, value]) => [
						{ name, value, needsDeletion: false },
					]),
				},
				{
					params: {
						endpointId: this.endpointId,
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
	}

	async updateStack(
		stack: Stack,
		stackFileContent: string,
		envVars: Record<string, string>
	) {
		core.info(`Updating stack ${stack.Name}...`);
		try {
			const { data } = await this.client.put(
				`/stacks/${stack.Id}`,
				{
					env: [
						...stack.Env,
						Object.entries(envVars).map(([name, value]) => [
							{ name, value, needsDeletion: false },
						]),
					],
					stackFileContent,
				},
				{
					params: {
						endpointId: this.endpointId,
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

	async deleteStack(name: string) {
		const stack = await this.findStack(name);
		if (stack) {
			core.info(`Deleting stack ${name}...`);
			try {
				await this.client.delete(`/stacks/${stack.Id}`, {
					params: { endpointId: this.endpointId },
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
