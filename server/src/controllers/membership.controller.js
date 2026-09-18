import crypto from "crypto";
import razorpay from "../utils/razorpay.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import { sendEmail } from "../utils/brevo.js";

const MEMBERSHIP_PLANS = {
  bronze: {
    name: "Bronze",
    amount: 99,
    durationDays: 30,
    adFree: false,
  },

  silver: {
    name: "Silver",
    amount: 199,
    durationDays: 30,
    adFree: false,
  },

  gold: {
    name: "Gold",
    amount: 399,
    durationDays: 30,
    adFree: true,
  },
};

const AD_FREE_MEMBERSHIP_PLANS = [
  "gold",
];

const PAID_MEMBERSHIP_PLANS = [
  "bronze",
  "silver",
  "gold",
];

const hasActiveAdFreeMembership = (
  membership,
) => {
  if (!membership) return false;

  if (
    !AD_FREE_MEMBERSHIP_PLANS.includes(
      membership.plan,
    )
  ) {
    return false;
  }

  if (membership.status !== "active") {
    return false;
  }

  if (
    !membership.endDate ||
    new Date(membership.endDate) <= new Date()
  ) {
    return false;
  }

  return true;
};

const isMembershipExpired = (
  membership,
) => {
  if (!membership) return false;

  return (
    PAID_MEMBERSHIP_PLANS.includes(
      membership.plan,
    ) &&
    membership.status === "active" &&
    membership.endDate &&
    new Date(membership.endDate) <= new Date()
  );
};

const expireMembershipIfNeeded = async (
  user,
) => {
  if (
    !isMembershipExpired(
      user.membership,
    )
  ) {
    return false;
  }

  user.membership = {
    plan: "free",
    status: "active",
    startDate: null,
    endDate: null,
    lastPaymentId: "",
    razorpayCustomerId:
      user.membership
        ?.razorpayCustomerId || "",
  };

  await user.save();

  return true;
};

export const createMembershipOrder = async (
  req,
  res,
) => {
  try {
    const { plan } = req.body;

    if (
      !plan ||
      !MEMBERSHIP_PLANS[plan]
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership plan",
      });
    }

    const user = await User.findById(
      req.user._id,
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await expireMembershipIfNeeded(user);

    const selectedPlan =
      MEMBERSHIP_PLANS[plan];

    const options = {
      amount:
        selectedPlan.amount * 100,
      currency: "INR",
      receipt: `binge_${user._id}_${Date.now()}`,
      notes: {
        userId: user._id.toString(),
        plan,
      },
    };

    const order =
      await razorpay.orders.create(
        options,
      );

    await Payment.create({
      user: user._id,
      plan,
      amount: selectedPlan.amount,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.status(201).json({
      success: true,
      message:
        "Membership order created successfully",
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        plan,
        planName: selectedPlan.name,
        durationDays:
          selectedPlan.durationDays,
        keyId:
          process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error(
      "Create membership order error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create membership order",
    });
  }
};

export const verifyMembershipPayment = async (
  req,
  res,
) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment verification details are required",
      });
    }

    const payment =
      await Payment.findOne({
        razorpayOrderId:
          razorpay_order_id,
        user: req.user._id,
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:
          "Payment order not found",
      });
    }

    if (payment.status === "paid") {
      return res.status(400).json({
        success: false,
        message:
          "Payment has already been verified",
      });
    }

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET,
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`,
        )
        .digest("hex");

    if (
      generatedSignature !==
      razorpay_signature
    ) {
      payment.status = "failed";

      await payment.save();

      return res.status(400).json({
        success: false,
        message:
          "Invalid payment signature",
      });
    }

    const selectedPlan =
      MEMBERSHIP_PLANS[payment.plan];

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid membership plan",
      });
    }

    const user = await User.findById(
      req.user._id,
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await expireMembershipIfNeeded(user);

    const now = new Date();

    const currentEndDate =
      user.membership?.endDate;

    const startDate =
      user.membership?.status ===
        "active" &&
      currentEndDate &&
      new Date(currentEndDate) > now
        ? new Date(currentEndDate)
        : now;

    const endDate = new Date(
      startDate,
    );

    endDate.setDate(
      endDate.getDate() +
        selectedPlan.durationDays,
    );

    user.membership = {
      plan: payment.plan,
      status: "active",
      startDate,
      endDate,
      lastPaymentId:
        razorpay_payment_id,
      razorpayCustomerId:
        user.membership
          ?.razorpayCustomerId || "",
    };

    await user.save();

    payment.razorpayPaymentId =
      razorpay_payment_id;

    payment.razorpaySignature =
      razorpay_signature;

    payment.status = "paid";
    payment.paidAt = now;

    await payment.save();

    // =====================================================
    // Email Invoice / Receipt
    // =====================================================

    const invoiceNumber =
      `BINGE-${now.getFullYear()}-${String(
        payment._id,
      ).slice(-8).toUpperCase()}`;

    const paymentDate =
      now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

    const membershipStartDate =
      startDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        },
      );

    const membershipEndDate =
      endDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        },
      );

    await sendEmail({
      to: user.email,
      name: user.name,
      subject: `Binge ${selectedPlan.name} Membership — Payment Receipt ${invoiceNumber}`,
      htmlContent: `
        <div
          style="
            margin: 0;
            padding: 30px 15px;
            background-color: #f5f5f5;
            font-family: Arial, Helvetica, sans-serif;
          "
        >
          <div
            style="
              max-width: 650px;
              margin: 0 auto;
              background-color: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              overflow: hidden;
            "
          >
            <div
              style="
                padding: 28px 30px;
                border-bottom: 1px solid #e5e7eb;
              "
            >
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
              >
                <tr>
                  <td>
                    <div
                      style="
                        font-size: 28px;
                        font-weight: 700;
                        color: #ef4444;
                      "
                    >
                      Binge
                    </div>

                    <div
                      style="
                        margin-top: 5px;
                        font-size: 13px;
                        color: #6b7280;
                      "
                    >
                      Membership Invoice
                    </div>
                  </td>

                  <td
                    align="right"
                    valign="top"
                  >
                    <div
                      style="
                        display: inline-block;
                        padding: 7px 12px;
                        background-color: #f3f4f6;
                        border-radius: 999px;
                        font-size: 12px;
                        font-weight: 700;
                        color: #111827;
                        text-transform: uppercase;
                      "
                    >
                      Paid
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <div
              style="
                padding: 25px 30px;
                border-bottom: 1px solid #e5e7eb;
              "
            >
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
              >
                <tr>
                  <td
                    valign="top"
                    width="50%"
                  >
                    <div
                      style="
                        font-size: 12px;
                        color: #6b7280;
                        margin-bottom: 6px;
                      "
                    >
                      Invoice Number
                    </div>

                    <div
                      style="
                        font-size: 14px;
                        font-weight: 600;
                        color: #111827;
                      "
                    >
                      ${invoiceNumber}
                    </div>
                  </td>

                  <td
                    valign="top"
                    width="50%"
                    align="right"
                  >
                    <div
                      style="
                        font-size: 12px;
                        color: #6b7280;
                        margin-bottom: 6px;
                      "
                    >
                      Payment Date
                    </div>

                    <div
                      style="
                        font-size: 14px;
                        font-weight: 600;
                        color: #111827;
                      "
                    >
                      ${paymentDate}
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <div
              style="
                padding: 25px 30px;
                border-bottom: 1px solid #e5e7eb;
              "
            >
              <div
                style="
                  font-size: 12px;
                  color: #6b7280;
                  margin-bottom: 8px;
                "
              >
                Billed To
              </div>

              <div
                style="
                  font-size: 16px;
                  font-weight: 600;
                  color: #111827;
                "
              >
                ${user.name}
              </div>

              <div
                style="
                  margin-top: 4px;
                  font-size: 14px;
                  color: #6b7280;
                "
              >
                ${user.email}
              </div>
            </div>

            <div style="padding: 25px 30px;">
              <div
                style="
                  font-size: 12px;
                  color: #6b7280;
                  margin-bottom: 12px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                "
              >
                Membership Details
              </div>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  border: 1px solid #e5e7eb;
                  border-radius: 10px;
                "
              >
                <tr>
                  <td
                    style="
                      padding: 15px;
                      border-bottom: 1px solid #e5e7eb;
                    "
                  >
                    <div
                      style="
                        font-size: 12px;
                        color: #6b7280;
                      "
                    >
                      Plan
                    </div>

                    <div
                      style="
                        margin-top: 4px;
                        font-size: 15px;
                        font-weight: 600;
                        color: #111827;
                      "
                    >
                      ${selectedPlan.name}
                    </div>
                  </td>

                  <td
                    align="right"
                    style="
                      padding: 15px;
                      border-bottom: 1px solid #e5e7eb;
                    "
                  >
                    <div
                      style="
                        font-size: 12px;
                        color: #6b7280;
                      "
                    >
                      Duration
                    </div>

                    <div
                      style="
                        margin-top: 4px;
                        font-size: 15px;
                        font-weight: 600;
                        color: #111827;
                      "
                    >
                      ${selectedPlan.durationDays} days
                    </div>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 15px;
                    "
                  >
                    <div
                      style="
                        font-size: 12px;
                        color: #6b7280;
                      "
                    >
                      Membership Start
                    </div>

                    <div
                      style="
                        margin-top: 4px;
                        font-size: 14px;
                        color: #111827;
                      "
                    >
                      ${membershipStartDate}
                    </div>
                  </td>

                  <td
                    align="right"
                    style="
                      padding: 15px;
                    "
                  >
                    <div
                      style="
                        font-size: 12px;
                        color: #6b7280;
                      "
                    >
                      Membership End
                    </div>

                    <div
                      style="
                        margin-top: 4px;
                        font-size: 14px;
                        color: #111827;
                      "
                    >
                      ${membershipEndDate}
                    </div>
                  </td>
                </tr>
              </table>

              <div
                style="
                  margin-top: 20px;
                  padding: 18px;
                  background-color: #f5f5f5;
                  border-radius: 10px;
                "
              >
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td
                      style="
                        font-size: 15px;
                        font-weight: 600;
                        color: #111827;
                      "
                    >
                      Total Paid
                    </td>

                    <td
                      align="right"
                      style="
                        font-size: 24px;
                        font-weight: 700;
                        color: #111827;
                      "
                    >
                      ₹${payment.amount}
                    </td>
                  </tr>
                </table>
              </div>
            </div>

            <div
              style="
                padding: 25px 30px;
                border-top: 1px solid #e5e7eb;
              "
            >
              <div
                style="
                  font-size: 12px;
                  color: #6b7280;
                  margin-bottom: 12px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                "
              >
                Transaction Details
              </div>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
              >
                <tr>
                  <td
                    style="
                      padding: 7px 0;
                      font-size: 13px;
                      color: #6b7280;
                    "
                  >
                    Payment ID
                  </td>

                  <td
                    align="right"
                    style="
                      padding: 7px 0;
                      font-size: 12px;
                      color: #111827;
                      word-break: break-all;
                    "
                  >
                    ${razorpay_payment_id}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 7px 0;
                      font-size: 13px;
                      color: #6b7280;
                    "
                  >
                    Order ID
                  </td>

                  <td
                    align="right"
                    style="
                      padding: 7px 0;
                      font-size: 12px;
                      color: #111827;
                      word-break: break-all;
                    "
                  >
                    ${razorpay_order_id}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 7px 0;
                      font-size: 13px;
                      color: #6b7280;
                    "
                  >
                    Currency
                  </td>

                  <td
                    align="right"
                    style="
                      padding: 7px 0;
                      font-size: 13px;
                      color: #111827;
                    "
                  >
                    ${payment.currency}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 7px 0;
                      font-size: 13px;
                      color: #6b7280;
                    "
                  >
                    Status
                  </td>

                  <td
                    align="right"
                    style="
                      padding: 7px 0;
                      font-size: 13px;
                      font-weight: 600;
                      color: #111827;
                      text-transform: capitalize;
                    "
                  >
                    ${payment.status}
                  </td>
                </tr>
              </table>
            </div>

            <div
              style="
                padding: 22px 30px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
                text-align: center;
              "
            >
              <p
                style="
                  margin: 0;
                  font-size: 13px;
                  color: #6b7280;
                "
              >
                Thank you for choosing Binge.
              </p>

              <p
                style="
                  margin: 7px 0 0;
                  font-size: 12px;
                  color: #9ca3af;
                "
              >
                This email serves as your membership
                payment receipt.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message:
        "Membership activated successfully",
      data: {
        plan: payment.plan,
        startDate,
        endDate,
        paymentId:
          razorpay_payment_id,
        orderId:
          razorpay_order_id,
        invoiceNumber,
      },
    });
  } catch (error) {
    console.error(
      "Verify membership payment error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to verify payment",
    });
  }
};

export const getMembershipPlans = async (
  req,
  res,
) => {
  try {
    return res.status(200).json({
      success: true,
      data: [
        {
          id: "free",
          name: "Free",
          amount: 0,
          currency: "INR",
          durationDays: null,
          features: {
            premiumVideos: 0,
            maxWatchMinutes: 60,
            downloads: 1,
            adFree: false,
          },
        },
        {
          id: "bronze",
          name: "Bronze",
          amount: 99,
          currency: "INR",
          durationDays: 30,
          features: {
            premiumVideos: 10,
            maxWatchMinutes: 180,
            downloads: 5,
            adFree: false,
          },
        },
        {
          id: "silver",
          name: "Silver",
          amount: 199,
          currency: "INR",
          durationDays: 30,
          features: {
            premiumVideos: "Unlimited",
            maxWatchMinutes: "Unlimited",
            downloads: "Unlimited",
            adFree: false,
          },
        },
        {
          id: "gold",
          name: "Gold",
          amount: 399,
          currency: "INR",
          durationDays: 30,
          features: {
            premiumVideos: "Unlimited",
            maxWatchMinutes: "Unlimited",
            downloads: "Unlimited",
            adFree: true,
          },
        },
      ],
    });
  } catch (error) {
    console.error(
      "Get membership plans error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch membership plans",
    });
  }
};

export const getMyMembership = async (
  req,
  res,
) => {
  try {
    const user =
      await User.findById(
        req.user._id,
      ).select("membership");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await expireMembershipIfNeeded(user);

    const membership =
      user.membership || {
        plan: "free",
        status: "active",
        startDate: null,
        endDate: null,
        lastPaymentId: "",
        razorpayCustomerId: "",
      };

    const adFree =
      hasActiveAdFreeMembership(
        membership,
      );

    return res.status(200).json({
      success: true,
      data: {
        plan: membership.plan,
        status: membership.status,
        startDate:
          membership.startDate,
        endDate:
          membership.endDate,
        lastPaymentId:
          membership.lastPaymentId,
        adFree,
      },
    });
  } catch (error) {
    console.error(
      "Get my membership error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch membership",
    });
  }
};

// =====================================================
// Payment History
// =====================================================

export const getMyPaymentHistory = async (
  req,
  res,
) => {
  try {
    const payments =
      await Payment.find({
        user: req.user._id,
      })
        .select(
          "plan amount currency razorpayOrderId razorpayPaymentId razorpaySignature status paidAt createdAt",
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    const paymentHistory =
      payments.map((payment) => ({
        id: payment._id,
        plan: payment.plan,
        planName:
          MEMBERSHIP_PLANS[
            payment.plan
          ]?.name || payment.plan,
        amount: payment.amount,
        currency: payment.currency,
        razorpayOrderId:
          payment.razorpayOrderId,
        razorpayPaymentId:
          payment.razorpayPaymentId || null,
        status: payment.status,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      }));

    return res.status(200).json({
      success: true,
      data: paymentHistory,
    });
  } catch (error) {
    console.error(
      "Get payment history error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch payment history",
    });
  }
};