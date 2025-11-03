import axios from "axios";
const WEB_URL = "https://watcher.bluegrape.app/webservices/";

export function apiLogin(params) {
    try {
        const response = axios({
            method: "post",
            url: WEB_URL + "login.php",
            data: params,
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded;charset=UTF-8",
            },
        });
        return response;
    } catch (error) {
        console.log(error);
    }
}
export function apiLogout() {
    try {
        const response = axios({
            method: "post",
            url: WEB_URL + "logout.php",
            data: {},
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded;charset=UTF-8",
            },
        });
        return response;
    } catch (error) {
        console.log(error);
    }
}
export function apiGetListService() {
	try {
		const response = axios({
			method: "get",
			url: WEB_URL + "listServicePythonDP.php",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
			},
		});
		return response;
	} catch (error) {
		console.log(error);
	}
}
export function apiGetServiceLog(params) {
	try {
		const response = axios({
			method: "post",
			url: WEB_URL + "tailServiceLog.php",
            data: params,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
			},
		});
		return response;
	} catch (error) {
		console.log(error);
	}
}

