"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortainerService = void 0;
const core = __importStar(require("@actions/core"));
const axios_1 = __importDefault(require("axios"));
class PortainerService {
    constructor(url, endPointId) {
        this.endPointId = endPointId;
        this.token = null;
        this.client = axios_1.default.create({ baseURL: url + '/api/' });
        this.client.interceptors.request.use((config) => {
            if (this.token) {
                config.headers['Authorization'] = `Bearer ${this.token}`;
            }
            return config;
        });
    }
    authenticate(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            core.info('Authenticating with Portainer...');
            try {
                yield this.client.post('/auth', {
                    username,
                    password,
                });
                core.info('Authentication succeeded');
            }
            catch (e) {
                core.info(`Authentication failed: ${e.message}`);
            }
        });
    }
    logout() {
        this.token = null;
    }
    createStack(name, stackFileContent) {
        return __awaiter(this, void 0, void 0, function* () {
            core.info(`Creating stack ${name}...`);
            try {
                const { data } = yield this.client.post('stacks', { name, stackFileContent }, {
                    params: {
                        endpointId: this.endPointId,
                        method: 'string',
                        type: 2,
                    },
                });
                core.info(`Successfully created stack ${data.name} with id ${data.id}`);
            }
            catch (e) {
                core.info(`Stack creation failed: ${e.message}`);
            }
        });
    }
    getStacks() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.client.get('/stacks', {
                params: { endpointId: this.endPointId },
            });
            return data;
        });
    }
    findStack(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const stacks = yield this.getStacks();
            return stacks.find((s) => (s.name = name));
        });
    }
    deleteStack(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const stack = yield this.findStack(name);
            if (stack) {
                core.info(`Creating stack ${name}...`);
                try {
                    yield this.client.delete(`/stacks/${stack.id}`, {
                        params: { endPointId: this.endPointId },
                    });
                    core.info(`Successfully deleted stack ${name}`);
                }
                catch (e) {
                    core.info(`Stack deletion failed: ${e.message}`);
                }
            }
        });
    }
}
exports.PortainerService = PortainerService;
//# sourceMappingURL=PortainerService.js.map