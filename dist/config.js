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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
const core = __importStar(require("@actions/core"));
const fs_1 = __importDefault(require("fs"));
function getConfig() {
    const url = core.getInput('url', { required: true });
    const username = core.getInput('username', { required: true });
    const password = core.getInput('password', { required: true });
    const endPointId = parseInt(core.getInput('endpoint_id', { required: true }));
    const stackName = core.getInput('stack_name', { required: true });
    const deleteStack = core.getInput('delete', { required: false }) === 'true';
    const stackDefinition = !deleteStack ? getStackDefinition() : '';
    const envVars = {};
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
    let stackDefinition = fs_1.default.readFileSync(filePath, 'utf-8');
    const imagesInput = core.getInput('images');
    if (imagesInput) {
        const images = imagesInput.split('\n').map((i) => i.trim());
        for (const image of images) {
            const imageWithoutTag = image.substring(0, image.indexOf(':'));
            core.info(`Inserting image ${image} into the stack definition`);
            stackDefinition = stackDefinition.replace(new RegExp(`(['"]?)${imageWithoutTag}:[^'"\n]*\\1\n`, 'g'), `$1${image}$1\n`);
        }
    }
    const templateVarsInput = core.getInput('template_variables', {
        required: false,
    });
    if (templateVarsInput) {
        const templateVars = templateVarsInput.split('\n').map((i) => i.trim());
        for (const templateVar of templateVars) {
            const [key, value] = templateVar.split('=');
            if (key && value) {
                core.info(`Substituting template variable ${key}=${value}`);
                stackDefinition = stackDefinition.replaceAll(`{{${key}}}`, `${value}`);
            }
        }
    }
    return stackDefinition;
}
//# sourceMappingURL=config.js.map