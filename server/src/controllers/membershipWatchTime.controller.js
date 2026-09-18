import User from "../models/User.js";
import MembershipWatchTime from "../models/MembershipWatchTime.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const WATCH_TIME_LIMITS = {
  free: 60*60,
  bronze: 180 * 60,
  silver: Infinity,
  gold: Infinity,
};

const PAID_MEMBERSHIP_PLANS = [
  "bronze",
  "silver",
  "gold",
];

// Maximum amount of time that one heartbeat can
// consume. This protects against stale browser tabs,
// delayed requests, and large gaps between heartbeats.
const MAX_HEARTBEAT_SECONDS = 30;

const getActiveMembership = (user) => {
  if (!user?.membership) {
    return {
      plan: "free",
      status: "active",
      startDate: null,
      endDate: null,
    };
  }

  const {
    plan,
    status,
    startDate,
    endDate,
  } = user.membership;

  if (
    PAID_MEMBERSHIP_PLANS.includes(plan) &&
    status === "active" &&
    endDate &&
    new Date(endDate) > new Date()
  ) {
    return {
      plan,
      status,
      startDate,
      endDate,
    };
  }

  return {
    plan: "free",
    status: "active",
    startDate: null,
    endDate: null,
  };
};

const getWatchTimeRecord = async (
  userId,
  membership,
) => {
  const membershipStart =
    membership.startDate
      ? new Date(membership.startDate)
      : null;

  const membershipEnd =
    membership.endDate
      ? new Date(membership.endDate)
      : null;

  let watchTime =
    await MembershipWatchTime.findOne({
      user: userId,
    });

  /*
   * Paid membership periods are identified by
   * membership.startDate.
   *
   * If the user has started a new membership,
   * reset the previous period's usage.
   */
  if (
    watchTime &&
    membershipStart &&
    watchTime.periodStart &&
    new Date(
      watchTime.periodStart,
    ).getTime() !==
      membershipStart.getTime()
  ) {
    watchTime.watchedSeconds = 0;
    watchTime.periodStart = membershipStart;
    watchTime.periodEnd = membershipEnd;
    watchTime.activeSession = false;
    watchTime.sessionStartedAt = null;
    watchTime.lastHeartbeatAt = null;

    await watchTime.save();
  }

  if (!watchTime) {
    watchTime =
      await MembershipWatchTime.create({
        user: userId,
        watchedSeconds: 0,
        periodStart: membershipStart,
        periodEnd: membershipEnd,
        activeSession: false,
        sessionStartedAt: null,
        lastHeartbeatAt: null,
      });
  }

  return watchTime;
};

const buildUsageResponse = (
  membership,
  watchTime,
) => {
  const limit =
    WATCH_TIME_LIMITS[membership.plan];

  const watchedSeconds =
    watchTime?.watchedSeconds || 0;

  const unlimited = limit === Infinity;

  const remainingSeconds = unlimited
    ? null
    : Math.max(
        0,
        limit - watchedSeconds,
      );

  return {
    plan: membership.plan,
    watchedSeconds,
    limitSeconds: unlimited
      ? null
      : limit,
    remainingSeconds,
    unlimited,
    limitReached:
      !unlimited &&
      watchedSeconds >= limit,
    activeSession:
      watchTime?.activeSession || false,
  };
};

/*
 * GET /api/membership/watch-time
 */
export const getWatchTimeUsage =
  asyncHandler(
    async (req, res, next) => {
      const user =
        await User.findById(
          req.user._id,
        ).select("membership");

      if (!user) {
        return next(
          new ApiError(
            404,
            "User not found",
          ),
        );
      }

      const membership =
        getActiveMembership(user);

      const watchTime =
        await getWatchTimeRecord(
          user._id,
          membership,
        );

      const data = buildUsageResponse(
        membership,
        watchTime,
      );

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            ...data,
            periodStart:
              watchTime.periodStart,
            periodEnd:
              watchTime.periodEnd,
          },
          "Watch-time usage fetched successfully",
        ),
      );
    },
  );

/*
 * POST /api/membership/watch-time/start
 *
 * Starts a server-tracked watch session.
 */
export const startWatchSession =
  asyncHandler(
    async (req, res, next) => {
      const user =
        await User.findById(
          req.user._id,
        ).select("membership");

      if (!user) {
        return next(
          new ApiError(
            404,
            "User not found",
          ),
        );
      }

      const membership =
        getActiveMembership(user);

      const watchTime =
        await getWatchTimeRecord(
          user._id,
          membership,
        );

      const limit =
        WATCH_TIME_LIMITS[membership.plan];

      /*
       * Unlimited memberships don't need
       * watch-time accounting.
       */
      if (limit === Infinity) {
        watchTime.activeSession = false;
        watchTime.sessionStartedAt = null;
        watchTime.lastHeartbeatAt = null;

        await watchTime.save();

        return res.status(200).json(
          new ApiResponse(
            200,
            buildUsageResponse(
              membership,
              watchTime,
            ),
            "Unlimited watch time",
          ),
        );
      }

      if (watchTime.watchedSeconds >= limit) {
        return res.status(403).json(
          new ApiResponse(
            403,
            buildUsageResponse(
              membership,
              watchTime,
            ),
            "Your watch-time limit has been reached",
          ),
        );
      }

      const now = new Date();

      /*
       * Starting a new session replaces any
       * stale session.
       */
      watchTime.activeSession = true;
      watchTime.sessionStartedAt = now;
      watchTime.lastHeartbeatAt = now;

      await watchTime.save();

      return res.status(200).json(
        new ApiResponse(
          200,
          buildUsageResponse(
            membership,
            watchTime,
          ),
          "Watch session started",
        ),
      );
    },
  );

/*
 * POST /api/membership/watch-time/heartbeat
 *
 * The client does NOT submit seconds.
 *
 * The server calculates:
 *
 *   current server time
 *   -
 *   previous heartbeat time
 *
 * and consumes that elapsed time.
 */
export const heartbeatWatchSession =
  asyncHandler(
    async (req, res, next) => {
      const user =
        await User.findById(
          req.user._id,
        ).select("membership");

      if (!user) {
        return next(
          new ApiError(
            404,
            "User not found",
          ),
        );
      }

      const membership =
        getActiveMembership(user);

      const limit =
        WATCH_TIME_LIMITS[membership.plan];

      const watchTime =
        await getWatchTimeRecord(
          user._id,
          membership,
        );

      /*
       * Silver and Gold have unlimited
       * watch time.
       */
      if (limit === Infinity) {
        return res.status(200).json(
          new ApiResponse(
            200,
            buildUsageResponse(
              membership,
              watchTime,
            ),
            "Unlimited watch time",
          ),
        );
      }

      if (
        !watchTime.activeSession ||
        !watchTime.lastHeartbeatAt
      ) {
        return next(
          new ApiError(
            400,
            "No active watch session",
          ),
        );
      }

      const now = new Date();

      const lastHeartbeat =
        new Date(
          watchTime.lastHeartbeatAt,
        );

      let elapsedSeconds =
        (now.getTime() -
          lastHeartbeat.getTime()) /
        1000;

      /*
       * Protect against:
       *
       * - browser suspension
       * - background tabs
       * - network delays
       * - stale sessions
       *
       * Never consume more than the
       * maximum heartbeat interval.
       */
      elapsedSeconds = Math.max(
        0,
        Math.min(
          elapsedSeconds,
          MAX_HEARTBEAT_SECONDS,
        ),
      );

      /*
       * Always update the server timestamp,
       * even if elapsed time is zero.
       */
      watchTime.lastHeartbeatAt = now;

      if (elapsedSeconds > 0) {
        const remainingBefore =
          Math.max(
            0,
            limit -
              watchTime.watchedSeconds,
          );

        const consumedSeconds =
          Math.min(
            elapsedSeconds,
            remainingBefore,
          );

        watchTime.watchedSeconds +=
          consumedSeconds;
      }

      const remainingSeconds =
        Math.max(
          0,
          limit -
            watchTime.watchedSeconds,
        );

      /*
       * Automatically close the session
       * once the limit is reached.
       */
      if (
        watchTime.watchedSeconds >=
        limit
      ) {
        watchTime.activeSession = false;
        watchTime.sessionStartedAt = null;
        watchTime.lastHeartbeatAt = null;
      }

      await watchTime.save();

      const data = buildUsageResponse(
        membership,
        watchTime,
      );

      return res.status(
        data.limitReached ? 403 : 200,
      ).json(
        new ApiResponse(
          data.limitReached
            ? 403
            : 200,
          data,
          data.limitReached
            ? "Watch-time limit reached"
            : "Watch time updated",
        ),
      );
    },
  );

/*
 * POST /api/membership/watch-time/stop
 *
 * Stops the current watch session and
 * consumes the elapsed time since the
 * last heartbeat.
 */
export const stopWatchSession =
  asyncHandler(
    async (req, res, next) => {
      const user =
        await User.findById(
          req.user._id,
        ).select("membership");

      if (!user) {
        return next(
          new ApiError(
            404,
            "User not found",
          ),
        );
      }

      const membership =
        getActiveMembership(user);

      const limit =
        WATCH_TIME_LIMITS[membership.plan];

      const watchTime =
        await getWatchTimeRecord(
          user._id,
          membership,
        );

      /*
       * Nothing to stop.
       */
      if (
        !watchTime.activeSession ||
        !watchTime.lastHeartbeatAt
      ) {
        return res.status(200).json(
          new ApiResponse(
            200,
            buildUsageResponse(
              membership,
              watchTime,
            ),
            "No active watch session",
          ),
        );
      }

      /*
       * Unlimited plans don't need to
       * calculate watch time.
       */
      if (limit === Infinity) {
        watchTime.activeSession = false;
        watchTime.sessionStartedAt = null;
        watchTime.lastHeartbeatAt = null;

        await watchTime.save();

        return res.status(200).json(
          new ApiResponse(
            200,
            buildUsageResponse(
              membership,
              watchTime,
            ),
            "Watch session stopped",
          ),
        );
      }

      const now = new Date();

      const lastHeartbeat =
        new Date(
          watchTime.lastHeartbeatAt,
        );

      let elapsedSeconds =
        (now.getTime() -
          lastHeartbeat.getTime()) /
        1000;

      elapsedSeconds = Math.max(
        0,
        Math.min(
          elapsedSeconds,
          MAX_HEARTBEAT_SECONDS,
        ),
      );

      const remainingBefore =
        Math.max(
          0,
          limit -
            watchTime.watchedSeconds,
        );

      const consumedSeconds =
        Math.min(
          elapsedSeconds,
          remainingBefore,
        );

      watchTime.watchedSeconds +=
        consumedSeconds;

      watchTime.activeSession = false;
      watchTime.sessionStartedAt = null;
      watchTime.lastHeartbeatAt = null;

      await watchTime.save();

      return res.status(200).json(
        new ApiResponse(
          200,
          buildUsageResponse(
            membership,
            watchTime,
          ),
          "Watch session stopped",
        ),
      );
    },
  );