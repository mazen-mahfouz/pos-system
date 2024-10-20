import { useCookies } from "cookie-universal-nuxt";

export default function useCookiesHandler() {
    const cookies = useCookies();

    // Method to set a cookie
    const setCookie = (name, value, options = {}) => {
        cookies.set(name, value, options);
    };

    // Method to get a cookie
    const getCookie = (name) => {
        return cookies.get(name);
    };

    // Method to remove a cookie
    const removeCookie = (name) => {
        cookies.remove(name);
    };

    return {
        setCookie,
        getCookie,
        removeCookie,
    };
}
