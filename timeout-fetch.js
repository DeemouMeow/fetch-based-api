export default async function timeoutFetch(url, options, timeout) {
    const controller = new AbortController();

    const timer = setTimeout(() => controller.abort(), timeout);

    options.signal = controller.signal;

    const response = await fetch(url, options);

    clearTimeout(timer);

    return response;
}