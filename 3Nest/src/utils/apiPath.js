export const BASE_URL = "https://4772-2401-d800-23b-db9a-ad14-a452-dc17-ff83.ngrok-free.app"

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