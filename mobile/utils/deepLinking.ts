import * as Linking from "expo-linking";

export const createResetPasswordUrl = (token: string): string => {
    const resetUrl = Linking.createURL("reset-password", {
        queryParams: { token },
    });
    return resetUrl;
};

export const createVerifyNewEmailUrl = (token: string): string => {
    const verifyUrl = Linking.createURL("verify-new-email", {
        queryParams: { token },
    });
    return verifyUrl;
};
