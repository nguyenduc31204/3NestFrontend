export const BASE_URL = "https://a824-42-113-156-214.ngrok-free.app"



export const API_PATHS = {
    AUTH: {
        LOGIN: "/users/login",
        LOGOUT: "/auth/logout",
    },
    USER: {
        // PROFILE: "/user/profile",
        // UPDATE_PROFILE: "/user/update-profile",
    },
    PRODUCTS: {
        CREATE: "/products/create-product",
        GET_ALL: "/types/",
        GET_BY_ID: (id) => `/posts/${id}`,
        UPDATE: (id) => `/posts/${id}/update`,
        DELETE: (id) => `/posts/${id}/delete`,
    },
};
