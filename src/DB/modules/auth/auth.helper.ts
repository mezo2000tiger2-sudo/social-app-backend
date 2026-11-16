/**
 * TS port of the commented `SendEmailOtp` above — same logic, adapted to the
 * modules this project actually ships.
 *
 * Changes vs. the commented JS version (and why):
 *  1. Imports point to the real files (`DB/connectRedis.ts`, `repositories/user.repository.ts`,
 *     `common/utils/*`) and keep the `.js` specifiers required by `module: nodenext`.
 *  2. `getValues([...])` / `setValue` / `incr` came from a `redis.service` that does not exist
 *     here. `RedisService` is a default-exported instance with `getTTL`, `getValue`,
 *     `setValue`, `incr` — so the batch `getValues` call becomes three individual calls
 *     (see point 4), and the rest are called as methods on that instance.
 *  3. `dbService.findOne({ model: userModel, filter })` -> `UserRepository.findOne({ filter })`:
 *     the repository already binds `userModel` in its constructor, so no `model` key is needed.
 *  4. `Promise.all` -> `Promise.allSettled` (as requested), unwrapped inline with no helper.
 *     The difference matters: with `all` a rejected redis/db call rejects the whole batch;
 *     with `allSettled` a rejection would become `undefined` and silently pass the TTL
 *     checks, so every rejected result is re-thrown before the logic runs.
 *  5. `new Error(...)` (and `error.details = ...`) -> `AppError(message, StatusCode, details)`.
 *     Plain `Error` has no status, so every response used to come back as 500. `AppError`
 *     now takes `details` as a 3rd argument and `GlobalErrorHandling` forwards it, so the TTL
 *     arrives as a real field (`details: 42`) instead of only being embedded in the message.
 *  6. `emailTemplate({ otp })` -> `emailTemplate(Number(otp))`: the real template function
 *     takes a `number`, and `generat_otp()` returns a `string`.
 *  7. `otpMax >= 3` -> `Number(otpMax) >= 3`: `otpMax` is `any` coming from `JSON.parse`
 *     inside `getValue` and is `null` when the key is missing. `null >= 3` is a TS error;
 *     `Number(null) === 0` keeps exactly the JS behaviour (no throw when the key is absent).
 *  8. The function is typed (`email`, `isConfirmed`, `subject`) and returns `Promise<void>`.
 *  9. `getTTL` returns Redis `TTL` semantics: `-2` = key does not exist, `-1` = key exists
 *     without expiry, `>= 0` = seconds left. The branches keep the original behaviour:
 *     `-1` is a hard block, `>= 0` is a timed block, and `-2` falls through as
 *     "not blocked / no active otp" — so no extra branch was added.
 */
import RedisService from "../../connectRedis.js";
import { UserRepository } from "../../repositories/user.repository.js";
import { generat_otp, sendEmail } from "../../../common/utils/sendEmail.js";
import { Hash } from "../../../common/security/hash.js";
import { eventEmitter } from "../../../common/utils/events.js";
import { emailTemplate } from "../../../common/utils/email.template.js";
import { AppError } from "../../../common/utils/globalErrorHandling.js";

export async function SendEmailOtp({
    email,
    isConfirmed,
    subject,
}: {
    email: string;
    isConfirmed: boolean;
    subject: string;
}): Promise<void> {
    const userRepo = new UserRepository();

    const settled = await Promise.allSettled([
        RedisService.getTTL({ key: `otp::block::${email}` }),
        RedisService.getTTL({ key: `otp::${email}` }),
        RedisService.getValue({ key: `otp::max::${email}` }),
        userRepo.findOne({
            filter: {
                email,
                isConfirmed: { $exists: isConfirmed },
            },
        }),
    ]);

    const [blockedTTLResult, otpTTLResult, otpMaxResult, userResult] = settled;

    if (blockedTTLResult.status === "rejected") throw blockedTTLResult.reason;
    if (otpTTLResult.status === "rejected") throw otpTTLResult.reason;
    if (otpMaxResult.status === "rejected") throw otpMaxResult.reason;
    if (userResult.status === "rejected") throw userResult.reason;

    const isBlocked_ttl = blockedTTLResult.value; 
    const otpTTl = otpTTLResult.value; 
    const otpMax = otpMaxResult.value; 
    const user = userResult.value;

    if (isBlocked_ttl === -1) {
        throw new AppError("you are blocked", 403);
    }
    if (isBlocked_ttl >= 0) {
        throw new AppError(
            `you are blocked , you can retry after ${isBlocked_ttl}`,
            429,
            `${isBlocked_ttl}`,
        );
    }

    if (otpTTl === -1) {
        throw new AppError("an active otp has no expiration", 500);
    }
    if (otpTTl > 0) {
        throw new AppError(`you can send otp after ${otpTTl}`, 429, otpTTl);
    }

    if (Number(otpMax) >= 3) {
        await RedisService.setValue({
            key: `otp::block::${email}`,
            value: "1",
            ttl: 60 * 10,
        });
        throw new AppError("you have reached your maximum number of tries", 429);
    }

    if (!user) {
        throw new AppError("user not exist or already confirmed", 404);
    }

    const otp = generat_otp();
    const otpHash = Hash(otp);

    if (otpMax === null) {
        await RedisService.setValue({
            key: `otp::max::${email}`,
            value: 0,
            ttl: 60 * 10,
        });
    }

    await RedisService.setValue({
        key: `otp::${email}`,
        value: otpHash,
        ttl: 60 * 2,
    });

    await RedisService.incr(`otp::max::${email}`);

    eventEmitter.emit("Confirm_email", () => {
        return sendEmail({
            subject,
            to: email,
            html: emailTemplate(Number(otp)),
        });
    });
}
