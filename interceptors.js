export async function applyRejectHandlers(interceptor, error) {

    if (!interceptor.length) return error;

    const updated = {};

    for (const handler of interceptor) {
        const data = await handler(error);
        Object.assign(updated, data);
    }

    return updated;
}

export async function applyFulfieldHandlers(interceptor, config) {

    if (!interceptor.length) return config;

    const updated = config;

    for (const handler of interceptor) {
        const data = await handler(config);
        Object.assign(updated, data);
    }

    return updated;
}