import { FastifyBaseLogger } from 'fastify';
import { inspect } from 'util';
import winston from 'winston';

export default function setupLogger(): FastifyBaseLogger {
  const clc = {
    bold: (text: string) => `\x1B[1m${text}\x1B[0m`,
    green: (text: string) => `\x1B[32m${text}\x1B[39m`,
    yellow: (text: string) => `\x1B[33m${text}\x1B[39m`,
    red: (text: string) => `\x1B[31m${text}\x1B[39m`,
    magentaBright: (text: string) => `\x1B[95m${text}\x1B[39m`,
    cyanBright: (text: string) => `\x1B[96m${text}\x1B[39m`,
    white: (text: string) => `\x1B[97m${text}\x1B[39m`,
  };
  const reqTransform = winston.format((info) => {
    if (typeof info.message === 'object') {
      if (info.message.req) {
        info.prefix = clc.yellow('[REQ]');
        info.message = `${info.message.req.method} ${info.message.req.url} ${info.message.req.ip} ${info.message.req.headers['user-agent']}`;
      } else if (info.message.res) {
        info.prefix = clc.yellow('[RES]');
        info.message = `${info.message.res.statusCode} ${
          info.message.res.statusMessage ?? ''
        } ${info.message.res.getHeader('content-length') || 0}b ${
          info.message.res.getHeader('content-type') || ''
        }`;
      } else if (info.message.err) {
        info.prefix = clc.red('[ERR]');
        info.message = `${info.message.err.name} ${info.message.err.message}`;
      } else info.message = JSON.stringify(info.message, null, 2);
    }
    return info;
  });

  const colors = {
    fatal: clc.red,
    trace: clc.white,
    child: clc.magentaBright,
    info: clc.green,
    error: clc.red,
    warn: clc.yellow,
    debug: clc.magentaBright,
    verbose: clc.cyanBright,
  };

  const logger = winston.createLogger({
    // Define levels required by Fastify (by default winston has verbose level and does not have trace)
    levels: {
      fatal: 0,
      error: 1,
      warn: 2,
      info: 3,
      trace: 4,
      debug: 5,
      child: 6,
    },
    // Setup log level
    level: 'info',
    // Setup logs format
    format: winston.format.combine(
      reqTransform(),
      winston.format.timestamp(),
      winston.format.ms(),
      winston.format.errors({ stack: true }),
      winston.format.prettyPrint(),
      winston.format.printf(
        ({ context, level, timestamp, message, ms, prefix, ...meta }) => {
          if ('undefined' !== typeof timestamp) {
            // Only format the timestamp to a locale representation if it's ISO 8601 format. Any format
            // that is not a valid date string will throw, just ignore it (it will be printed as-is).
            try {
              if (timestamp === new Date(timestamp).toISOString()) {
                timestamp = new Date(timestamp).toLocaleString(undefined, {
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  second: 'numeric',
                });
              }
            } catch (error) {
              // eslint-disable-next-line no-empty
            }
          }

          const color =
            colors[level as keyof typeof colors] || ((text: string) => text);
          const yellow = clc.yellow;

          const stringifiedMeta = JSON.stringify(meta);
          const formattedMeta = inspect(JSON.parse(stringifiedMeta), {
            colors: true,
            depth: null,
          });

          return (
            `${color(`[Nest]`)} ` +
            color(`${process.pid.toString()}  - `) +
            (timestamp !== undefined ? `${timestamp} ` : '') +
            `${color(level.toUpperCase().padStart(7))} ` +
            `${yellow('[' + (context ?? 'App') + ']')}` +
            (prefix ? `${prefix} ` : ' ') +
            `${color(message)}` +
            (formattedMeta && formattedMeta !== '{}'
              ? ` - ${formattedMeta}`
              : '') +
            (ms !== undefined ? ` ${yellow(ms)}` : '')
          );
        },
      ),
      winston.format.align(),
    ),
    // Define transports to write logs, it could be http, file or console
    transports: [new winston.transports.Console()],
  });
  return logger as unknown as FastifyBaseLogger;
}
