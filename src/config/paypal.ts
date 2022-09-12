const base = "https://api-m.sandbox.paypal.com";
import fetch, { Response } from 'node-fetch';

class Paypal {
  public async createOrder(price: string) {
    const accessToken = await this.generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: price,
            },
          },
        ],
      }),
    });

    return this.handleResponse(response);
  }

  public async capturePayment(orderId: string) {
    const accessToken = await this.generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return this.handleResponse(response);
  }

  private async generateAccessToken() {
    const auth = Buffer.from(process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_APP_SECRET).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "post",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const jsonData = await this.handleResponse(response);
    return jsonData.access_token;
  }

  private async handleResponse(response: Response) {
    if (response.status === 200 || response.status === 201) {
      return response.json();
    }

    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}

export default Paypal
