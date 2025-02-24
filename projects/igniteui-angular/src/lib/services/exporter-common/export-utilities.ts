
/**
 * @hidden
 */
export class ExportUtilities {
    public static getKeysFromData(data: any[]) {
        const length = data.length;
        if (length === 0) {
            return [];
        }

        const dataEntry = data[0];
        const dataEntryMiddle = data[Math.floor(length / 2)];
        const dataEntryLast = data[length - 1];

        const keys1 = Object.keys(dataEntry);
        const keys2 = Object.keys(dataEntryMiddle);
        const keys3 = Object.keys(dataEntryLast);

        const keys = new Set(keys1.concat(keys2).concat(keys3));

        return !ExportUtilities.isSpecialData(dataEntry) ? Array.from(keys) : [ 'Column 1' ];
    }

    public static saveBlobToFile(blob: Blob, fileName) {
        const a = document.createElement('a');
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
            const url = window.URL.createObjectURL(blob);
            a.download = fileName;

            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    }

    public static stringToArrayBuffer(s: string): ArrayBuffer {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) {
            /* eslint-disable  no-bitwise */
            view[i] = s.charCodeAt(i) & 0xFF;
            /* eslint-enable  no-bitwise */
        }
        return buf;
    }

    public static isSpecialData(data: any): boolean {
        return (typeof data === 'string' ||
                typeof data === 'number' ||
                data instanceof Date);
    }

    public static hasValue(value: any): boolean {
        return value !== undefined && value !== null;
    }

    public static isNullOrWhitespaces(value: string): boolean {
        return value === undefined || value === null || !value.trim();
    }
}
