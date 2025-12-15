// src/lib/zarinpal.ts

const MERCHANT_ID =
  process.env.ZARINPAL_MERCHANT_ID || "00000000-0000-0000-0000-000000000000";
const IS_SANDBOX = process.env.NODE_ENV === "development";

const BASE_URL = IS_SANDBOX
  ? "https://sandbox.zarinpal.com/pg/v4/payment"
  : "https://api.zarinpal.com/pg/v4/payment";

export async function requestPayment(
  amount: number,
  description: string,
  callbackUrl: string,
  mobile?: string
) {
  try {
    const response = await fetch(`${BASE_URL}/request.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount, // مبلغ به تومان
        description,
        callback_url: callbackUrl,
        metadata: { mobile },
      }),
      cache: "no-store",
    });

    const data = await response.json();

    if (data.data && data.data.code === 100) {
      return {
        success: true,
        authority: data.data.authority,
        url: IS_SANDBOX
          ? `https://sandbox.zarinpal.com/pg/StartPay/${data.data.authority}`
          : `https://www.zarinpal.com/pg/StartPay/${data.data.authority}`,
      };
    } else {
      return { success: false, error: JSON.stringify(data.errors) };
    }
  } catch (error) {
    return { success: false, error: "خطا در ارتباط با زرین‌پال" };
  }
}

export async function verifyPayment(amount: number, authority: string) {
  try {
    const response = await fetch(`${BASE_URL}/verify.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount,
        authority,
      }),
      cache: "no-store",
    });

    const data = await response.json();

    // کد ۱۰۰: موفق | کد ۱۰۱: قبلاً وریفای شده (موفق)
    if (data.data && (data.data.code === 100 || data.data.code === 101)) {
      return {
        success: true,
        refId: data.data.ref_id,
      };
    } else {
      return { success: false, code: data.data?.code };
    }
  } catch (error) {
    return { success: false, error: "خطا در تایید تراکنش" };
  }
}
