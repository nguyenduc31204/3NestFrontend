//export const BASE_URL = "https://4b16-2401-d800-253-7e68-d94d-65a1-2343-fc22.ngrok-free.app"
export const BASE_URL = "http://localhost:8000"
//export const BASE_URL = "http://13.239.64.100:8000"

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