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
const core = __importStar(require("@actions/core"));
const PortainerService_1 = require("./PortainerService");
const fs_1 = __importDefault(require("fs"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = core.getInput('url', { required: true });
        const username = core.getInput('username', { required: true });
        const password = core.getInput('password', { required: true });
        const endPointId = parseInt(core.getInput('endpoint_id', { required: true }));
        const name = core.getInput('stack_name', { required: true });
        const deleteStack = core.getInput('delete', { required: false }) === 'true';
        const portainer = new PortainerService_1.PortainerService(url, endPointId);
        yield portainer.authenticate(username, password);
        if (deleteStack) {
            yield portainer.deleteStack(name);
        }
        else {
            const filePath = core.getInput('stack_definition');
            if (!filePath) {
                throw new Error('Missing stack definition');
            }
            let stackDefinition = fs_1.default.readFileSync(filePath, 'utf-8');
            if (!stackDefinition) {
                throw new Error(`Could not find stack definition file ${filePath}`);
            }
            const imagesInput = core.getInput('images');
            if (imagesInput) {
                const images = imagesInput.split('\n').map((i) => i.trim());
                for (const image of images) {
                    const imageWithoutTag = image.substring(0, image.indexOf(':'));
                    core.info(`Inserting image ${image} into the stack definition`);
                    stackDefinition = stackDefinition.replace(new RegExp(`${imageWithoutTag}(:.*)?\n`), `${image}\n`);
                }
            }
            const envVars = {};
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
            const stack = yield portainer.findStack(name);
            if (!stack) {
                yield portainer.createStack(name, stackDefinition, envVars);
            }
            else {
                yield portainer.updateStack(stack, stackDefinition, envVars);
            }
        }
    }
    catch (e) {
        core.setFailed(`Action failed with error: ${e.message}`);
    }
}))();
//# sourceMappingURL=index.js.map