import StreamZip from 'node-stream-zip';
import { join } from 'path';
import { URL } from 'url';
import { ToggleableModuleStructure } from './ToggleableModule.struct.js';
export class BaseModStructure extends ToggleableModuleStructure {
    modMetadata = {};
    async getSpecModel() {
        // Sort by file name to allow control of load order.
        return (await super.getSpecModel()).sort((a, b) => {
            const aFileName = a.artifact.url.substring(a.artifact.url.lastIndexOf('/') + 1);
            const bFileName = b.artifact.url.substring(b.artifact.url.lastIndexOf('/') + 1);
            return aFileName.localeCompare(bFileName);
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getModuleUrl(name, path, stats) {
        return new URL(join(this.relativeRoot, this.getActiveNamespace(), name), this.baseUrl).toString();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getModulePath(name, path, stats) {
        return null;
    }
    getModMetadata(name, path) {
        return new Promise((resolve, reject) => {
            if (!Object.prototype.hasOwnProperty.call(this.modMetadata, name)) {
                const zip = new StreamZip({
                    file: path,
                    storeEntries: true
                });
                zip.on('error', err => {
                    this.logger.error(`Failure while processing ${path}`);
                    reject(err);
                });
                zip.on('ready', () => {
                    try {
                        const res = this.processZip(zip, name, path);
                        zip.close();
                        resolve(res);
                        return;
                    }
                    catch (err) {
                        zip.close();
                        reject(err);
                        return;
                    }
                });
            }
            else {
                resolve(this.modMetadata[name]);
                return;
            }
        });
    }
}
//# sourceMappingURL=Mod.struct.js.map