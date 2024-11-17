export default async function useApiHandler(apiBase, method, payload) {
    const runtimeConfig = useRuntimeConfig();
    const headers = { Accept: "application/json", "Access-Control-Allow-Origin": "*"};

    const userData = useCookie("PosUserToken");

    if (userData) {
        headers["Authorization"] = `Bearer ${userData.value}`;
    }

    const form_data = new FormData();
    let form_obj = {};

    if (payload) {
        if (payload.type === "object") {
            for (const [key, value] of Object.entries(payload.data)) {
                if (value !== null && value !== undefined && value !== "") {
                    form_obj[key] = value;
                }
            }
        } else {
            for (const [key, value] of Object.entries(payload.data)) {
                if (value !== null && value !== undefined && value !== "") {
                    form_data.append(key, value);
                }
            }
        }
    }

    const response = await $fetch(`${runtimeConfig.public.apiBase}/${apiBase}`, {
        method: method,
        body: method === "GET" || !payload ? null : payload.type === "object" ? form_obj : form_data,
        headers: headers,
        ignoreHTTPSErrors: true,
        https: {
            rejectUnauthorized: false
        }
    });

    return response;
}
