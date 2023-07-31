import { EXPORT_FROM_LIB1 } from '@armathai/spe';

new (class {
    public constructor() {
        console.warn(EXPORT_FROM_LIB1);
    }
})();
