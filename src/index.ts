// eslint-disable-next-line import/namespace,import/no-extraneous-dependencies
import { snakeCase } from 'change-case';
import moment from 'moment';
import { type LazyLoggerMessage } from '@graphql-mesh/types';
import { DefaultLogger } from '@graphql-mesh/utils';

enum LogLevel {
    Info = 'INFO',
    Warning = 'WARNING',
    Error = 'ERROR',
    Debug = 'DEBUG',
}

export class JsonLogger extends DefaultLogger {
    log(...args: any[]) {
        this.printJson(LogLevel.Info, args);
    }

    warn(...args: any[]) {
        this.printJson(LogLevel.Warning, args);
    }

    error(...args: any[]) {
        this.printJson(LogLevel.Error, args);
    }

    info(...args: any[]) {
        this.printJson(LogLevel.Info, args);
    }

    debug(...lazyArgs: LazyLoggerMessage[]) {
        this.printJson(LogLevel.Debug, lazyArgs);
    }

    child(name: string): JsonLogger {
        return new JsonLogger(this.name ? `${this.name} - ${name}` : name);
    }

    private printJson(level: string, args: any[]): void {
        let defaultData = {
            level,
            ts: moment().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
            component: snakeCase(this.name ?? 'graphql-mesh'),
            msg: '',
        };

        if (Array.isArray(args) && args.every(arg => typeof arg === 'object' && arg !== null)) {
            for (const arg of args) {
                defaultData = { ...defaultData, ...arg };
            }
        } else if (args) {
            // @ts-expect-error
            const msg = super.getLoggerMessage({ args, trim: true });
            if (this.isJson(msg)) {
                const deserialized = JSON.parse(msg);
                defaultData = { ...defaultData, ...deserialized };
            } else {
                defaultData = { ...defaultData, msg };
            }
        }

        // eslint-disable-next-line no-console
        console.log(JSON.stringify(defaultData));
    }

    private isJson(message: string): boolean {
        try {
            JSON.parse(message);
            return true;
        } catch (e) {
            return false;
        }
    }
}

export default JsonLogger;
