const API_URL = `${process.env.EXPO_BACKEND_URL}/auth`;

async function request(path: string, body: any) {
    const res = await fetch(API_URL + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return { ok: res.ok, data };
}

export function loginRequest(email: string, password: string) {
    return request("/login", { email, password });
}

export function registerRequest(values: any) {
    return request("/register", values);
}
