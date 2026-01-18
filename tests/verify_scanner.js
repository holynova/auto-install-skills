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
const scanner_1 = require("../src/scanner");
const chalk_1 = __importDefault(require("chalk"));
function verifyScanner() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.blue('1. Testing Scanner Detection Logic...'));
        const agents = yield (0, scanner_1.scanForAgents)();
        if (agents.length === 0) {
            console.log(chalk_1.default.yellow('No agents installed on this machine (or detection failed).'));
        }
        else {
            console.log(chalk_1.default.green(`Found ${agents.length} agents:`));
            agents.forEach(a => console.log(`- ${a.name} @ ${a.skillsPath}`));
        }
        // Verify specifically for expected local setup (Antigravity should be found)
        const ag = agents.find(a => a.name === 'Antigravity');
        if (ag) {
            console.log(chalk_1.default.green('✓ Antigravity detected via dir check.'));
        }
        else {
            console.log(chalk_1.default.red('✗ Antigravity NOT detected (Check logic).'));
        }
    });
}
verifyScanner().catch(console.error);
