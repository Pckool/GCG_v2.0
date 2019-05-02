let axios = require('axios');
let OAuth2 = require('oauth20');
let credentialsStreamLabs = Symbol('credentialsStreamLabs');
let urlsStreamLabs = Symbol('urlsStreamLabs');
let getStreamLabs = Symbol('getStreamLabs');
let postStreamLabs = Symbol('postStreamLabs');

class StreamLabs extends OAuth2 {

	constructor(clientId, clientSecret, redirectUrl, scopes, socketToken='', accessToken='') {
		super(clientId, clientSecret, redirectUrl, scopes, accessToken,
			'https://www.streamlabs.com/api/v1.0/');

		this[credentialsStreamLabs] = {
			socketToken: socketToken
		};

		this[urlsStreamLabs] = {
			socketToken: 'socket/token',
			donations: 'donations',
			alerts: 'alerts',
            points: 'points',
            pointsSubtract: 'points/subtract'
		};

		this.axiosStreamLabs = axios.create({
		  baseURL: 'https://www.streamlabs.com/api/v1.0/'
		});
	}

	getCredentials() {
		let credentials = super.getCredentials();
		credentials.socketToken = this[credentialsStreamLabs].socketToken;

		return credentials;
	}

	getDonations(limit) {
		let url = this[urlsStreamLabs].donations;
		let params = {
			access_token: this.getCredentials().accessToken,
			limit: limit,
			currency: 'USD',
			verified: false
		};

		return this[getStreamLabs](url, params);
	}

	addDonation(donation) {
		let url = this[urlsStreamLabs].donations;
		donation.access_token = this.getCredentials().accessToken;

		return this[postStreamLabs](url, donation);
	}

    getPoints(username, channel){
        let url = this[urlsStreamLabs].points;
        let params = {
			access_token: this.getCredentials().accessToken,
			username: username,
			channel: channel
		};
        return this[getStreamLabs](url, params);
    }
    subtractPoints(username, channel, points){
        let url = this[urlsStreamLabs].pointsSubtract;
        let params = {
			access_token: this.getCredentials().accessToken,
			username: username,
			channel: channel,
            points: points
		};
        return this[getStreamLabs](url, params);
    }

	connectWebSocket() {
		let url = this[urlsStreamLabs].socketToken;
		let params = {
		 access_token: this.getCredentials().accessToken
		};

		return this[getStreamLabs](url, params).then((result) => {
			this[credentialsStreamLabs].socketToken = result.data.socket_token;
			return result;
		});
	}

	[getStreamLabs](url, params) {
		return this.axiosStreamLabs({
		    method: 'GET',
		    url: url,
		    params: params
		});
	}

	[postStreamLabs](url, data) {
		return this.axiosStreamLabs({
		    method: 'POST',
		    url: url,
		    data: data
		});
	}
}

module.exports = StreamLabs;
