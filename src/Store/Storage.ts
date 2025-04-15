export class StorageCommon {
    static SetItem(key: string, value: any) {
        console.log(key, value);
        if (!value) {
            localStorage.removeItem(key);
        } else {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.warn('StorageCommon.SetItem', key, value, error);
                return false;
            }
        }
        return true;
    }

    static GetItem(key: string) {
        try {
            const value = localStorage.getItem(key);
            if (value) {
                return JSON.parse(localStorage.getItem(key));
            }
        } catch (error) {
            console.warn('StorageCommon.GetItem', key, error);
        }
        return null;
    }
}