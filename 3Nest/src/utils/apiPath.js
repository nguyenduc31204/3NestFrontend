
//export const BASE_URL = "https://3nestinvest.ddns.net"
export const BASE_URL = "https://6e68-2401-d800-1d6-d1-f1b2-1bbb-7f26-f6ed.ngrok-free.app"
export const API_PATHS = {
    AUTH: {
        LOGIN: "/users/login",
        LOGOUT: "/auth/logout",
    },
    USER: {
        PROFILE: "/user/profile",
        UPDATE_PROFILE: "/user/update-profile",
    },
    PRODUCTS: {
        CREATE: "/products/create-product",
        GET_ALL: "/types/",
        GET_BY_ID: (id) => `/posts/${id}`,
        UPDATE: (id) => `/posts/${id}/update`,
        DELETE: (id) => `/posts/${id}/delete`,
    },
};
