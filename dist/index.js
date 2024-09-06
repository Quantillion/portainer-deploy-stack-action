"use strict";
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
const core_1 = __importDefault(require("@actions/core"));
const PortainerService_1 = require("./PortainerService");
const fs_1 = __importDefault(require("fs"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = core_1.default.getInput('url', { required: true });
        const username = core_1.default.getInput('username', { required: true });
        const password = core_1.default.getInput('password', { required: true });
        const endPointId = parseInt(core_1.default.getInput('endpoint_id', { required: true }));
        const name = core_1.default.getInput('stack_name', { required: true });
        const deleteStack = core_1.default.getInput('delete', { required: false }) === 'true';
        const portainer = new PortainerService_1.PortainerService(url, endPointId);
        yield portainer.authenticate(username, password);
        if (deleteStack) {
            yield portainer.deleteStack(name);
        }
        else {
            const filePath = core_1.default.getInput('stack_definition');
            if (!filePath) {
                throw new Error('Missing stack definition');
            }
            let file = fs_1.default.readFileSync(filePath, 'utf-8');
            if (!file) {
                throw new Error(`Could not find stack definition file ${filePath}`);
            }
            yield portainer.createStack(name, file);
        }
    }
    catch (e) {
        core_1.default.setFailed(`Action failed with error: ${e.message}`);
    }
}))();
//# sourceMappingURL=index.js.map