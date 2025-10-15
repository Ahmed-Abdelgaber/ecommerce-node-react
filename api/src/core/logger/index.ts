import pino from "pino";
export const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });
export function withReqId(reqId?: string) {
return logger.child(reqId ? { reqId } : {});
}