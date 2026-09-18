"use client";

import { useEffect, useState } from "react";
import {
  getMembershipPlans,
  getMyMembership,
  createMembershipOrder,
  verifyMembershipPayment,
  getMyPaymentHistory,
} from "@/services/membership.service";

interface MembershipPlan {
  id: "free" | "bronze" | "silver" | "gold";
  name: string;
  amount: number;
  currency: string;
  durationDays: number | null;
  features: {
    premiumVideos: number | string;
    maxWatchMinutes: number | string;
    downloads: boolean | number;
    adFree: boolean;
  };
}

interface Membership {
  plan: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  lastPaymentId: string;
}

interface PaymentHistory {
  id: string;
  plan: string;
  planName: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  status: "created" | "paid" | "failed";
  paidAt: string | null;
  createdAt: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (
      options: RazorpayOptions,
    ) => RazorpayInstance;
  }
}

const PLAN_RANK = {
  free: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
} as const;

export default function MembershipPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [membership, setMembership] =
    useState<Membership | null>(null);

  const [paymentHistory, setPaymentHistory] =
    useState<PaymentHistory[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingPayments, setLoadingPayments] =
    useState(true);

  const [processingPlan, setProcessingPlan] = useState<
    string | null
  >(null);

  const [selectedPayment, setSelectedPayment] =
    useState<PaymentHistory | null>(null);

  const loadMembershipData = async () => {
    try {
      const [
        plansResponse,
        membershipResponse,
        paymentHistoryResponse,
      ] = await Promise.all([
        getMembershipPlans(),
        getMyMembership(),
        getMyPaymentHistory(),
      ]);

      setPlans(plansResponse.data || []);
      setMembership(
        membershipResponse.data || null,
      );
      setPaymentHistory(
        paymentHistoryResponse.data || [],
      );
    } catch (error) {
      console.error(
        "Failed to load membership data:",
        error,
      );
    } finally {
      setLoading(false);
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    loadMembershipData();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );

      if (existingScript) {
        existingScript.addEventListener("load", () =>
          resolve(true),
        );
        existingScript.addEventListener("error", () =>
          resolve(false),
        );
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (
    plan: MembershipPlan,
  ) => {
    try {
      setProcessingPlan(plan.id);

      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          "Unable to load Razorpay Checkout",
        );
      }

      const orderResponse =
        await createMembershipOrder(plan.id);

      const order = orderResponse.data;

      if (!order?.orderId || !order?.keyId) {
        throw new Error(
          "Invalid Razorpay order response",
        );
      }

      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Binge",
        description: `${plan.name} Membership`,
        order_id: order.orderId,

        handler: async (response) => {
          try {
            const verificationResponse =
              await verifyMembershipPayment({
                razorpay_order_id:
                  response.razorpay_order_id,
                razorpay_payment_id:
                  response.razorpay_payment_id,
                razorpay_signature:
                  response.razorpay_signature,
              });

            if (verificationResponse.success) {
              await loadMembershipData();

              window.dispatchEvent(
                new Event("membership-updated"),
              );

              alert(
                `${plan.name} membership activated successfully!`,
              );
            }
          } catch (error) {
            console.error(
              "Payment verification failed:",
              error,
            );

            alert(
              "Payment was received, but verification failed. Please contact support.",
            );
          } finally {
            setProcessingPlan(null);
          }
        },

        theme: {
          color: "#ef4444",
        },

        modal: {
          ondismiss: () => {
            setProcessingPlan(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error(
        "Membership upgrade error:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to start payment",
      );

      setProcessingPlan(null);
    }
  };

  const formatDate = (
    date: string | null,
  ) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  const formatDateTime = (
    date: string | null,
  ) => {
    if (!date) return "—";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  const getStatusClass = (
    status: PaymentHistory["status"],
  ) => {
    if (status === "paid") {
      return "bg-muted text-foreground";
    }

    if (status === "failed") {
      return "bg-muted text-muted-foreground";
    }

    return "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Loading membership plans...
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Membership
          </h1>

          <p className="mt-2 text-muted-foreground">
            Upgrade your Binge experience with premium
            benefits.
          </p>

          {membership && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm">
              <span className="text-muted-foreground">
                Current plan:
              </span>

              <span className="font-semibold capitalize text-foreground">
                {membership.plan}
              </span>

              <span className="text-muted-foreground">
                •
              </span>

              <span className="capitalize text-muted-foreground">
                {membership.status}
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const currentPlan =
              membership?.plan &&
              membership.plan in PLAN_RANK
                ? (membership.plan as keyof typeof PLAN_RANK)
                : "free";

            const planRank = PLAN_RANK[plan.id];
            const currentPlanRank =
              PLAN_RANK[currentPlan];

            const isCurrentPlan =
              membership?.plan === plan.id &&
              membership?.status === "active";

            const isLowerOrEqualPlan =
              planRank <= currentPlanRank;

            const isProcessing =
              processingPlan === plan.id;

            const isDisabled =
              isCurrentPlan ||
              plan.id === "free" ||
              isLowerOrEqualPlan ||
              isProcessing ||
              processingPlan !== null;

            const hasPremiumVideos =
              plan.features.premiumVideos ===
                "Unlimited" ||
              Number(plan.features.premiumVideos) > 0;

            const hasWatchTime =
              plan.features.maxWatchMinutes ===
                "Unlimited" ||
              Number(plan.features.maxWatchMinutes) > 0;

            /*
             * Download limits shown on the membership cards:
             * Free   -> 1 per day
             * Bronze -> 5 per day
             * Silver -> Unlimited
             * Gold   -> Unlimited
             */
            const downloadLabel =
              plan.id === "free"
                ? "1 download per day"
                : plan.id === "bronze"
                  ? "5 downloads per day"
                  : "Unlimited downloads";

            const hasDownloads =
              plan.id !== "free";

            /*
             * Ad-free status:
             * Free   -> Ads
             * Bronze -> Ads
             * Silver -> Ad-free
             * Gold   -> Ad-free
             */
            const adFree = plan.id === "gold";

            const features = [
              {
                available: hasPremiumVideos,
                label:
                  plan.features.premiumVideos ===
                  "Unlimited"
                    ? "Unlimited premium videos"
                    : `${plan.features.premiumVideos} premium videos`,
              },
              {
                available: hasWatchTime,
                label:
                  plan.features.maxWatchMinutes ===
                  "Unlimited"
                    ? "Unlimited watch time"
                    : `${plan.features.maxWatchMinutes} minutes watch time`,
              },
              {
                available: hasDownloads,
                label: downloadLabel,
              },
              {
                available: adFree,
                label: "Ad-free viewing",
              },
            ].sort(
              (a, b) =>
                Number(b.available) -
                Number(a.available),
            );

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl border p-6 shadow-sm ${
                  isCurrentPlan
                    ? "border-red-500 bg-background"
                    : "border-border bg-background"
                }`}
              >
                {isCurrentPlan && (
                  <span className="absolute right-5 top-5 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                    Current
                  </span>
                )}

                <h2 className="text-xl font-bold capitalize text-foreground">
                  {plan.name}
                </h2>

                <div className="mt-5">
                  <span className="text-4xl font-bold text-foreground">
                    ₹{plan.amount}
                  </span>

                  {plan.durationDays && (
                    <span className="ml-1 text-sm text-muted-foreground">
                      / {plan.durationDays} days
                    </span>
                  )}
                </div>

                <div className="my-6 h-px bg-border" />

                <ul className="space-y-4 text-sm">
                  {features.map((feature) => (
                    <li
                      key={feature.label}
                      className="flex items-start gap-2"
                    >
                      <span
                        className={
                          feature.available
                            ? "text-red-500"
                            : "text-muted-foreground"
                        }
                      >
                        {feature.available
                          ? "✓"
                          : "×"}
                      </span>

                      <span className="text-foreground">
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() =>
                      handleUpgrade(plan)
                    }
                    className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isDisabled
                        ? "cursor-not-allowed bg-muted text-muted-foreground"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    {isProcessing
                      ? "Processing..."
                      : isCurrentPlan
                        ? "Current Plan"
                        : plan.id === "free"
                          ? "Free Plan"
                          : isLowerOrEqualPlan
                            ? "Not Available"
                            : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* =====================================================
            Payment History
        ===================================================== */}

        <section className="mt-12">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-foreground">
              Payment History
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              View your Binge membership transactions.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            {loadingPayments ? (
              <div className="flex min-h-[180px] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Loading payment history...
                </p>
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="flex min-h-[180px] items-center justify-center px-6 text-center">
                <div>
                  <p className="font-medium text-foreground">
                    No payments yet
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Your membership transactions will
                    appear here.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-muted">
                      <tr>
                        <th className="px-5 py-4 font-semibold text-foreground">
                          Plan
                        </th>

                        <th className="px-5 py-4 font-semibold text-foreground">
                          Amount
                        </th>

                        <th className="px-5 py-4 font-semibold text-foreground">
                          Status
                        </th>

                        <th className="px-5 py-4 font-semibold text-foreground">
                          Payment ID
                        </th>

                        <th className="px-5 py-4 font-semibold text-foreground">
                          Date
                        </th>

                        <th className="px-5 py-4 text-right font-semibold text-foreground">
                          Receipt
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paymentHistory.map(
                        (payment) => (
                          <tr
                            key={payment.id}
                            className="border-b border-border last:border-b-0"
                          >
                            <td className="px-5 py-4">
                              <div className="font-semibold text-foreground">
                                {payment.planName}
                              </div>

                              <div className="mt-1 text-xs uppercase text-muted-foreground">
                                {payment.plan}
                              </div>
                            </td>

                            <td className="px-5 py-4 font-medium text-foreground">
                              {payment.currency ===
                              "INR"
                                ? "₹"
                                : payment.currency}{" "}
                              {payment.amount}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                                  payment.status,
                                )}`}
                              >
                                {payment.status}
                              </span>
                            </td>

                            <td className="max-w-[220px] px-5 py-4">
                              <span
                                className="block truncate font-mono text-xs text-muted-foreground"
                                title={
                                  payment.razorpayPaymentId ||
                                  payment.razorpayOrderId
                                }
                              >
                                {payment.razorpayPaymentId ||
                                  payment.razorpayOrderId}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                              {formatDate(
                                payment.paidAt ||
                                  payment.createdAt,
                              )}
                            </td>

                            <td className="px-5 py-4 text-right">
                              {payment.status ===
                                "paid" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedPayment(
                                      payment,
                                    )
                                  }
                                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
                                >
                                  View Receipt
                                </button>
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="divide-y divide-border md:hidden">
                  {paymentHistory.map(
                    (payment) => (
                      <div
                        key={payment.id}
                        className="p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {payment.planName}
                            </h3>

                            <p className="mt-1 text-xs uppercase text-muted-foreground">
                              {payment.plan}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                              payment.status,
                            )}`}
                          >
                            {payment.status}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Amount
                            </p>

                            <p className="mt-1 font-medium text-foreground">
                              {payment.currency ===
                              "INR"
                                ? "₹"
                                : payment.currency}{" "}
                              {payment.amount}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Date
                            </p>

                            <p className="mt-1 text-foreground">
                              {formatDate(
                                payment.paidAt ||
                                  payment.createdAt,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs text-muted-foreground">
                            Payment ID
                          </p>

                          <p
                            className="mt-1 truncate font-mono text-xs text-foreground"
                            title={
                              payment.razorpayPaymentId ||
                              payment.razorpayOrderId
                            }
                          >
                            {payment.razorpayPaymentId ||
                              payment.razorpayOrderId}
                          </p>
                        </div>

                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground">
                            Order ID
                          </p>

                          <p
                            className="mt-1 truncate font-mono text-xs text-muted-foreground"
                            title={
                              payment.razorpayOrderId
                            }
                          >
                            {payment.razorpayOrderId}
                          </p>
                        </div>

                        {payment.status ===
                          "paid" && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPayment(
                                payment,
                              )
                            }
                            className="mt-4 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
                          >
                            View Receipt
                          </button>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* =====================================================
          Invoice / Receipt Modal
      ===================================================== */}

      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() =>
            setSelectedPayment(null)
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Receipt Header */}
            <div className="flex items-start justify-between border-b border-border p-6">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  Binge
                </p>

                <h2
                  id="receipt-title"
                  className="mt-1 text-xl font-bold text-foreground"
                >
                  Payment Receipt
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Transaction successfully completed
                </p>
              </div>

              <button
                type="button"
                aria-label="Close receipt"
                onClick={() =>
                  setSelectedPayment(null)
                }
                className="rounded-lg p-2 text-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                ×
              </button>
            </div>

            {/* Payment Status */}
            <div className="border-b border-border px-6 py-5">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted p-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Payment Status
                  </p>

                  <p className="mt-1 font-semibold capitalize text-foreground">
                    {selectedPayment.status}
                  </p>
                </div>

                <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold capitalize text-foreground">
                  {selectedPayment.status}
                </span>
              </div>
            </div>

            {/* Receipt Details */}
            <div className="space-y-6 p-6">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Membership Details
                </h3>

                <div className="rounded-xl border border-border">
                  <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-4">
                    <span className="text-sm text-muted-foreground">
                      Plan
                    </span>

                    <span className="font-semibold text-foreground">
                      {selectedPayment.planName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 px-4 py-4">
                    <span className="text-sm text-muted-foreground">
                      Duration
                    </span>

                    <span className="text-sm text-foreground">
                      30 days
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Payment Details
                </h3>

                <div className="rounded-xl border border-border">
                  <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4">
                    <span className="text-sm text-muted-foreground">
                      Amount
                    </span>

                    <span className="font-semibold text-foreground">
                      {selectedPayment.currency ===
                      "INR"
                        ? "₹"
                        : selectedPayment.currency}{" "}
                      {selectedPayment.amount}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4">
                    <span className="text-sm text-muted-foreground">
                      Payment ID
                    </span>

                    <span className="max-w-[60%] break-all text-right font-mono text-xs text-foreground">
                      {selectedPayment.razorpayPaymentId ||
                        "—"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4">
                    <span className="text-sm text-muted-foreground">
                      Order ID
                    </span>

                    <span className="max-w-[60%] break-all text-right font-mono text-xs text-foreground">
                      {selectedPayment.razorpayOrderId}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 px-4 py-4">
                    <span className="text-sm text-muted-foreground">
                      Payment Date
                    </span>

                    <span className="text-right text-sm text-foreground">
                      {formatDateTime(
                        selectedPayment.paidAt ||
                          selectedPayment.createdAt,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="rounded-xl bg-muted p-5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">
                    Total Paid
                  </span>

                  <span className="text-2xl font-bold text-foreground">
                    {selectedPayment.currency ===
                    "INR"
                      ? "₹"
                      : selectedPayment.currency}{" "}
                    {selectedPayment.amount}
                  </span>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                This receipt confirms your Binge membership
                payment.
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-border p-6">
              <button
                type="button"
                onClick={() =>
                  setSelectedPayment(null)
                }
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}