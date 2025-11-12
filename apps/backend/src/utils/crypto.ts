import CryptoJS from "crypto-js";

export function encrypt(data: string, secret: string): string {
	const encryptedValue = CryptoJS.AES.encrypt(data, secret).toString();
	return encryptedValue;
}

export function decrypt(encrypted: string, secret: string): string {
	const decrypted = CryptoJS.AES.decrypt(encrypted, secret).toString(
		CryptoJS.enc.Utf8,
	);
	return decrypted;
}
